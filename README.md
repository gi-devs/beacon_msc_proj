# Welcome To Beacon
Beacon is a mood tracking, anonymous social interactive platform that allows users to share their mood, and create local _beacons_ of support.
Beacon is built to encourage social interaction for those feel nervous sharing in real life, and to help people learn to support others.

This is a project built for Geraldine Ho's MSc Software Development project.

## Main Features (User Guide)
- **Mood Tracking**: Users can log their mood and see their mood history over time.
- **Anonymous Posting**: Users can post their mood and thoughts anonymously to a local community.
- **Local Beacons**: Users can create and join local beacons to connect with others in their area.
- **Statistics**: Users can view statistics about their mood.

## Main Features (Technical Guide)
- **Monorepo**: The project is structured as a monorepo using pnpm workspaces to manage multiple packages and applications. Theis allows for better code sharing and type safety across the application.
- **TypeScript**: The entire project is written in TypeScript, providing type safety and improved developer experience.
- **React Native with Expo**: The mobile application is built using React Native and Expo, allowing for cross-platform development.
- **Node.js and Express**: The backend API is built using Node.js and Express. There are 2 cron jobs which run in the Express server to handle that handles sending beacon notifications and creating/assigning users to community groups.
- **PostgreSQL and Prisma**: The database is PostgreSQL, and Prisma is used as the ORM for database interactions and Prisma safe typing.
- **Zod**: Zod is used for schema validation for frontend and backend, to ensure consistency.

### Monorepo Structure
The monorepo is structured as follows:
```
/ (root)
│── apps/
│   ├── mobile/         # React Native Expo app
│   └── backend/        # Express backend API
│── packages/
│   ├── types/          # Shared TypeScript types
│   ├── utils/          # Shared utility functions
│   └── validation/     # Shared validation schemas using Zod
|── docker/             # Docker configurations
│── .gitignore          # Git ignore file
│── .env.example        # Example environment variables
│── package.json        # Monorepo package
│── pnpm-workspace.yaml # pnpm workspace configuration
│── README.md           # Project documentation
```

## Getting Started
To get started with Beacon, you can clone the repository and install the dependencies.

For development run:
ensure you have pnpm, node and docker.
- `npm install -g pnpm`
  - This will install pnpm globally on your machine.
- `pnpm install`
  - This is a monorepo, so you will need to run the above commands in the root directory and all packages and app dependencies will be installed.
- `pnpm run dev`
  - This will start the development server and start a docker container for the backend API for development.
- `pnpm run dev:mobile`
  - This will start the frontend development server for React Native Expo.

### Environment Variables
You will need to create a `.env.development` file in the root directory of the project. A sample `.env.example` [file](.env.example) is provided in the root directory. 
You can copy this file and rename it to `.env.development` and change required environment variables.

## Technologies Used
Beacon is a typescript monorepo built with the following technologies:
- **Monorepo**: Npm Workspaces, prettier, tsconfig paths
- **Frontend**: React, React Native, Expo, Tailwind CSS, Axios
- **Backend**: Node.js, Express, PostgresSQL, Prisma, Docker, Cron
- **Testing**: Jest
- **validation**: Zod

## Use of Generative AI
Generative AI tools, specifically ChatGPT and GitHub Copilot, were used to assist in the development of this project. The AI was used to generate code snippets and provide suggestions, which were then reviewed and modified to fit the project's requirements. It mostly used for boilerplate code and repetitive tasks. AI was not used for any large core application logic, architecture, or design decisions. It was mainly used to assist with debugging, fixing errors and speeding up the development process. 

Files or sections where AI was heavily used in the application are documented in the code comments. This does not include short code snippets or auto completions, only those which were are significant sections of code. [CodeList.txt](CodeList.txt) contains a list of files and sections where AI was used and where it is mostly user written.

### Sections which were most assisted by AI:
- Seeding scripts
- Project configuration errors
- Debugging docker file and configuration issues
- Monorepo errors
- Location calculations and formulas
- Testing dummy data creation
- Build errors
- General logical snippets/errors

### Sections which were not influenced by AI:
- UI/UX design and implementation
- Core application logic and architecture
- Database schema design and relationships
- Security and authentication implementation
- Testing and validation logic
- Technology selection
- Project structure, design pattern and file organisation
