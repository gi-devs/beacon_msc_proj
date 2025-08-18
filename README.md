# Welcome To Beacon
Beacon is a mood tracking, anonymous social interactive platform that allows users to share their mood, and create local _beacons_ of support.
Beacon is built to encourage social interaction for those feel nervous sharing in real life, and to help people learn to support others.

This is a project built for Geraldine Ho's MSc Software Development project.

## Getting Started
To get started with Beacon, you can clone the repository and install the dependencies.

For development run:
- `npm install`
  - This is a monorepo, so you will need to run the above commands in the root directory and all packages and app dependencies will be installed.
- `npm run dev`
  - This will start the development server and start a docker container for the backend API for development.
- `npm run dev:mobile`
  - This will start the frontend development server for React Native Expo.

### environment variables
You will need to create a `.env.development` file in the root directory of the project. A sample `.env.example` [file](.env.example) is provided in the root directory. 
You can copy this file and rename it to `.env.development` and change required enviroment variables.

## Technologies Used
Beacon is a typescript monorepo built with the following technologies:
- **Monorepo**: Npm Workspaces, prettier, eslint
- **Frontend**: React, React Native, Expo, Tailwind CSS
- **Backend**: Node.js, Express, PostgresSQL, Prisma, Docker
- **Testing**: Jest
- **validation**: Zod
