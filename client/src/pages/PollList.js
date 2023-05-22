// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, Button, Container, Row, Col } from 'react-bootstrap';

// function PollList() {
//   const [polls, setPolls] = useState([]);

//   useEffect(() => {
//     fetchPolls();
//   }, []);

//   const fetchPolls = () => {
//     axios.get('http://localhost:8080/poll/lack/pollList')
//       .then(response => {
//         setPolls(response.data);
//         console.log(response.data)
//       })
//       .catch(error => {
//         console.error('There was an error retrieving the poll data!', error);
//       });
//   }

//   const deletePoll = (token) => {
//     axios.delete(`http://localhost:8080/poll/lack/${token}`)
//       .then(response => {
//         fetchPolls();  // Refresh the polls after a successful delete
//       })
//       .catch(error => {
//         console.error('There was an error deleting the poll!', error);
//       });
//   }

//   const findToken = (tokens, link) => {
//     const token = tokens.find(token => token.link === link);
//     return token ? token.value : null;
//   }

//   return (
//     <Container>
//       <h1 className="text-center my-3">existing poll list</h1>
//       <Row>
//         {polls.map((pollItem, index) => (
//           <Col md={6} lg={4} key={index} className="mb-4">
//             <Card>
//               <Card.Header as="h5">{pollItem.poll.body.title}</Card.Header>
//               <Card.Body>
//                 <Card.Title>{pollItem.poll.body.description}</Card.Title>
//                 {pollItem.poll.body.options.map((option, i) => (
//                   <Card.Text key={i}>{option.text}</Card.Text>
//                 ))}
//                 <Card.Text><strong>Deadline:</strong> {new Date(pollItem.poll.body.setting.deadline).toLocaleString()}</Card.Text>
//                  <Button variant="primary" href={`/poll/${findToken(pollItem.poll.tokens, 'share')}`}>Go to Poll</Button>
//                 <Button variant="secondary" className="ml-2" href={`/poll-update/${findToken(pollItem.poll.tokens, 'admin')}/${findToken(pollItem.poll.tokens, 'share')}`}>Update Poll</Button>
//                 <Button variant="danger" className="ml-2" onClick={() => deletePoll(findToken(pollItem.poll.tokens, 'admin'))}>Delete Poll</Button>
            
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </Container>
//   )
// }

// export default PollList;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPoll, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';


function PollList() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = () => {
    axios.get('http://localhost:49715/poll/lack/pollList')
      .then(response => {
        setPolls(response.data);
        console.log(response.data)
      })
      .catch(error => {
        console.error('There was an error retrieving the poll data!', error);
      });
  }

  const deletePoll = (token) => {
    axios.delete(`http://localhost:49715/poll/lack/${token}`)
      .then(response => {
        fetchPolls();  // Refresh the polls after a successful delete
      })
      .catch(error => {
        console.error('There was an error deleting the poll!', error);
      });
  }

  const findToken = (tokens, link) => {
    const token = tokens.find(token => token.link === link);
    return token ? token.value : null;
  }

  const isPollFinished = (pollItem) => {
    return pollItem.poll.body.fixed.some(number => number > 0);
  }

  return (
    // <Container>
    //   <h1 className="text-center my-3">Existing Poll List</h1>
    //   <Row>
    //     {polls.map((pollItem, index) => (
    //       <Col md={6} lg={4} key={index} className="mb-4">
    //         <Card>
    //           <Card.Header as="h5">{pollItem.poll.body.title}</Card.Header>
    //           <Card.Body>
    //             <Card.Title>{pollItem.poll.body.description}</Card.Title>
    //             {pollItem.poll.body.options.map((option, i) => (
    //               <Card.Text key={i}>{option.text}</Card.Text>
    //             ))}
    //             <Card.Text><strong>Deadline:</strong> {new Date(pollItem.poll.body.setting.deadline).toLocaleString()}</Card.Text>
    //             <Card.Text><strong>Status:</strong> {isPollFinished(pollItem) ? "Finished" : "Active"}</Card.Text>
    //             <Button variant="primary" href={`/poll/${findToken(pollItem.poll.tokens, 'share')}`}>Go to Poll</Button>
    //             <Button variant="secondary" className="ml-2" href={`/poll-update/${findToken(pollItem.poll.tokens, 'admin')}/${findToken(pollItem.poll.tokens, 'share')}`}>Update Poll</Button>
    //             <Button variant="danger" className="ml-2" onClick={() => deletePoll(findToken(pollItem.poll.tokens, 'admin'))}>Delete Poll</Button>
    //           </Card.Body>
    //         </Card>
    //       </Col>
    //     ))}
    //   </Row>
    // </Container>
<Container>
  <Row>
    {polls.map((pollItem, index) => (
      <Col md={6} lg={4} key={index} className="mb-4">
        <Card className="shadow p-3 mb-5 bg-white rounded h-100 d-flex flex-column justify-content-between">
          <div>
            <Card.Header as="h5" className="font-weight-bold text-dark">{pollItem.poll.body.title}</Card.Header>
            <Card.Body>
              <Card.Title as="h6" className="font-weight-bold">{pollItem.poll.body.description}</Card.Title>
              {pollItem.poll.body.options.map((option, i) => (
                <Card.Text key={i}><strong>Option {i+1}:</strong> {option.text}</Card.Text>
              ))}
              {pollItem.poll.body.setting && pollItem.poll.body.setting.deadline && 
              <Card.Text><strong>Deadline:</strong> {new Date(pollItem.poll.body.setting.deadline).toLocaleString()}</Card.Text>
              }
              <Card.Text><strong>Status:</strong> {isPollFinished(pollItem) ? "Finished" : "Active"}</Card.Text>
            </Card.Body>
          </div>
          <div className="d-flex justify-content-between">
            <Button variant="primary" href={`/poll/${findToken(pollItem.poll.tokens, 'share')}`}><FontAwesomeIcon icon={faPoll} /> </Button>
            <Button variant="secondary" href={`/poll-update/${findToken(pollItem.poll.tokens, 'admin')}/${findToken(pollItem.poll.tokens, 'share')}`}><FontAwesomeIcon icon={faEdit} /></Button>
            <Button variant="danger" onClick={() => deletePoll(findToken(pollItem.poll.tokens, 'admin'))}><FontAwesomeIcon icon={faTrash} /></Button>
          </div>
        </Card>
      </Col>
    ))}
  </Row>
</Container>




  )
}

export default PollList;
