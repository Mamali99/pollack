// import React, { useState } from 'react';
// import { Button, Form, Col, Row, Container, Modal } from 'react-bootstrap';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';


// function AddPoll() {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [options, setOptions] = useState([{ id: 1, text: '' }, { id: 2, text: '' }]);
//   const [setting, setSetting] = useState({ voices: 1, worst: false, deadline: '' });
//   const [fixed, setFixed] = useState([0]);
//   const [showModal, setShowModal] = useState(false);
//   const [response, setResponse] = useState(null);
//   const navigate = useNavigate();

//   const handleClose = () => {
//     setShowModal(false);
//     navigate('/');
//   };

//   const handleOptionChange = (index, value) => {
//     const updatedOptions = [...options];
//     updatedOptions[index].text = value;
//     setOptions(updatedOptions);
//   };

//   const addOption = () => {
//     setOptions([...options, { id: options.length + 1, text: '' }]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const pollData = {
//       title,
//       description,
//       options,
//       setting,
//       fixed,
//     };

//     try {
//       const response = await axios.post('http://localhost:8080/poll/lack', pollData);
//       // After the successful POST request, update the response state and show the modal
//       setResponse({
//         admin: { link: response.data.admin.link, value: response.data.admin.value },
//         share: { link: response.data.share.link, value: response.data.share.value },
//       });
//       setShowModal(true);

//     } catch (error) {
//       console.error(error);
//     }
//   };


//   return (
//     <Container>
//     <Form onSubmit={handleSubmit}>
//       <Form.Group controlId="title">
//         <Form.Label>Title</Form.Label>
//         <Form.Control
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Enter poll title"
//         />
//       </Form.Group>

//       <Form.Group controlId="description">
//         <Form.Label>Description</Form.Label>
//         <Form.Control
//           type="text"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           placeholder="Enter poll description"
//         />
//       </Form.Group>

//       <Form.Group>
//         <Form.Label>Options</Form.Label>
//         {options.map((option, index) => (
//         <Form.Group key={option.id} controlId={`option${index}`}>
//           <Form.Label>Option {index + 1}</Form.Label>
//           <Form.Control
//             type="text"
//             placeholder={`Option ${index + 1}`}
//             value={option.text}
//             onChange={(e) => handleOptionChange(index, e.target.value)}
//           />
//         </Form.Group>
//       ))}

//       <Button variant="secondary" onClick={addOption}>
//         Add Option
//       </Button>
//       </Form.Group>

//       <Row>
//         <Col>
//           <Form.Group controlId="voices">
//             <Form.Label>Voices</Form.Label>
//             <Form.Control
//               type="number"
//               value={setting.voices}
//               onChange={(e) => setSetting({ ...setting, voices: parseInt(e.target.value) })}
//             />
//           </Form.Group>
//         </Col>
//         <Col>
//           <Form.Group controlId="worst">
//             <Form.Label>Worst</Form.Label>
//             <Form.Check
//               type="checkbox"
//               checked={setting.worst}
//               onChange={(e) => setSetting({ ...setting, worst: e.target.checked })}
//             />
//           </Form.Group>
//         </Col>
//         <Col>
//           <Form.Group controlId="deadline">
//             <Form.Label>Deadline</Form.Label>
//             <Form.Control
//               type="datetime-local"
//               value={setting.deadline}
//               onChange={(e) => setSetting({ ...setting, deadline: e.target.value })}
//             />
//           </Form.Group>
//         </Col>
//       </Row>

//       <Form.Group controlId="fixed">
//         <Form.Label>Fixed</Form.Label>
//         <Form.Control
//           type="text"
//           value={fixed.join(',')}
//           onChange={(e) => setFixed(e.target.value.split(',').map((x) => parseInt(x)))}
//           placeholder="Enter fixed indices separated by commas"
//           />
//           </Form.Group>
//           <Button variant="primary" type="submit">
//     Create Poll
//   </Button>
// </Form>
// <Modal show={showModal} onHide={handleClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Poll Created</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {response && (
//             <>
//               <p>
//                 <p>Admin token: <b>{response.admin.value}</b></p>
//               </p>
//               <p>

//                 <p>Share token: <b>{response.share.value}</b></p>
//               </p>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
// </Container>
// );
// }
// export default AddPoll;

//! Die Validation für optionale Fälder und Defaulwerte muss noch gemacht werden
import React, { useState } from 'react';
import { Button, Form, Col, Row, Container, Modal, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddPoll() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([{ id: 182, text: '' }, { id: 183, text: '' }]);
  const [setting, setSetting] = useState({ voices: 1, worst: false, deadline: '0000-00-00T00:00:00.000Z' });
  const [fixed, setFixed] = useState([0]);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();

  const handleClose = () => {
    setShowModal(false);
    navigate('/');
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index].text = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([...options, { id: options.length + 1, text: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
         // Check if all options are filled
    if (options.some((option) => option.text === '')) {
      alert('Please fill all options');
      return;
    }

    // Check if voices is a valid number
    if (isNaN(setting.voices) || setting.voices < 1) {
      alert('Please input a valid number of voices');
      return;
    }
    // Check if fixed options are valid and replace empty with [0]
    let validatedFixed = fixed;
    if ((fixed.length === 1 && fixed[0] === 0)) {
      validatedFixed = [0];
    } else {
      const uniqueFixed = Array.from(new Set(fixed));
      if (uniqueFixed.some(id => id < 1 || id > options.length)) {
        alert('Fixed options should be unique and correspond to valid options');
        return;
      }
    }

    const pollData = {
      title,
      description,
      options,
      setting,
      fixed: validatedFixed,
    };

    try {
      const response = await axios.post('http://localhost:49715/poll/lack', pollData);
      setResponse({
        admin: { link: response.data.admin.link, value: response.data.admin.value },
        share: { link: response.data.share.link, value: response.data.share.value },
      });
      setShowModal(true);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header as="h5">Poll Details</Card.Header>
          <Card.Body>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter poll title"
              />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter poll description"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header as="h5">Options</Card.Header>
          <Card.Body>
            {options.map((option, index) => (
              <Form.Group key={option.id} controlId={`option${index}`}>
                <Form.Label>Option {index + 1}</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </Form.Group>
            ))}
            <Button variant="secondary" onClick={addOption}>
              Add Option
            </Button>
          </Card.Body>
        </Card>

        <Card className="mb-4">


          <Card.Header as="h5">Settings</Card.Header>
          <Card.Body>
            <Row>
              <Col>
                <Form.Group controlId="voices">
                  <Form.Label>Voices</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    value={setting.voices}
                    onChange={(e) => setSetting({ ...setting, voices: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="worst">
                  <Form.Label>Worst</Form.Label>
                  <Form.Check
                    type="checkbox"
                    checked={setting.worst}
                    onChange={(e) => setSetting({ ...setting, worst: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="deadline">
                  <Form.Label>Deadline</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={setting.deadline}
                    onChange={(e) => setSetting({ ...setting, deadline: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header as="h5">Fixed</Card.Header>
          <Card.Body>
            <Form.Group controlId="fixed">
              <Form.Label>Fixed</Form.Label>
              <Form.Control
                type="text"
                value={fixed.join(',')}
                onChange={(e) => setFixed(e.target.value.split(',').map((x) => parseInt(x)))}
                placeholder="Enter fixed indices separated by commas"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Button variant="primary" type="submit" className="mt-3">
          Create Poll
        </Button>
      </Form>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Poll Created</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {response && (
            <>
              <p>Admin token: <b>{response.admin.value}</b></p>
              <p>Share token: <b>{response.share.value}</b></p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AddPoll;

