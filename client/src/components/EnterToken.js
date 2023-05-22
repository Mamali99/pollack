import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Container, InputGroup } from 'react-bootstrap';

function EnterToken() {
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/addVote/${token}`);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Card style={{ width: '24rem' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Vote: Give your share token</Card.Title>
          <Form onSubmit={handleSubmit}>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                id="token"
                placeholder="Enter token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </InputGroup>
            <Button type="submit" block>New Vote</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EnterToken;
