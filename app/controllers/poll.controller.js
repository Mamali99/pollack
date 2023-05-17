const db = require("../models");
const { body, validationResult } = require('express-validator');
const Poll = db.polls;
const Poll_setting = db.polls_settings;
const Poll_option = db.polls_options;
const Token = db.tokens;
const Fixed_option = db.fixed_options;
const crypto = require("crypto");
const Vote = db.votes;

const pollValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
  // body('options.*.text').notEmpty().withMessage('Option text is required'),
  // body('setting.worst').isBoolean().withMessage('Worst should be a boolean value'),
  // body('setting.deadline').isISO8601().withMessage('Deadline should be a valid ISO 8601 date format'),
];


const addPoll = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(405).json({ code: 405, message: 'Invalid input' });
  }

  let pollBody = {
    title: req.body.title,
    description: req.body.description,
    options: req.body.options,
    setting: req.body.setting,
    fixed: req.body.fixed
  }

  try {
    const poll = await Poll.create({
      title: pollBody.title,
      description: pollBody.description,
    })

    const poll_options = await Promise.all(
      pollBody.options.map(option => Poll_option.create({
        text: option.text,
        poll_id: poll.id,
      }))
    );

    let poll_setting;

if (pollBody.setting) {
  poll_setting = await Poll_setting.create({
    voices: pollBody.setting.voices,
    worst: pollBody.setting.worst,
    deadline: pollBody.setting.deadline,
    poll_id: poll.id
  })
}

if (pollBody.fixed && Array.isArray(pollBody.fixed) && pollBody.fixed.length > 0) {
  // Check if the 'voices' attribute is '0'
  if (poll_setting && poll_setting.voices === 0) {
    // If 'voices' is '0', allow creating as many 'fixed_option' entries as there are options
    const fixedOptions = await Promise.all(pollBody.fixed.map(optionId => {
      const matchingOption = poll_options.find(option => option.id === optionId);
      if (matchingOption) {
        return Fixed_option.create({
          poll_id: poll.id,
          option_id: matchingOption.id,
          pollId: poll.id
        });
      } else {
        throw new Error(`Fixed option with id ${optionId} does not match any created poll option.`);
      }
    }));
  } else if (pollBody.fixed.includes(0)) {
    // Create a 'Fixed_option' with just a 'poll_id'
    await Fixed_option.create({
      poll_id: poll.id,
    });
  } else {
    // Check if the number of fixed options exceeds 'voices' in 'poll_setting'
    if (poll_setting && pollBody.fixed.length > poll_setting.voices) {
      throw new Error(`The number of fixed options exceeds the number of allowed voices.`);
    } else {
      // Create a 'Fixed_option' for each value in 'fixed', linking it to the corresponding 'poll_option' and 'poll'
      const fixedOptions = await Promise.all(pollBody.fixed.map(optionId => {
        const matchingOption = poll_options.find(option => option.id === optionId);
        if (matchingOption) {
          return Fixed_option.create({
            poll_id: poll.id,
            option_id: matchingOption.id,
            pollId: poll.id
          });
        } else {
          throw new Error(`Fixed option with id ${optionId} does not match any created poll option.`);
        }
      }));
    }
  }
}


    // Generate a random string for the admin link and share link
    const adminTokenValue = crypto.randomBytes(16).toString("hex");
    const shareTokenValue = crypto.randomBytes(16).toString("hex");

    // Create tokens for the admin link and share link
    const adminToken = await Token.create({
      link: "admin", //!link korregieren
      value: adminTokenValue,
      poll_id: poll.id,
      token_type: "admin"
    })

    const shareToken = await Token.create({
      link: "share", //!link korregieren
      value: shareTokenValue,
      poll_id: poll.id,
      token_type: "share"
    })

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


// Create and Save new Polls
// const addPoll = async (req, res) => {
//   // Check for validation errors
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(405).json({ code: 405, message: 'Invalid input' });
//   }

//   let pollBody = {
//     title: req.body.title,
//     description: req.body.description,
//     options: req.body.options,
//     setting: req.body.setting,
//     fixed: req.body.fixed
//   }

//   try {
//     const poll = await Poll.create({
//       title: pollBody.title,
//       description: pollBody.description,
//     })

//     const poll_options = await Promise.all(
//       pollBody.options.map(option => Poll_option.create({
//         text: option.text,
//         poll_id: poll.id,
//       }))
//     );

//     const poll_setting = await Poll_setting.create({
//       voices: pollBody.setting.voices,
//       worst: pollBody.setting.worst,
//       deadline: pollBody.setting.deadline,
//       poll_id: poll.id
//     })

//     if (pollBody.fixed && Array.isArray(pollBody.fixed) && pollBody.fixed.length > 0) {
//       // Check if the 'fixed' attribute contains '0'
//       if (pollBody.fixed.includes(0)) {
//         // Create a 'Fixed_option' with just a 'poll_id'
//         await Fixed_option.create({
//           poll_id: poll.id,
//         });
//       } else {
//         // Check if the number of fixed options exceeds 'voices' in 'poll_setting'
//         if (pollBody.fixed.length > pollBody.setting.voices) {
//           throw new Error(`The number of fixed options exceeds the number of allowed voices.`);
//         } else {
//           // Create a 'Fixed_option' for each value in 'fixed', linking it to the corresponding 'poll_option' and 'poll'
//           const fixedOptions = await Promise.all(pollBody.fixed.map(optionId => {
//             const matchingOption = poll_options.find(option => option.id === optionId);
//             if (matchingOption) {
//               return Fixed_option.create({
//                 poll_id: poll.id,
//                 option_id: matchingOption.id,
//                 pollId: poll.id
//               });
//             } else {
//               throw new Error(`Fixed option with id ${optionId} does not match any created poll option.`);
//             }
//           }));
//         }
//       }
//     }
//     // Generate a random string for the admin link and share link
//     const adminTokenValue = crypto.randomBytes(16).toString("hex");
//     const shareTokenValue = crypto.randomBytes(16).toString("hex");

//     // Create tokens for the admin link and share link
//     const adminToken = await Token.create({
//       link: "admin", //!link korregieren
//       value: adminTokenValue,
//       poll_id: poll.id,
//       token_type: "admin"
//     })

//     const shareToken = await Token.create({
//       link: "share", //!link korregieren
//       value: shareTokenValue,
//       poll_id: poll.id,
//       token_type: "share"
//     })

//     res.status(200).send({
//       admin: {
//         link: "admin",
//         value: adminToken.value
//       },
//       share: {
//         link: "share",
//         value: shareToken.value
//       }
//     });

//   } catch (error) {
//     res.status(500).send({
//       code: 500,
//       message: 'Internal server error'
//     });
//   }
// };

const pollUpdateValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
  body('options.*.id').isInt().withMessage('Option id is required and should be an integer'),
  body('options.*.text').notEmpty().withMessage('Option text is required'),
  body('setting.voices').isInt({ min: 1 }).withMessage('Voices should be an integer greater than 0'),
  body('setting.worst').isBoolean().withMessage('Worst should be a boolean value'),
  body('setting.deadline').isISO8601().withMessage('Deadline should be a valid ISO 8601 date format'),
  body('fixed').isArray({ min: 1 }).withMessage('At least one fixed option is required'),
  body('fixed.*').isInt().withMessage('Fixed option should be an integer'),
];


