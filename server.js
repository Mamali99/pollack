const db = require("./app/models");
const express = require("express");
const cors = require("cors");
const app = express();


const corOptions = {
  origin: 'http://localhost:3000' 
}



// Middlewares
app.use(cors(corOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true}))


//routers
const router = require("./routes/pollRouter");
app.use("/poll", router);
const voteRouter = require("./routes/voteRouter");
app.use("/vote", voteRouter);


// PORT
const PORT = process.env.PORT || 49715;


//test
app.get("/", (req, res)=>{
  res.send("Hello")
  console.log("test");
})


// Server
app.listen(PORT, ()=>{
  console.log(`The server is running on port ${PORT}`);
})
