const db = require("../models");
const User = db.users;
const Vote = db.votes;
const Poll = db.polls;
const Poll_option = db.polls_options;
const Token = db.tokens;
const Poll_setting = db.polls_settings;
const crypto = require("crypto");

//Add a new vote to the poll
const addVote = async (req, res) => {
  const tokenValue = req.params.token;
  const { owner, choice } = req.body;

  try {
    const token = await Token.findOne({ where: { value: tokenValue, token_type: "share" } });

    if (!token) {
      return res.status(404).json({ code: 404, message: 'Token not found' });
    }

    const poll = await Poll.findByPk(token.poll_id);

    if (!poll) {
      return res.status(404).json({ code: 404, message: 'Poll not found' });
    }

    const user = await User.create({
      name: owner.name
    });

    const votePromises = choice.map(({ id, worst }) =>
      Vote.create({
        user_id: user.id,
        poll_option_id: id,
        poll_id: poll.id,
        worst: worst || false,
      })
    );
    const votes = await Promise.all(votePromises);

     // Generate a random string for the edit token for user
     const editTokenValue = crypto.randomBytes(16).toString("hex");
     

     // Create tokens for the admin link and share link
     const editToken = await Token.create({
         link: "edit",
         value: editTokenValue,
         poll_id: poll.id,
         token_type: "edit",
         user_id: user.id
     })

    res.status(200).json({
      description: 'The result after creating a vote.',
      edit: {
        link: '/vote/edit/' + editTokenValue,
        value: editTokenValue,
      },
    });
  } catch (error) {
    console.error('Error in addVote:', error);
    res.status(405).json({ code: 405, message: 'Invalid input' });
  }
};

// Find the vote of the token
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

    res.status(200).json({
      poll: {
        body: {
          title: poll.title,
          description: poll.description,
          options: poll.options,
          setting: poll.setting,
          fixed: poll.fixed,
        },
        share: {
          link: 'string',
          value: tokenValue,
        },
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
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in findVote:', error);
    res.status(405).json({ code: 405, message: 'Invalid input' });
  }
};


//Update a vote of the token
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

    const votePromises = choice.map(async ({ id, worst }) => {
      let vote = await Vote.findOne({
        where: { user_id: user.id, poll_option_id: id, poll_id: poll.id },
      });
    
      if (!vote) {
        // Check if a vote with the same user_id, poll_id, and different poll_option_id exists
        const existingVote = await Vote.findOne({
          where: { user_id: user.id, poll_id: poll.id },
        });
    
        if (existingVote) {
          // If an existing vote is found, delete it before creating a new one
          await existingVote.destroy();
        }
    
        // Create a new vote
        vote = await Vote.create({
          user_id: user.id,
          poll_id: poll.id,
          poll_option_id: id,
          worst: worst || false,
        });
      } else {
        // Update the existing vote
        await vote.update({ worst: worst || false });
      }
    
      return vote;
    });
    

    const updatedVotes = await Promise.all(votePromises);

    if (updatedVotes.some(vote => vote === null)) {
      return res.status(404).json({ code: 404, message: 'Vote not found' });
    }

    res.status(200).json({ code: 200, message: 'Vote updated successfully' });
  } catch (error) {
    console.error('Error in updateVote:', error);
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

    const deletePromises = votes.map(vote => vote.destroy());
    await Promise.all(deletePromises);

    res.status(200).json({ code: 200, message: 'Vote deleted successfully' });
  } catch (error) {
    console.error('Error in deleteVote:', error);
    res.status(405).json({ code: 405, message: 'Invalid input' });
  }
};


module.exports = { addVote, findVote, updateVote, deleteVote }