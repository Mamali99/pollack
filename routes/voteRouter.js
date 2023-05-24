
const voteRouter = require("express").Router();
const {addVote, findVote, updateVote, deleteVote,voteValidationRules} = require("../app/controllers/vote.controller");


voteRouter.post("/lack/:token",voteValidationRules, addVote);

voteRouter.get("/lack/:token", findVote);

voteRouter.put("/lack/:token", updateVote);

voteRouter.delete("/lack/:token", deleteVote);

module.exports = voteRouter;