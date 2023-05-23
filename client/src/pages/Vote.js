
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button, Form, Card, Container, Row, Col, Badge } from 'react-bootstrap';
// import axios from 'axios';

// function Vote() {
//   const [token, setToken] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     navigate(`/addVote/${token}`);
//   };

//   const handleSubmitDelete = (e)=>{
//     e.preventDefault();
//     axios
//       .delete(`http://localhost:49715/vote/lack/${token}`)
//       .then(response => {
//         alert(response.data.message);
//       })
//       .catch(error => {
//         console.error('There was an error deleting the vote!', error);
//         alert('There was an error deleting the vote!');
//       });
//   }
//   const handleSubmitUpdate = (e) => {
//     e.preventDefault();
//     navigate(`/updateVote/${token}`);

//   }

//   return (
//     <Container fluid>
//       <Row className="justify-content-center mt-5">
//         <Col xs={12} md={6} lg={4}>
//           <Card className="shadow">
//             <Card.Header as="h5" className="text-center bg-primary text-white">
//               <Badge variant="light">Voting Portal</Badge>
//             </Card.Header>
//             <Card.Body>
//               <Form onSubmit={handleSubmit}>
//                 <Form.Group controlId="formToken">
//                   <Form.Label>Share/Edit Token</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter share/edit token"
//                     value={token}
//                     onChange={(e) => setToken(e.target.value)}
//                     required
//                   />
//                   <Form.Text className="text-muted">
//                     Please enter the token you received for/from voting.
//                   </Form.Text>
//                 </Form.Group>
//                 <Button type="submit" variant="primary" block>
//                   Start Voting
//                 </Button>

//               </Form>
//               <Form onSubmit={handleSubmitDelete}>
//                 <Button type="submit" variant="danger" block>
//                   Delete Vote
//                 </Button>
//               </Form>
//               <Form onSubmit={handleSubmitUpdate}>
//                 <Button type="submit" variant="danger" block>
//                   Update Vote
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//     </Container>
//   )
// }

// export default Vote;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button, Form, Card, Container, Row, Col, Badge } from 'react-bootstrap';
// import axios from 'axios';

// function Vote() {
//   const [token, setToken] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     navigate(`/addVote/${token}`);
//   };

//   const handleSubmitDelete = (e) => {
//     e.preventDefault();
//     axios
//       .delete(`http://localhost:49715/vote/lack/${token}`)
//       .then(response => {
//         alert(response.data.message);
//       })
//       .catch(error => {
//         console.error('There was an error deleting the vote!', error);
//         alert('There was an error deleting the vote!');
//       });
//   };

//   const handleSubmitUpdate = (e) => {
//     e.preventDefault();
//     navigate(`/updateVote/${token}`);
//   }

//   return (
//     <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
//       <Col xs={12} md={6} lg={4}>
//         <Card className="shadow">
//           <Card.Header className="text-center" style={{ backgroundColor: '#007bff' }}>
//             <Card.Title className="text-white">
//               <Badge variant="light">Voting Portal</Badge>
//             </Card.Title>
//           </Card.Header>
//           <Card.Body>
//             <Form onSubmit={handleSubmit}>
//               <Form.Group controlId="formToken">
//                 <Form.Label>Share/Edit Token</Form.Label>
//                 <Form.Control
//                   required
//                   type="text"
//                   placeholder="Enter share/edit token"
//                   value={token}
//                   onChange={(e) => setToken(e.target.value)}               
//                 />
//                 <Form.Text className="text-muted">
//                   Please enter the token you received for/from voting.
//                 </Form.Text>
//               </Form.Group>
//               <Button type="submit" variant="primary" block className="mb-3">
//                 Start Voting
//               </Button>
//             </Form>
//             <Form onSubmit={handleSubmitDelete}>
//               <Button type="submit" variant="danger" block className="mb-3">
//                 Delete Vote
//               </Button>
//             </Form>
//             <Form onSubmit={handleSubmitUpdate}>
//               <Button type="submit" variant="warning" block className="mb-3">
//                 Update Vote
//               </Button>
//             </Form>
//           </Card.Body>
//         </Card>
//       </Col>
//     </Container>
//   );
// }

// export default Vote;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Container, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';

function Vote() {
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token) {
      navigate(`/addVote/${token}`);
    }
  };

  const handleSubmitDelete = (e) => {
    e.preventDefault();
    if (token) {
      axios
        .delete(`http://localhost:49715/vote/lack/${token}`)
        .then(response => {
          alert(response.data.message);
        })
        .catch(error => {
          console.error('There was an error deleting the vote!', error);
          alert('There was an error deleting the vote!');
        });
    }
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (token) {
      navigate(`/updateVote/${token}`);
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Col xs={12} md={6} lg={4}>
        <Card className="shadow">
          <Card.Header className="text-center" style={{ backgroundColor: '#007bff' }}>
            <Card.Title className="text-white">
              <Badge variant="light">Voting Portal</Badge>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Form.Group controlId="formToken">
              <Form.Label>Share/Edit Token</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter share/edit token"
                value={token}
                onChange={(e) => setToken(e.target.value)}               
              />
              <Form.Text className="text-muted">
                Please enter the token you received for/from voting.
              </Form.Text>
            </Form.Group>
            <Form onSubmit={handleSubmit}>
              <Button type="submit" variant="primary" block className="mb-3">
                Start Voting
              </Button>
            </Form>
            <Form onSubmit={handleSubmitDelete}>
              <Button type="submit" variant="danger" block className="mb-3">
                Delete Vote
              </Button>
            </Form>
            <Form onSubmit={handleSubmitUpdate}>
              <Button type="submit" variant="warning" block className="mb-3">
                Update Vote
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}

export default Vote;
