const db = require("../models");
const User = db.users;
const Vote = db.votes;
const Poll = db.polls;
const Poll_option = db.polls_options;
const Token = db.tokens;
const Poll_setting = db.polls_settings;
const Fixed_option = db.fixed_options;
const crypto = require("crypto");
const { body, validationResult } = require('express-validator');

const voteValidationRules = [
  body('owner').notEmpty().withMessage('Owner is required'),
  body('owner.name').notEmpty().withMessage('Owner name is required'),
  body('choice').isArray({ min: 1 }).withMessage('At least one choice is required'),
  body('choice.*.id').isInt().withMessage('Choice id is required and should be an integer'),
  body('choice.*.worst').optional().isBoolean().withMessage('If provided, choice worst should be a boolean'),
];


// Add a new vote to the poll
const addVote = async (req, res) => {
  const tokenValue = req.params.token;
  const { owner, choice } = req.body;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const token = await Token.findOne({ where: { value: tokenValue, token_type: "share" } });
    if (!token) {
      throw new Error('Token not found');
    }

    const poll = await Poll.findByPk(token.poll_id);
    if (!poll) {
      const error = new Error('Poll not found');
      error.code = 404;
      throw error;
    }

    const pollSettings = await Poll_setting.findOne({ where: { poll_id: poll.id } });



    if (pollSettings && pollSettings.voices !== undefined) {
      if (pollSettings.voices === 1 && choice.length > 1) {
        throw new Error("The number of votes does not fit.");
      } else if (pollSettings.voices > 1 && choice.length > pollSettings.voices) {
        throw new Error('The number of votes does not fit.');
      }
    }


    if (pollSettings && pollSettings.worst !== true && choice.some(c => c.worst === true)) {
      throw new Error('Setting "worst" is disabled for this poll.');
    }

    if (pollSettings && pollSettings.deadline && new Date() > new Date(pollSettings.deadline)) {
      throw new Error('Voting deadline has passed.');
    }

    let user = await User.findOne({ where: { name: owner.name } });



    if (!user) {
      user = await User.create({
        name: owner.name
      });
    }

    const pollOptionIds = await Poll_option.findAll({ where: { poll_id: poll.id }, attributes: ['id'] }).map(option => option.id);

    if (pollSettings) {
      for (const { id, worst } of choice) {
        if (!pollOptionIds.includes(id)) {
          throw new Error(`Invalid option id: ${id}`);
        }

        if (worst != null && pollSettings.worst === 0 && worst) {
          throw new Error(`Setting "worst" is disabled for this poll.`);
        }
      }
    }

    const votePromises = choice.map(({ id, worst }) =>
      Vote.create({
        user_id: user.id,
        poll_option_id: id,
        poll_id: poll.id,
        worst: worst || false,
      })
    );
    await Promise.all(votePromises);

    // Generate a random string for the edit token for user
    const editTokenValue = crypto.randomBytes(16).toString("hex");

    // Create tokens for the admin link and share link
    await Token.create({
      link: "edit",
      value: editTokenValue,
      poll_id: poll.id,
      token_type: "edit",
      user_id: user.id
    });
    res.status(201).json({
      edit: {
        link: '/vote/edit/' + editTokenValue,
        value: editTokenValue,
      },
    });
  } catch (error) {
    res.status(error.code || 500).json({ code: error.code || 500, message: error.message });
  }
};


