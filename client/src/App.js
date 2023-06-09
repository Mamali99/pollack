import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AddPoll from './pages/AddPoll';
import Header from './components/Header'
import AddVote from './pages/AddVote';
import ShowPolls from './pages/ShowPolls';
import Poll from './pages/Poll';
import Vote from './pages/Vote';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/poll' element={<Poll/>} />
        <Route path='/vote' element={<Vote/>} />
        <Route path="/addPoll" element={<AddPoll />} />
        <Route path="/addVote/:token" element={<AddVote />} />
        <Route path="/showPolls" element={<ShowPolls />} />
      </Routes>
    </Router>
  );
}

export default App;
