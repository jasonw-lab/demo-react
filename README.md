# demo-react

## Photo Gallery Application

This is a photo gallery application built with Next.js. It allows users to upload, view, edit, and delete photos, as well as organize them into folders.

## Build Process

The build process generates separate assets for frontend and backend:

### Frontend Assets
- Located in `/photo-gallary/out/` after running the build script
- These are static files that can be served by nginx
- Includes HTML, CSS, JavaScript, and other static assets

### Backend Assets
- Located in `/photo-gallary/.next/standalone/` after running the build script
- This is a standalone Node.js application that can be run with `node server.js`
- Includes the API routes and server-side code

## Docker Setup

The application is containerized using Docker:

- **Frontend**: Served by nginx on port 80
- **Backend**: Runs in a Node.js container on port 3001

## Running the Application

To build and run the application:

1. Run the build script: `./build.sh photo-gallary`
2. Start the Docker containers: `docker-compose up -d`

## Architecture

- The frontend is a Single Page Application (SPA) built with React and Next.js
- The backend is a Node.js API built with Next.js API routes
- The frontend communicates with the backend via API calls
- Static assets are served by nginx
- API requests are proxied to the backend service
