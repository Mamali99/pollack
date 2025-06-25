# Pollack: Polling App with Node.js, Sequelize, and React

Pollack is a full-stack web application for creating, managing, and voting on polls. It features a Node.js/Express backend with Sequelize ORM for MySQL database management, and a React-based frontend.

## Features

- **Create and manage polls** with multiple options
- **Vote on polls** with secure token-based or user authentication
- **View poll results** in real time
- **Relational data modeling** using Sequelize (One-to-Many and advanced associations)
- **RESTful API** for poll, vote, and user management
- **Modern React frontend** with Bootstrap styling

## Project Structure

```
.
├── app/                  # Backend models and configuration
│   └── models/           # Sequelize models and relationships
├── client/               # React frontend app (Create React App)
├── routes/               # Express route handlers (polls, votes, etc.)
├── server.js             # Express server entry point
├── package.json          # Backend dependencies and scripts
└── client/package.json   # Frontend dependencies and scripts
```

## Technology Stack

- **Backend**: Node.js, Express.js, Sequelize ORM, MySQL
- **Frontend**: React, React-Bootstrap, Axios
- **Other**: CORS, Express Validator, Nodemon

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MySQL database

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   - Edit the database settings in `app/config/db.config.js` to match your MySQL setup.

3. **Start the backend server:**
   ```bash
   npm start
   ```
   The server will run on [http://localhost:8080](http://localhost:8080) by default.

### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```
   The frontend will run on [http://localhost:3000](http://localhost:3000).

## Database Models and Relationships

Key entities include:

- **User**
- **Poll**
- **PollOption**
- **PollSetting**
- **Vote**
- **Token**

Polls have one setting and many options. Votes are associated with users and poll options. Tokens can be used for secure voting.

The relationships are configured in `app/models/index.js` using Sequelize associations.

## API Endpoints

- `GET /poll` - List polls
- `POST /poll` - Create a poll
- `GET /poll/:id` - Get poll details
- `POST /vote` - Submit a vote
- ...and more (see `routes/` for full details)

## Customization & Deployment

- Update CORS origin in `server.js` if deploying frontend and backend separately.
- Customize or extend models and routes as needed for your use case.

## Credits

- Based on tutorials by [bezkoder](https://bezkoder.com/sequelize-associate-one-to-many/)
- Created by [Mamali99](https://github.com/Mamali99)