const updatePoll = async (req, res) => {
  const tokenValue = req.params.token;
  const pollBody = req.body;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(405).json({ code: 405, message: 'Invalid input' });
  }

  try {
    const token = await Token.findOne({
      where: { value: tokenValue, token_type: "admin" }
    });
    console.log(token)

    if (!token) {
      res.status(404).send({ code: 404, message: "Poll not found." });
      return;
    }

    const pollId = token.poll_id;
    console.log(pollId)

    await Poll.update({
      title: pollBody.title,
      description: pollBody.description
    }, {
      where: { id: pollId }
    });

    await Poll_setting.update({
      voices: pollBody.setting.voices,
      worst: pollBody.setting.worst,
      deadline: pollBody.setting.deadline
    }, {
      where: { poll_id: pollId }
    });
    let existingOptions = await Poll_option.findAll({ where: { poll_id: pollId } });

    let existingOptionsMap = new Map();
    existingOptions.forEach(option => existingOptionsMap.set(option.id, option));



    for (let option of pollBody.options) {
      let existingOption = existingOptionsMap.get(option.id);

      if (existingOption) {
        // Update the existing option
        await existingOption.update({ text: option.text });

        // Remove the option from the map
        existingOptionsMap.delete(option.id);
      } else {
        // Create a new option
        await Poll_option.create({
          text: option.text,
          poll_id: pollId,
        });
      }
    }
    for (let remainingOption of existingOptionsMap.values()) {
      await remainingOption.destroy();
    }

    let existingFixedOptions = await Fixed_option.findAll({ where: { poll_id: pollId } });

    // First, destroy all existing fixed options for this poll
    await Fixed_option.destroy({ where: { poll_id: pollId } });

    if (pollBody.fixed && Array.isArray(pollBody.fixed) && pollBody.fixed.length > 0) {
      // Check if the 'fixed' attribute contains '0'
      if (!pollBody.fixed.includes(0)) {
        // Check if the number of fixed options exceeds 'voices' in 'poll_setting'
        if (pollBody.fixed.length > pollBody.setting.voices) {
          throw new Error(`The number of fixed options exceeds the number of allowed voices.`);
        } else {
          // Create a 'Fixed_option' for each value in 'fixed', linking it to the corresponding 'poll_option' and 'poll'
          for (let optionId of pollBody.fixed) {
            const pollOption = await Poll_option.findOne({ where: { id: optionId, poll_id: pollId } });
            if (!pollOption) {
              throw new Error(`Poll option with id ${optionId} does not exist.`);
            }
            await Fixed_option.create({
              poll_id: pollId,
              option_id: optionId,
            });
          }
        }
      }
    }

    res.status(200).send({ code: 200, message: "i. O." });

  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: "Internal server error" });
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
          model: db.polls_settings,
          as: 'setting',
        },
        {
          model: db.fixed_options,
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
      // Add the vote to the voted array in all cases
      groups[groupId].voted.push(vote.user_id);
      // If the vote is marked as worst, also add it to the worst array
      if (vote.worst) {
        groups[groupId].worst.push(vote.user_id);
      }
      return groups;
    }, {});


    // Fetch options and append votes
    const options = await db.polls_options.findAll({
      where: { poll_id: pollId },
    });

    const formattedOptions = options.map((option) => {
      const optionVotes = votesByOption[option.id] || { voted: [], worst: [] };
      return {
        id: option.id,
        text: option.text,
        voted: optionVotes.voted,
        worst: optionVotes.worst,
      };
    });

    res.status(200).send({
      poll: {
        body: {
          title: poll.title,
          description: poll.description,
          options: poll.options.map((option) => ({
            id: option.id,
            text: option.text,
          })),
          setting: poll.setting,
          fixed: (!poll.fixed || poll.fixed.includes(null))
            ? [0]
            : poll.fixed.map((fixedOption) => fixedOption.option_id || 0),
        },
        share: {
          link: "share",
          value: token.value,
        },
      },
      participants: participants.map((participant) => ({ name: participant.name })),
      options: formattedOptions,
    });

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