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
import { useParams } from 'react-router-dom';

function VoteUpdate() {
  const { token } = useParams();
  const [ownerName, setOwnerName] = useState('');
  const [poll, setPoll] = useState(null);
  const [choices, setChoices] = useState([]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVote = async () => {
      try {
        const res = await axios.get(`http://localhost:49715/vote/lack/${token}`);
        setOwnerName(res.data.vote.owner.name);
        setPoll(res.data.poll.body);
        setChoices(res.data.vote.choice);
        console.log(res)
      } catch (error) {
        console.error(error);
        setError('An error occurred while fetching the vote details.');
      }
    };
    fetchVote();
  }, [token]);

  const handleOptionChange = (event, option) => {
    if (event.target.checked) {
      setChoices([...choices, { id: option.id, worst: false }]);
    } else {
      setChoices(choices.filter(choice => choice.id !== option.id));
    }
  };

  const handleWorstChange = (event, option) => {
    if (event.target.checked) {
      setChoices(choices.map(choice => choice.id === option.id ? {...choice, worst: true} : choice));
    } else {
      setChoices(choices.map(choice => choice.id === option.id ? {...choice, worst: false} : choice));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const res = await axios.put(`http://localhost:49715/vote/lack/${token}`, {
        owner: { name: ownerName },
        choice: choices,
      });
      setResponse(res.data);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('An error occurred while updating the vote.');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Update Vote</h1>
      <form onSubmit={handleSubmit}>
        {poll && poll.options.map(option => (
          <div key={option.id}>
            <label>
              <input 
                type="checkbox" 
                checked={choices.some(choice => choice.id === option.id)}
                onChange={(event) => handleOptionChange(event, option)}
              />
              {option.text}
            </label>
            {poll.setting && poll.setting.worst && (
              <label>
                <input
                  type="checkbox"
                  checked={choices.some(choice => choice.id === option.id && choice.worst)}
                  onChange={(event) => handleWorstChange(event, option)}
                />
                Mark as worst
              </label>
            )}
          </div>
        ))}
        <button type="submit">Update Vote</button>
      </form>
      {response && <div>Vote updated successfully</div>}
    </div>
  );
}

export default VoteUpdate;
