const db = require("../models");
const { body, validationResult } = require('express-validator');
const Poll = db.polls;
const Poll_setting = db.polls_settings;
const Poll_option = db.polls_options;
const Token = db.tokens;
const Fixed_option = db.fixed_options;
const crypto = require("crypto");
const Vote = db.votes;

// Function to format date to remove trailing "Z"
const formatDateTime = (date) => {
  return date ? date.toISOString().slice(0,19) : new Date().toISOString().slice(0,19);
};

const pollValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
];


const addPoll = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(405).json({ code: 405, message: 'Invalid input' });
  }

  const { title, description, options, setting, fixed } = req.body;

  try {
    const poll = await Poll.create({
      title,
      description,
    });

    const pollOptions = await Promise.all(
      options.map(option => Poll_option.create({ id: option.id, text: option.text, poll_id: poll.id }))
    );

    let pollSetting;
    if (setting) {
      pollSetting = await Poll_setting.create({
        ...setting,
        poll_id: poll.id
      });
    }

    if (fixed && Array.isArray(fixed) && fixed.length > 0 && fixed[0] !== null && fixed[0] !== 0) {
      if (pollSetting && pollSetting.voices === 0) {
        const fixedOptions = await Promise.all(fixed.map(optionId => createFixedOption(poll, pollOptions, optionId)));
      } else if (fixed.includes(0)) {
        let fixed_option = await Fixed_option.create({
          poll_id: poll.id,
        });
      } else {
        if (pollSetting && fixed.length > pollSetting.voices) {
          throw new Error(`The number of fixed options exceeds the number of allowed voices.`);
        } else {
          const fixedOptions = await Promise.all(fixed.map(optionId => createFixedOption(poll, pollOptions, optionId)));
        }
      }
    }

    const adminTokenValue = crypto.randomBytes(16).toString("hex");
    const shareTokenValue = crypto.randomBytes(16).toString("hex");

    const adminToken = await Token.create({
      link: "admin",
      value: adminTokenValue,
      poll_id: poll.id,
      token_type: "admin"
    });

    const shareToken = await Token.create({
      link: "share",
      value: shareTokenValue,
      poll_id: poll.id,
      token_type: "share"
    });

    res.status(200).send({
      admin: {
        link: "admin",
        value: adminToken.value
      },
      share: {
        link: "share",
        value: shareToken.value
      }
    });

  } catch (error) {
    res.status(500).send({
      code: 500,
      message: 'Internal server error'
    });
  }
};

async function createFixedOption(poll, pollOptions, optionId) {
  const matchingOption = pollOptions.find(option => option.id === optionId);
  if (matchingOption) {
    return Fixed_option.create({
      poll_id: poll.id,
      option_id: matchingOption.id,
    });
  } else {
    throw new Error(`Fixed option with id ${optionId} does not match any created poll option.`);
  }
}


const pollUpdateValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
];


const updatePoll = async (req, res) => {
  const tokenValue = req.params.token;
  // const pollBody = req.body;
  const { title, description, options, setting, fixed } = req.body;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(405).json({ code: 405, message: 'Invalid input' });
  }


  try {
    const token = await Token.findOne({
      where: { value: tokenValue, token_type: "admin" }
    });

    if (!token) {
      res.status(404).send({ code: 404, message: "Poll not found." });
      return;
    }

    const pollId = token.poll_id;
    let poll = await Poll.findByPk(pollId);
    if (!poll) {
      return res.status(404).json({ code: 404, message: 'Poll not found' });
    }

    // Update poll's title and description
    poll.title = title;
    poll.description = description || poll.description;
    await poll.save();

    // Update poll's options
    for (const option of options) {
      let pollOption = await Poll_option.findOne({ where: { poll_id: pollId, id: option.id } });
      if (pollOption) {
        pollOption.id = option.id;
        pollOption.text = option.text;
        await pollOption.save();
      } else {
        await Poll_option.create({
          id: option.id,
          text: option.text,
          poll_id: poll.id,
        });
      }
    }

    // Update poll's settings
    if (setting) {
      let pollSetting = await Poll_setting.findOne({ where: { poll_id: pollId } });
      if (pollSetting) {
        pollSetting.voices = setting.voices || pollSetting.voices;
        pollSetting.worst = setting.worst || pollSetting.worst;
        pollSetting.deadline = setting.deadline || pollSetting.deadline;
        await pollSetting.save();
      } else {
        await Poll_setting.create({
          ...setting,
          poll_id: poll.id
        });
      }
    }

    // Update fixed options
    if (fixed && Array.isArray(fixed) && fixed.length > 0 && fixed[0] !== 0) {
      await Fixed_option.destroy({ where: { poll_id: pollId } });

      if (setting && setting.voices === 0) {
        await Promise.all(fixed.map(optionId => createFixedOption(poll, options, optionId)));
      } else if (fixed.includes(0)) {
        await Fixed_option.create({
          poll_id: poll.id,
        });
      } else {
        if (setting && fixed.length > setting.voices) {
          throw new Error(`The number of fixed options exceeds the number of allowed voices.`);
        } else {
          await Promise.all(fixed.map(optionId => createFixedOption(poll, options, optionId)));
        }
      }
    }

    res.status(200).json({
      code: 200,
      message: 'Poll updated successfully'
    });

  } catch (error) {
    res.status(500).send({
      code: 500,
      message: 'Internal server error'
    });
  }
};



