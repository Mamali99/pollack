// import React from 'react';
// import { Container, Button, Card } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import PollList from './PollList';

// function Poll() {
//   return (
//     <Container className="mt-5">
//       <Card className="text-center">
//         <Card.Header as="h2">Poll</Card.Header>
//         <Card.Body>
//           <Link to='/addPoll'>
//             <Button variant="primary" size="lg">Create New Poll</Button>
//           </Link>
//           <hr/>
//           <Container className="mt-4">
//             <PollList />
//           </Container>
//         </Card.Body>
//       </Card>
//     </Container>
//   )
// }

// export default Poll;
import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PollList from './PollList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';


function Poll() {
  return (
    <Container className="mt-5">
      <Card className="text-center shadow p-3 mb-5 bg-white rounded">
        <Card.Header className="display-4">Poll</Card.Header>
        <Card.Body>
          <Link to='/addPoll' className="btn btn-lg btn-primary d-flex align-items-center justify-content-center">
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2"/> 
            
          </Link>
          <hr/>
          <Container className="mt-4">
            <PollList />
          </Container>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Poll;
