const db = require("../models");
const { body, validationResult } = require('express-validator');
const Poll = db.polls;
const Poll_setting = db.polls_settings;
const Poll_option = db.polls_options;
const Token = db.tokens;
const Fixed_option = db.fixed_options;
const crypto = require("crypto");
const Vote = db.votes;
const User = db.users;

const pollValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
  body('options.*.id').notEmpty().withMessage('Option id is required'),
  body('options.*.text').notEmpty().withMessage('Option text is required'),
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
        link: "admin", //! Richtige Linke für Frontend nutzen
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
  })}
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
    
// const addPoll = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(405).json({ code: 405, message: 'Invalid input' });
//   }

//   const { title, description, options, setting, fixed } = req.body;
  
  
//   try {
//     const pollResult = await db.sequelize.transaction(async (t) => {
//       const poll = await Poll.create({
//         title,
//         description,
//       }, { transaction: t });
      
//       const pollOptions = await Promise.all(
//         options.map(option => Poll_option.create({ 
//           id: option.id, 
//           text: option.text, 
//           poll_id: poll.id 
//         }, { transaction: t }))
//       );


//       if (setting) {
//         // Check for null or undefined deadline, and set it as null if so
//         if (setting.deadline === null || setting.deadline === undefined) {
//           setting.deadline = null;
//         }
        
//         await Poll_setting.create({
//           ...setting,
//           poll_id: poll.id
//         }, { transaction: t });
//       }
      
//       if (fixed && Array.isArray(fixed) && fixed.length > 0 && fixed[0] !== null && fixed[0] !== 0) {
//         await Promise.all(fixed.map(optionId => createFixedOption(poll, pollOptions, optionId, t)));
//       }

//       const adminTokenValue = crypto.randomBytes(16).toString("hex");
//       const shareTokenValue = crypto.randomBytes(16).toString("hex");

//       await Token.bulkCreate([{
//         link: "admin",
//         value: adminTokenValue,
//         poll_id: poll.id,
//         token_type: "admin"
//       }, {
//         link: "share",
//         value: shareTokenValue,
//         poll_id: poll.id,
//         token_type: "share"
//       }], { transaction: t });

//       return {
//         adminTokenValue,
//         shareTokenValue,
//       };
//     });

//     res.status(200).send({
//       admin: {
//         link: "admin",
//         value: pollResult.adminTokenValue
//       },
//       share: {
//         link: "share",
//         value: pollResult.shareTokenValue
//       }
//     });
//   } catch (error) {
//     res.status(500).send({
//       code: 500,
//       message: 'Internal server error'
//     });
//   }
// };

// async function createFixedOption(poll, pollOptions, optionId, t) {
//   const matchingOption = pollOptions.find(option => option.id === optionId);
//   if (matchingOption) {
//     return Fixed_option.create({
//       poll_id: poll.id,
//       option_id: matchingOption.id,
//     }, { transaction: t });
//   } else {
//     throw new Error(`Fixed option with id ${optionId} does not match any created poll option.`);
//   }
// }


const pollUpdateValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
];

const updatePoll = async (req, res) => {
  const tokenValue = req.params.token;
  const { title, options, description, setting, fixed } = req.body;

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
    poll.description = description !== undefined ? description : null;
    await poll.save();


    let currentOptions = await Poll_option.findAll({ where: { poll_id: pollId } });

    // Update or create options
    for (const option of options) {
      let pollOption = currentOptions.find(opt => opt.id === option.id);
      if (pollOption) {
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

    // Delete options not found in the update request
    for (const option of currentOptions) {
      if (!options.find(opt => opt.id === option.id)) {
        await option.destroy();
      }
    }

    // Fetch existing poll's settings
    let pollSetting = await Poll_setting.findOne({ where: { poll_id: pollId } });

    // If setting exists in the request
    if (setting !== undefined) {
      if (pollSetting) {
        // Update existing settings 
        pollSetting.voices = setting.voices !== undefined ? setting.voices : pollSetting.voices;
        pollSetting.worst = setting.worst !== undefined ? setting.worst : pollSetting.worst;
        pollSetting.deadline = setting.deadline !== undefined ? setting.deadline : pollSetting.deadline;
        await pollSetting.save();
      } else if (setting) {
        // Create new settings
        await Poll_setting.create({
          ...setting,
          poll_id: poll.id
        });

      }
    } else {
      // If setting does not exist in the request, remove existing settings
      if (pollSetting) {
        await pollSetting.destroy();
      }
    }

    // Update fixed options
    if (fixed !== undefined && fixed[0] !== 0) {
      // Update existing or create new fixed options
      for (let optionId of fixed) {
        let fixedOption = await Fixed_option.findOne({ where: { poll_id: pollId, option_id: optionId } });
        if (!fixedOption) {
          await Fixed_option.create({
            poll_id: poll.id,
            option_id: optionId
          });
        } else {
          // If a fixedOption already exists, update it
          await fixedOption.update({ 
            option_id: optionId
          });
        }
      }

      // Find and remove any existing fixed options not in the new list
      let existingFixedOptions = await Fixed_option.findAll({ where: { poll_id: pollId } });
      for (let fixedOption of existingFixedOptions) {
        if (!fixed.includes(fixedOption.option_id)) {
          await fixedOption.destroy();
        }
      }
    } else {
      // If no fixed options provided, delete all existing ones
      await Fixed_option.destroy({ where: { poll_id: pollId } });
    }

      // Remove votes with null poll_option_id
    await Vote.destroy({ where: { poll_option_id: null } });


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

    // Get the votes where the option_id is in pollOptionIds
    const votes = await Vote.findAll({ where: { poll_option_id: pollOptionIds } });

    // Extract the ids of the users who voted
    const userIds = votes.map(vote => vote.user_id);

    // Delete votes where the option_id is in pollOptionIds
    await Vote.destroy({ where: { poll_option_id: pollOptionIds } });

    // Delete users who voted in this poll
    await User.destroy({ where: { id: userIds } });

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

      if (!vote.worst) {
        groups[groupId].voted.push(vote.user_id - 1); // Start from 0
      } else {
        groups[groupId].worst.push(vote.user_id - 1); // Start from 0
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
      description: (!poll.description || poll.description === "") ? null : poll.description, 
      setting: {
        voices: poll.setting && poll.setting.voices ? poll.setting.voices : null,
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
    res.status(500).send({ code: 500, message: "Internal server error" });
  }
};

module.exports = {
  addPoll, updatePoll, deletePoll, getPollStatistics,
  pollValidationRules, getPollList, pollUpdateValidationRules
}