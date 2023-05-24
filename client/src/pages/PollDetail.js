
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, ListGroup, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function PollDetail() {
  const [poll, setPoll] = useState(null);
  const { token } = useParams();  // Get the share token from the URL

  useEffect(() => {
    // Fetch the poll data when the component mounts
    axios.get(`http://localhost:49715/poll/lack/${token}`)
      .then(response => {
        setPoll(response.data);
        console.log(response.data)
      })
      .catch(error => {
        console.error('There was an error retrieving the poll data!', error);
      });
  }, [token]);

  if (!poll) {
    return <div>Loading...</div>;  // Show a loading message while the poll data is being fetched
  }

  // Get the texts of the fixed options
  const fixedOptionTexts = poll.poll.body.fixed.map(fixedOptionId => {
    const correspondingOption = poll.poll.body.options.find(option => option.id === fixedOptionId);
    return correspondingOption ? correspondingOption.text : 'Unknown option';
  });

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h1 className="text-center my-3">{poll.poll.body.title}</h1>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Description</Card.Title>
              <Card.Text>{poll.poll.body.description}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Options</Card.Header>
            <ListGroup variant="flush">
              {poll.poll.body.options.map((option, index) => (
                <ListGroup.Item key={index}>
                  {option.text} - Votes: {poll.options[index].voted.length} - Worst: {poll.options[index].worst.length}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Card className="mb-4">
            <Card.Header>Poll Settings</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                Voices: {
                  poll.poll.body.setting.voices === null ? "All options can be selected" :
                    poll.poll.body.setting.voices === 1 ? "Only one option is allowed" :
                    `${poll.poll.body.setting.voices} options are allowed`
                }
              </ListGroup.Item>
              <ListGroup.Item>
                Worst: {poll.poll.body.setting.worst ? 'True' : 'False'}
              </ListGroup.Item>
              <ListGroup.Item>
                Deadline: {poll.poll.body.setting.deadline ? new Date(poll.poll.body.setting.deadline).toLocaleString() : 'None'}
              </ListGroup.Item>
              <ListGroup.Item>
                Fixed: {fixedOptionTexts.join(', ')}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          <Card className="mb-4">
            <Card.Header>Share Token</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                Link: {poll.poll.share.link}
              </ListGroup.Item>
              <ListGroup.Item>
                Value: {poll.poll.share.value}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          <Card className="mb-4">
            <Card.Header>Participants</Card.Header>
            <ListGroup variant="flush">
              {poll.participants.map((participant, index) => (
                <ListGroup.Item key={index}>
                  {participant.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PollDetail;