const findVote = async (req, res) => {
  const tokenValue = req.params.token;

  try {
    const token = await Token.findOne({ where: { value: tokenValue, token_type: "edit" } });

    if (!token) {
      return res.status(404).json({ code: 404, message: 'Token not found' });
    }

    const poll = await Poll.findByPk(token.poll_id, {
      include: [
        {
          model: Poll_option,
          as: 'options',
        },
        {
          model: Poll_setting,
          as: 'setting',
        },
        {
          model: Fixed_option,
          as: 'fixed',
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({ code: 404, message: 'Poll not found' });
    }

    const user = await User.findByPk(token.user_id);

    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }

    const votes = await Vote.findAll({ where: { user_id: user.id, poll_id: poll.id } });

    const shareToken = await Token.findOne({ where: { poll_id: poll.id, token_type: "share" } });

    // Create the base voteInfo object in the desired order
    let voteInfo = {
      poll: {
        body: {
          title: poll.title,
          options: poll.options.map(option => ({
            id: option.id,
            text: option.text
          })),
        },
        share: {
          link: '/vote/lack/' + shareToken.value,
          value: shareToken.value,
        }
      },
      vote: {
        owner: {
          name: user.name,
        },
        choice: votes.map(vote => ({
          id: vote.poll_option_id,
          worst: vote.worst,
        })),
      },
      time: undefined,
    };

    // Assign optional fields if they exist
    if (poll.description) {
      voteInfo.poll.body.description = poll.description;
    }
    if (poll.setting) {
      voteInfo.poll.body.setting = {
        voices: poll.setting.voices,
        worst: poll.setting.worst,
        deadline: poll.setting.deadline
      };
    }
    if (poll.fixed && poll.fixed.length) {
      voteInfo.poll.body.fixed = poll.fixed.map(option => option && option.option_id ? option.option_id : 0);
    }

    res.status(200).json(voteInfo);
  } catch (error) {
    res.status(405).json({ code: 405, message: 'Invalid input' });
  }
};



const updateVote = async (req, res) => {

  const tokenValue = req.params.token;
  const { owner, choice } = req.body;

  try {
    const token = await Token.findOne({ where: { value: tokenValue, token_type: "edit" } });

    if (!token) {
      return res.status(404).json({ code: 404, message: 'Token not found' });
    }

    const poll = await Poll.findByPk(token.poll_id);

    if (!poll) {
      return res.status(404).json({ code: 404, message: 'Poll not found' });
    }

    const user = await User.findOne({ where: { name: owner.name } });

    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }

    // Fetch all existing votes
    const existingVotes = await Vote.findAll({
      where: { user_id: user.id, poll_id: poll.id },
    });

    // Filter out the votes that are no longer in the choice
    const votesToDelete = existingVotes.filter((vote) => {
      return !choice.some(({ id }) => vote.poll_option_id === id);
    });

    // Delete the votes that are no longer in the choice
    const deletePromises = votesToDelete.map((vote) => vote.destroy());
    await Promise.all(deletePromises);


    // Update the 'worst' field for existing votes that are still in the choice
    const votesToUpdate = existingVotes.filter((vote) => {
      return choice.some(({ id }) => vote.poll_option_id === id);
    });

    const updatePromises = votesToUpdate.map((vote) => {
      const { id, worst } = choice.find(({ id }) => vote.poll_option_id === id);
      vote.worst = worst || false;
      return vote.save();
    });

    await Promise.all(updatePromises);

    // Create new votes for choices that didn't exist before
    const newVotesToCreate = choice.filter(({ id }) => {
      return !existingVotes.some((vote) => vote.poll_option_id === id);
    });

    const createPromises = newVotesToCreate.map(({ id, worst }) => {
      return Vote.create({
        user_id: user.id,
        poll_id: poll.id,
        poll_option_id: id,
        worst: worst || false,
      });
    });

    await Promise.all(createPromises);




    res.status(200).json({ code: 200, message: 'i. O.' });
  } catch (error) {
    res.status(405).json({ code: 405, message: 'Invalid input' });
  }
};

// Delete a vote of the token
const deleteVote = async (req, res) => {
  const tokenValue = req.params.token;

  try {
    const token = await Token.findOne({ where: { value: tokenValue, token_type: "edit" } });

    if (!token) {
      return res.status(404).json({ code: 404, message: 'Token not found' });
    }

    const user = await User.findByPk(token.user_id);

    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }

    const votes = await Vote.findAll({ where: { user_id: user.id, poll_id: token.poll_id } });

    if (votes.length === 0) {
      return res.status(404).json({ code: 404, message: 'No votes found for the user' });
    }

    const deleteVotesPromises = votes.map(vote => vote.destroy());
    await Promise.all(deleteVotesPromises);

    // After all votes are deleted, delete the user and token.
    await user.destroy();
    await token.destroy();



    res.status(200).json({ code: 200, message: 'i. O.' });
  } catch (error) {
    res.status(405).json({ code: 405, message: 'Invalid input' });
  }
};



module.exports = { addVote, findVote, updateVote, deleteVote, voteValidationRules }