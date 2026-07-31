# IMS - API Server

The central Node.js/Express API that serves both the Admin App and the Student Portal.

## Setup
1. Create `.env` file based on `.env.example`.
2. Install dependencies: `npm install`
3. Run server: `npm start`

## Technologies
- Node.js & Express
- Sequelize ORM (PostgreSQL)
- JWT Authentication
- HTTP Proxying to Analytics


You do not have to manually restart anything for normal API code changes. The backend is set up to use nodemon and is linked to your Mac's local folder. This means the moment you save a file (like a controller or route), Docker detects the save and nodemon automatically restarts the server in the background for you. (In fact, when I fixed that syntax error earlier, it auto-restarted instantly without any commands!)

However, there are two exceptions where you do need to run a command:

When you install a new package (npm install ...) Because dependencies are baked into the Docker image, you have to rebuild the container for it to pick up the new package. Command:

bash
cd server && docker-compose up -d --build nodeapp
If Docker Desktop glitches (Mac specific issue) Sometimes on a Mac, Docker Desktop can suddenly stop syncing file saves between your local computer and the container. If you save a file but the API isn't updating, you can force it to quickly reboot. Command:

bash
docker restart server-nodeapp-1