const deletePoll = async (req, res) => {
  const tokenValue = req.params.token;

  try {
    const token = await Token.findOne({
      where: {
        value: tokenValue,
        token_type: 'admin',
      },
    });

    if (!token) {
      return res.status(400).send({
        code: 400,
        message: 'Invalid poll admin token.',
      });
    }

    const pollId = token.poll_id;

    // Fetch the poll options associated with the poll
    const pollOptions = await Poll_option.findAll({ where: { poll_id: pollId } });

    // Extract the ids of the poll options
    const pollOptionIds = pollOptions.map(option => option.id);

    // Delete votes where the option_id is in pollOptionIds
    await Vote.destroy({ where: { poll_option_id: pollOptionIds } });
    await Poll_option.destroy({ where: { poll_id: pollId } });
    await Poll_setting.destroy({ where: { poll_id: pollId } });
    await Token.destroy({ where: { poll_id: pollId } });
    await Fixed_option.destroy({ where: { poll_id: pollId } });
    await Poll.destroy({ where: { id: pollId } });

    res.status(200).send({
      code: 200,
      message: 'i. O.',
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      code: 404,
      message: 'Poll not found.',
    });
  }
};


const getPollStatistics = async (req, res) => {
  const tokenValue = req.params.token;

  try {
    const token = await Token.findOne({
      where: { value: tokenValue, token_type: "share" },
    });

    if (!token) {
      res.status(404).send({ code: 404, message: "Poll not found." });
      return;
    }

    const pollId = token.poll_id;

    const poll = await db.polls.findOne({
      where: { id: pollId },
      include: [
        {
          model: db.polls_options,
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

    // Fetch participants and their votes
    const participants = await db.users.findAll({
      where: {
        id: {
          [db.Sequelize.Op.in]: db.sequelize.literal(`(SELECT DISTINCT user_id FROM votes WHERE poll_id = ${pollId})`),
        },
      },
      raw: true,
    });

    // Fetch votes
    const votes = await db.votes.findAll({
      where: { poll_id: pollId },
      raw: true,
    });

    // Group votes by option
    const votesByOption = votes.reduce((groups, vote) => {
      const groupId = vote.poll_option_id;
      if (!groups[groupId]) {
        groups[groupId] = {
          voted: [],
          worst: [],
        };
      }
      groups[groupId].voted.push(vote.user_id);
      if (vote.worst) {
        groups[groupId].worst.push(vote.user_id);
      }
      return groups;
    }, {});

    const formattedOptions = poll.options.map((option) => {
      const optionVotes = votesByOption[option.id] || { voted: [], worst: [] };

      // Check if 'voted' and 'worst' arrays are empty, and if so, set them to contain a single '0'
      if (optionVotes.voted.length === 0) {
        optionVotes.voted = [];
      }
      if (optionVotes.worst.length === 0) {
        optionVotes.worst = [];
      }

      return {
        voted: optionVotes.voted,
        worst: optionVotes.worst,
      };
    });

    // Prepare optional fields
    let optionalFields = {
      description: poll.description || poll.description === "" ? null : poll.description,
      setting: {
        voices: poll.setting && poll.setting.voices ? poll.setting.voices : null,
        // worst: poll.setting && poll.setting.worst ? poll.setting.worst : 0,
        worst: poll.setting ? Boolean(poll.setting.worst) : false, // Converted to boolean
        deadline: poll.setting && poll.setting.deadline ? new Date(poll.setting.deadline).toISOString() : null,
      },
      fixed: poll.fixed && poll.fixed.length > 0 ? poll.fixed.map((fixedOption) => fixedOption.option_id || 0).filter(id => id !== 0) : []
    
    };

    // The response body
    const responseBody = {
      poll: {
        body: {
          title: poll.title,
          options: poll.options.map((option) => ({
            id: option.id,
            text: option.text,
          })),
          ...optionalFields,
        },
        share: {
          link: "share",
          value: token.value,
        },
      },
      participants: participants.length ? participants.map((participant) => ({ name: participant.name })) : [],
      options: formattedOptions,
    };

    res.status(200).send(responseBody);

  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: "Internal server error" });
  }
};




const getPollList = async (req, res) => {
  try {
    const polls = await Poll.findAll({
      include: [
        {
          model: Poll_setting,
          as: 'setting',
        },
        {
          model: Poll_option,
          as: 'options',
        },
        {
          model: Token,
          as: 'tokens',
        },
        {
          model: Fixed_option, // Include the fixed options
          as: 'fixed',
        },
      ],
    });

    const formattedPolls = polls.map(poll => ({
      poll: {
        body: {
          title: poll.title,
          description: poll.description,
          options: poll.options.map(option => ({
            id: option.id,
            text: option.text,
          })),
          setting: poll.setting,
          fixed: poll.fixed.map(fixedOption => fixedOption.option_id), // Map over the fixed options to get their IDs
        },
        tokens: poll.tokens.map(token => ({
          link: token.link,
          value: token.value,
        })),
      },
    }));

    res.status(200).send(formattedPolls);
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: "Internal server error" });
  }
};

module.exports = {
  addPoll, updatePoll, deletePoll, getPollStatistics,
  pollValidationRules, getPollList, pollUpdateValidationRules
}