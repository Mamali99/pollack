
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AddPoll from './pages/AddPoll';
import Header from './components/Header'
import AddVote from './pages/AddVote';
import Poll from './pages/Poll';
import Vote from './pages/Vote';
import PollDetail from './pages/PollDetail'
import PollUpdate from './pages/PollUpdate';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import VoteUpdate from './pages/VoteUpdate';

function App() {
  return (
    <Router>
      <Header />
      <Container style={{ paddingTop: '15px', paddingBottom: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/poll' element={<Poll/>} />
          <Route path='/vote' element={<Vote/>} />
          <Route path='/poll/:token' element={<PollDetail />} />
          <Route path="/poll-update/:adminToken/:shareToken" element={<PollUpdate />} />
          <Route path="/addPoll" element={<AddPoll />} />
          <Route path="/addVote/:token" element={<AddVote />} />
          <Route path="/updateVote/:token" element={<VoteUpdate />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

