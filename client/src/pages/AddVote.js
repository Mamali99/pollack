
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, Container, Col, Modal } from 'react-bootstrap';

function AddVote() {
  const { token } = useParams();
  const [ownerName, setOwnerName] = useState('');
  const [poll, setPoll] = useState(null);
  const [choices, setChoices] = useState([]);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate(); // import useNavigate hook
  const [showModal, setShowModal] = useState(false); // modal state

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await axios.get(`http://localhost:49715/poll/lack/${token}`);
        setPoll(res.data);
        setChoices(res.data.poll.body.options.map(option => ({ ...option, isSelected: false, worst: false })));
        console.log(res.data)
      } catch (error) {
        console.error(error);
      }
    };
    fetchPoll();
  }, [token]);

  // Handle closing of modal
  const handleClose = () => {
    setShowModal(false);
    navigate('/'); // navigate back to home after modal closes
  }


  const handleChoiceChange = (id, value, field) => {
    const newChoices = choices.map((choice) => {
      if (choice.id === id) {
        if (field === 'worst' && !choice.isSelected && value) {
          alert('You must select the option first before marking it as worst.');
          return { ...choice, worst: false };
        }
        return { ...choice, [field]: value };
      }
      return choice;
    });
    setChoices(newChoices);
    console.log(newChoices);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedChoices = choices.filter(({ isSelected }) => isSelected);

    if (poll.poll.body.setting.voices && selectedChoices.length > poll.poll.body.setting.voices) {
      alert('You have selected more choices than allowed.');
      return;
    }

    const voteData = {
      owner: {
        name: ownerName,
      },
      choice: choices
        .filter(({ isSelected }) => isSelected)
        .map(({ id, worst }) => ({ id, worst })),
    };

    console.log(voteData)

    try {
      const res = await axios.post(`http://localhost:49715/vote/lack/${token}`, voteData);
      setResponse(res.data);
      setShowModal(true); // show modal on successful response

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Col lg={6}>
        <Card className="mb-4">
          <Card.Body>
            <Card.Title className="text-center mb-4">Add a new vote</Card.Title>
            {poll ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="ownerName">
                  <Form.Label>Owner Name:</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter your name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </Form.Group>
                <Card.Text>
                  <strong>{poll.poll.body.title}</strong>
                  <p>{poll.poll.body.description}</p>
                  <p>
                    You can select up to{' '}
                    {poll.poll.body.setting.voices || 'unlimited'}{' '}
                    {poll.poll.body.setting.voices === 1 ? 'choice' : 'choices'}.
                  </p>
                </Card.Text>
                {choices.map((option) => (
                  <Card style={{ marginBottom: '10px' }} key={option.id}>
                    <Card.Body>
                      <Form.Group style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Check
                          type="checkbox"
                          label={option.text}
                          style={{ marginRight: '10px' }}
                          checked={option.isSelected}
                          onChange={(e) => handleChoiceChange(option.id, e.target.checked, 'isSelected')}
                        />
                        {poll.poll.body.setting.worst && (
                          <Form.Check
                            type="checkbox"
                            label="Worst"
                            checked={option.worst}
                            onChange={(e) => handleChoiceChange(option.id, e.target.checked, 'worst')}
                          />
                        )}
                      </Form.Group>
                    </Card.Body>
                  </Card>
                ))}

                <Button variant="primary" type="submit" block>
                  Submit
                </Button>
              </Form>
            ) : (
              <p>Loading poll data...</p>
            )}
          </Card.Body>
        </Card>
        {response && (
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Vote submitted successfully</Modal.Title>
            </Modal.Header>
            <Modal.Body>Edit link: {response.edit.link}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Col>
    </Container>
  );
}

export default AddVote;
