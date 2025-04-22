# Task Manager API

## Getting Started

### Requirements
- [NodeJS](https://nodejs.org/en/)@v12.18.4
- [NVM](https://github.com/nvm-sh/nvm)@v0.37.2

### Installation
- `nvm use` - If NodeJS version is not found you can install it by running `nvm install v12.18.4`


### Environment Variables
- Create a copy of the file `.env.example` and update each variable value.
- Please notice that the MongoDB Connection String is stored in this variable: `MONGO_DB_CONN_STRING=`

### Commands

#### Developer Mode
- `npm run dev` - Developer Mode

#### Others
- `npm start` - Run the application (no failover restore)
- `npm run migrate:up` - Run migrations up
- `npm run migrate:down` - Run migrations down/rollback
- `npm run debug:dev` - Run developer mode allowing `debugger` code via Chrome Inspector.
- `npm test` - Unit tests not setup. Any unit test created.

### Credits
- [The Complete Node.js Developer Course (3rd Edition)](https://www.udemy.com/course/the-complete-nodejs-developer-course-2/)
