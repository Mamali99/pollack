
const router = require("express").Router();
const {addPoll, getPollStatistics, updatePoll, 
        deletePoll, pollValidationRules, getPollList,
        pollUpdateValidationRules} = require("../app/controllers/poll.controller.js");


router.post("/lack",pollValidationRules, addPoll);

router.get("/lack/pollList", getPollList);

router.get("/lack/:token", getPollStatistics);

router.put("/lack/:token",pollUpdateValidationRules, updatePoll);

router.delete("/lack/:token", deletePoll);



module.exports = router;