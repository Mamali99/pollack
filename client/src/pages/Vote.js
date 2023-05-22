
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Container, Row, Col, Badge } from 'react-bootstrap';

function Vote() {
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/addVote/${token}`);
  };

  return (
    <Container fluid>
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow">
            <Card.Header as="h5" className="text-center bg-primary text-white">
              <Badge variant="light">Voting Portal</Badge>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formToken">
                  <Form.Label>Share Token</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter share token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Please enter the token you received for voting.
                  </Form.Text>
                </Form.Group>
                <Button type="submit" variant="primary" block>
                  Start Voting
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
    </Container>
  )
}

export default Vote;

