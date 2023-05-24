import React, { useState, useEffect } from 'react';
import { Button, Form, Col, Row, Container, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';


function PollUpdate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([{ id: 1, text: '' }, { id: 2, text: '' }]);
  const [setting, setSetting] = useState({
    voices: 0,
    worst: false,
    deadline: null
  });
  const [fixed, setFixed] = useState([0]);
  const [participants, setParticipants] = useState([]);
  const [votedOptions, setVotedOptions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();
  const { adminToken, shareToken } = useParams(); // Extracting tokens from URL parameters

  const pollOptionIds = []


  const OptionIdsgenerator = (pollOptionIds) => {
    let newOptionId;
    const generateRandomNumber = () => {
      return Math.floor(100 + Math.random() * 100000);
    };
    do {
      newOptionId = generateRandomNumber();
    } while (pollOptionIds.includes(newOptionId));
    pollOptionIds.push(newOptionId);
    return newOptionId;
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:49715/poll/lack/${shareToken}`);
        setTitle(response.data.poll.body.title);
        setDescription(response.data.poll.body.description);
        // map to only include the necessary fields and ensure the fetched 'id's
        const fetchedOptions = response.data.poll.body.options.map((option) => {
          return { id: option.id, text: option.text };
        });

        setOptions(fetchedOptions);
        // Only keep the necessary fields in 'setting'
        const fetchedSetting = {
          voices: response.data.poll.body.setting.voices,
          worst: response.data.poll.body.setting.worst,
          deadline: response.data.poll.body.setting.deadline,
        };
        setSetting(fetchedSetting);
        // filter out 'null' values and ensure sequential 'id's in 'fixed'
        const fetchedFixed = response.data.poll.body.fixed.map(id => id !== null ? id : 0);
        setFixed(fetchedFixed);

        // Set participants
        const fetchedParticipants = response.data.participants.map(participant => participant.name);
        setParticipants(fetchedParticipants);

        // Set voted options
        const fetchedVotedOptions = response.data.options.map(option => ({ voted: option.voted, worst: option.worst }));
        setVotedOptions(fetchedVotedOptions);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [shareToken]);

  const isOptionChosen = (optionIndex) => {
    if (optionIndex < 0 || optionIndex >= votedOptions.length) {
      console.error(`Option with index ${optionIndex} doesn't exist.`);
      return false;
    }
    
    return votedOptions[optionIndex].voted.length > 0 || votedOptions[optionIndex].worst.length > 0;
  }
  
  
  
  


  const handleClose = () => {
    setShowModal(false);
    navigate('/');
  };

  // const removeOption = (index) => {
  //   // Prevent removing an option if there are only two options
  //   if (options.length <= 2) {
  //     alert('There must be at least two options.');
  //     return;
  //   }

  //   const updatedOptions = [...options];
  //   const removedOptionId = updatedOptions[index].id;
  //   updatedOptions.splice(index, 1);

  //   setOptions(updatedOptions);

  //   // Remove from fixed if it's there
  //   if (fixed.includes(removedOptionId)) {
  //     setFixed(fixed.filter(id => id !== removedOptionId));
  //   }
  // };
  const removeOption = (index) => {
    // Prevent removing an option if there are only two options
    if (options.length <= 2) {
      alert('There must be at least two options.');
      return;
    }
  
    const updatedOptions = [...options];
    const removedOptionId = updatedOptions[index].id;
  
 // Check if this option is chosen by any participant
if (isOptionChosen(index)) {
  const confirmDelete = window.confirm('This option is already chosen by a participant. Are you sure you want to delete it?');
  if (!confirmDelete) {
    return;
  }
}
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
  
    // Remove from fixed if it's there
    if (fixed.includes(removedOptionId)) {
      setFixed(fixed.filter(id => id !== removedOptionId));
    }
  };
  

  const handleOptionChange = (index, value) => {
    // This regex matches any string that does not contain '<' or '>'.
    const regex = /^[^<>]*$/;
    if (regex.test(value)) {
      const updatedOptions = [...options];
      updatedOptions[index].text = value;
      setOptions(updatedOptions);
    } else {
      alert('Invalid characters detected. Please avoid using "<" or ">".');
    }
  };

  const addOption = () => {
    // Only generate a new id if the option doesn't have one
    const newOptionId = OptionIdsgenerator(pollOptionIds);
    setOptions([...options, { id: newOptionId, text: '' }]);
  };

  const handleFixedChange = (id, isChecked) => {
    const existingOption = options.find(option => option.id === id);
    // Use the existing id if the option has one, otherwise generate a new one
    const newOptionId = existingOption?.id || OptionIdsgenerator(pollOptionIds);
    if (isChecked) {
      setFixed([...fixed, newOptionId]);
    } else {
      setFixed(fixed.filter(item => item !== newOptionId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all options are filled
    if (options.some((option) => option.text === '')) {
      alert('Please fill all options');
      return;
    }

    // Check if voices is a valid number
    if (isNaN(setting.voices) || setting.voices < 0) {
      alert('Please input a valid number of voices');
      return;
    }

    // Check if fixed options are valid and replace empty with [0]
    let validatedFixed = fixed;
    if ((fixed[0] === 0) || fixed == null || fixed == undefined) {
      validatedFixed = [0];
    }

    if (fixed[0] !== 0 && fixed.length > setting.voices) {
      alert("you can't select more fixed options than allowed voices... ");
      return;
    }

    if (setting.voices > options.length) {
      alert('the number of allowed voices is more than existing options...');
      return;
    }


    // Check if each participant hasn't voted more than allowed
    const participantVotes = new Array(participants.length).fill(0); // Array to store counts for each participant
    votedOptions.forEach(option => {
      option.voted.forEach(votedIndex => participantVotes[votedIndex]++);
      option.worst.forEach(worstIndex => participantVotes[worstIndex]++);
    });

    const exceededParticipants = participantVotes
      .map((count, index) => (count > setting.voices && setting.voices !== 0 && setting.voices !== null) ? participants[index] : null)
      .filter(participant => participant !== null);

    if (exceededParticipants.length > 0) {
      alert(`These participants have chosen more options than allowed: ${exceededParticipants.join(', ')}`);
      return;
    }


    const pollData = {
      title,
      description,
      options,
      setting,
      fixed: validatedFixed,
    };
    console.log(pollData)

    try {
      const response = await axios.put(`http://localhost:49715/poll/lack/${adminToken}`, pollData);

      if (response.status === 200) {
        setResponse({
          code: response.data.code,
          message: response.data.message,
        });
        setShowModal(true);
      } else {
        setResponse({
          code: response.status,
          message: "Something went wrong. Please try again later.",
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error(error);
      setResponse({
        code: error.response ? error.response.status : 500,
        message: error.response ? error.response.data.message : "Something went wrong. Please try again later.",
      });
      setShowModal(true);
    }
  };


  return (
    <Container className='mt-5'>

      <Form onSubmit={handleSubmit}>

        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
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


        <Form.Group className='mt-5'>
          {/* <Form.Label className='mt-5'>Options</Form.Label> */}
          {options.map((option, index) => (
            <Form.Group key={option.id} controlId={`option${index}`}>
              <Form.Label className='mt-3'>Option {index + 1}</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button variant="danger" onClick={() => removeOption(index)}>X</Button>
                </Col>
              </Row>
            </Form.Group>

          ))}
          <Button variant="secondary" onClick={addOption} className='mt-2'>
            Add Option
          </Button>
        </Form.Group>

        <Row className='mt-4'>
          <Col>
            <Form.Group controlId="voices">
              <Form.Label >Voices</Form.Label>
              <Form.Control
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
                value={setting.deadline ? new Date(setting.deadline).toISOString().slice(0, 16) : ""}
                onChange={(e) => setSetting({ ...setting, deadline: e.target.value ? e.target.value : null })}
              />
            </Form.Group>

          </Col>
        </Row>
        <Form.Group controlId="fixed">
          <Form.Label className='mt-4'>Fixed</Form.Label>
          {(setting.voices > 1 || setting.voices === 0 || setting.voices === null) && options.map((option, index) => (
            <Form.Check
              key={option.id}
              type="checkbox"
              label={`Option ${index + 1}`}
              checked={fixed.includes(option.id)}
              onChange={(e) => handleFixedChange(option.id, e.target.checked)}
            />
          ))}
          {setting.voices === 1 && (
            <Form.Control
              as="select"
              value={fixed[0] || ''}
              onChange={(e) => setFixed([parseInt(e.target.value)])}
            >
              <option value=''>Select an option...</option>
              {options.map((option, index) => (
                <option key={option.id} value={option.id}>{`Option ${index + 1}`}</option>
              ))}
            </Form.Control>
          )}
        </Form.Group>
        <Button variant="primary" type="submit" className='mt-4'>
          Update Poll
        </Button>
      </Form>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Poll Updated</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {response && (
            <>
              <p>
                Message: <b>{response.message}</b>
              </p>
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

export default PollUpdate;

