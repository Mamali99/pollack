// import React from 'react'

// function VoteUpdate() {
//   return (
//     <div>VoteUpdate</div>
//   )
// }

// export default VoteUpdate
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

// function VoteUpdate() {
//   const { token } = useParams();
//   const [ownerName, setOwnerName] = useState('');
//   const [poll, setPoll] = useState(null);
//   const [choices, setChoices] = useState([]);
//   const [response, setResponse] = useState(null);

//   useEffect(() => {
//     const fetchVote = async () => {
//       try {
//         const res = await axios.get(`http://localhost:49715/vote/lack/${token}`);
//         setOwnerName(res.data.vote.owner.name);
//         setPoll(res.data.poll.body);
//         setChoices(res.data.vote.choice);
//         console.log(res)
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     fetchVote();
//   }, [token]);


//   const handleOptionChange = (event, option) => {
//   if (event.target.checked) {
//     setChoices([...choices, { id: option.id, worst: false }]);
//   } else {
//     setChoices(choices.filter(choice => choice.id !== option.id));
//   }
// };

// const handleSubmit = async (event) => {
//     event.preventDefault();

//     try {
//       const res = await axios.put(`http://localhost:49715/vote/lack/${token}`, {
//         owner: { name: ownerName },
//         choice: choices,
//       });
//       setResponse(res.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };


//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         {poll && poll.options.map(option => (
//           <label key={option.id}>
//             <input 
//               type="checkbox" 
//               checked={choices.some(choice => choice.id === option.id)}
//               onChange={(event) => handleOptionChange(event, option)}
//             />
//             {option.text}
//           </label>
//         ))}
//         <button type="submit">Update Vote</button>
//       </form>
//     </div>
//   );
// }

// export default VoteUpdate;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, Container, Col, Modal  } from 'react-bootstrap';

function VoteUpdate() {
  const { token } = useParams();
  const [ownerName, setOwnerName] = useState('');
  const [poll, setPoll] = useState(null);
  const [choices, setChoices] = useState([]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const fetchVote = async () => {
      try {
        const res = await axios.get(`http://localhost:49715/vote/lack/${token}`);
        setOwnerName(res.data.vote.owner.name);
        setPoll(res.data.poll.body);
        setChoices(res.data.vote.choice);
      } catch (error) {
        console.error(error);
        setError('An error occurred while fetching the vote details.');
        setShowErrorModal(true);
      }
    };
    fetchVote();
  }, [token]);


const handleOptionChange = (id, isChecked, field) => {
  let newChoices = [...choices]; // create a copy of the choices array

  // find choice in array
  let choiceIndex = newChoices.findIndex(choice => choice.id === id);

  if (choiceIndex !== -1) { // If choice is found
    if(isChecked) {
      // If checkbox is checked, just update the field
      newChoices[choiceIndex][field] = isChecked;
    } else {
      // If checkbox is unchecked, remove the choice from array
      newChoices = newChoices.filter(choice => choice.id !== id);
    }
  } else if(isChecked) { // If choice is not found and checkbox is checked
    // Check if adding a new choice would exceed the limit
    if (poll.setting.voices === 0 || poll.setting.voices === null || newChoices.length < poll.setting.voices) {
      // Add new choice to the array with both fields set to false initially
      let newChoice = { id: id, isSelected: false, worst: false };
      // Update the field that corresponds to the checkbox that was checked
      newChoice[field] = isChecked;
      newChoices.push(newChoice);
    } else {
      alert(`You can only select up to ${poll.setting.voices} choices.`);
      return;
    }
  }

  setChoices(newChoices);
};
const handleClose = () => {
  setShowSuccessModal(false);
  setShowErrorModal(false);
  navigate('/'); // navigate back to home after modal closes
}

  
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await axios.put(`http://localhost:49715/vote/lack/${token}`, {
        owner: { name: ownerName },
        choice: choices,
      });
      setResponse(res.data);
      setError(null);
      setShowSuccessModal(true);
      // navigate('/');
    } catch (error) {
      setError('An error occurred while updating the vote.');
      setShowErrorModal(true);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Col lg={6}>
        <Card className="mb-4">
          <Card.Body>
            <Card.Title className="text-center mb-4">Update your vote</Card.Title>
            {poll ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="ownerName">
                  <Form.Label>Owner Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter your name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </Form.Group>
                <Card.Text>
                  <strong>{poll.title}</strong>
                  <p>{poll.description}</p>
                  <p>
                    You can select up to{' '}
                    {poll.setting.voices || 'unlimited'}{' '}
                    {poll.setting.voices === 1 ? 'choice' : 'choices'}.
                  </p>
                </Card.Text>
                {
                  poll.options.map((option) => (
                    <Form.Group key={option.id}>
                      <Form.Check
                        type="checkbox"
                        label={option.text}
                        checked={choices.some(choice => choice.id === option.id)}
                        onChange={(e) => handleOptionChange(option.id, e.target.checked, 'isSelected')}
                      />
                      {poll.setting && poll.setting.worst && (
                        <Form.Check
                          type="checkbox"
                          label="Worst"
                          checked={choices.some(choice => choice.id === option.id && choice.worst)}
                          onChange={(e) => handleOptionChange(option.id, e.target.checked, 'worst')}
                        />
                      )}
                    </Form.Group>
                  ))
                }
                <Button variant="primary" type="submit" block>
                  Update Vote
                </Button>
              </Form>
            ) : (
              <p>Loading vote data...</p>
            )}
          </Card.Body>
        </Card>
        <Modal show={showSuccessModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Vote updated successfully.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showErrorModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Container>
  );
}

export default VoteUpdate;
