
```
                              .   ..  . . .... ....... ........ .... ....................
   ___________    _______  ___________  _________    ______  __________  ______ .::::::::
   _\ ___.   /_____\_   /_ _\ ___.   /  _\      /___ _\ __/_ _\       /  _\   / :::::::::
   |"   /   / | __      "| |"   /   /__ !__    ____/ |"    / |"  /___/__ |"  /____  .::::
   | \_____/  | /        | |  \_      /   |"    /    |    /  |  /      / |  /    / .:::::
   !_____|    !_______/__| !____\____/    !____/     !___/   !________/  !______/ .::::::
                                        .   . ..:.::. .....::. . . ....::.........:::::::
           ________     _______  ___________  _____ . ..::. __________ _________ .:::::::
    ______ /  _.  / _____\_   /_ _\ ___.   /  _\  /______ . _\ _.    / _\      /___  ::::
   __\ _  /   /  /_ | __      "| |"   /   /__ |" /   ___/___|" /    /__|__   _____/ .::::
   |"   \ `  /  / | | /        | |  \_      / |    \       /|  ____/  |  |"    /  .::::::
   !_____\__/_____| !_______/__| !____\____/  !_____\_____/ !_________|  !____/ .::::::::
                                                             . .. . ...........::::::::l!
```


## Getting Started 
### Step 1:  Set up the Development Environment 
You need to set up your development environment before you can do anything.

Install [Node.js and NPM](https://nodejs.org/en/download/)
* on OSX use [homebrew](http://brew.sh) `brew install node`
* on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`
* on Linux (Ubuntu) use `curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -`<br/>
`sudo apt-get install -y nodejs`

Then install yarn globally 
```
npm install yarn -g 
```

And finally install Docker
* Installation instructions on [docs.docker.com](https://docs.docker.com/engine/installation/)


### Step 2: Set up the Project
Fork this project. 

Then copy the `.env.example` file and rename it to `.env`. In this file you can edit your database connection information among other stuff, but everything should really work out of the box.

Then setup your application environment.
```
npm run setup
```

> This installs all dependencies with yarn. After that it migrates the database and seeds some test data into it. So after that your development environment is ready to use.

### Step 3: Serve your App
Go to the project dir and start your app with this npm script.
```
npm run serve
```

> This starts a local server using `nodemon`, which will watch for any file changes and will restart the server according to these changes.
> The server address will be displayed to you as `http://0.0.0.0:3000`.


### Step 3b: Or serve your App using Docker
Build the docker image defined in Dockerfile and start the services.
```
docker-compose build
docker-compose up
```

> This starts two marketplace applications and two particl daemons for you.
> app1 cli: http://localhost:3100/cli, connecting to particl1 on port 52935
> app2 cli: http://localhost:3200/cli, connecting to particl2 on port 53935

## Scripts / Tasks
All script are defined in the package.json file, but the most important ones are listed here.

### Install
* Install all dependencies with `yarn install`

### Linting
* Run code quality analysis using `npm run lint`. This runs tslint.
* There is also a vscode task for this called `lint`.

### Tests
Black-box tests are run against the applications rpc-api, so you need to start the application for those to work.
Integration tests start the application container and do not require the application to be running.

* Run the unit tests using `npm test` (There is also a vscode task for this called `test`).
* Run the integration tests using `npm run test:integration:pretty` and don't forget to start your application.
* Run the black-box tests using `npm run test:black-box:pretty` and don't forget to start your application.
* Run the ui tests using `npm run test:ui:pretty` and don't forget to start your application.
* To run just some certain test(s) try `TEST=Market* npm run test:integration:single`

### Running in dev mode
* Run `npm run serve` to start nodemon with ts-node, to serve the app.
* The server address will be displayed to you as `http://0.0.0.0:3000`

### Building the project and run it
* Run `npm run build` to generated all JavaScript files from the TypeScript sources (There is also a vscode task for this called `build`).
* To start the built app located in `dist` use `npm start`.

### Database
* Run `npm run db:migrate` to migrate schema changes to the database
* Run `npm run db:migrate:rollback` to rollback one migration
* Run `npm run db:seed` to seed sample data into the database
* Run `npm run db:reset` to rollback all migrations and migrate any migration again
* Run `./bin/recreate-dbs.sh` to recreate dev/test databases

### Console
* To run your own created command enter `npm run console <command-name>`.
* This list all your created commands `npm run console:help`.

### Scaffolding Commands
All the templates for the commands are located in `src/console/templates`.

* `npm run console make:resource` - Generates a command, service, requests, repo, model and a migration with CRUD operations.
* `npm run console make:controller` - Generates a controller.
* `npm run console make:service` - Generates a service.
* `npm run console make:command` - Generates a command.
* `npm run console make:factory` - Generates a factory.
* `npm run console make:messageprocessor` - Generates a messageprocessor.
* `npm run console make:repo` - Generates a repository.
* `npm run console make:model` - Generates a model with the props and configurations.
* `npm run console make:middleware` - Generates a basic middleware.
* `npm run console make:request` - Generates a basic request.
* `npm run console make:listener` - Generates a basic listener.
* `npm run console make:exception` - Generates a basic exception.
* `npm run console make:enum` - Generates a basic enum.
* `npm run console make:api-test` - Generates an api test.
* `npm run console make:integration-test` - Generates an integration test.
* `npm run console make:seed` - Generates a seeder.
* `npm run console update:targets` - Reads all the API files and generate a new `constants/Targets.ts` file out of it.

**Example**
```
$ npm run console make:service ExampleService
// -> creates `api/services/ExampleService.ts

$ npm run console make:model user
// -> creates `api/models/User.ts
```

### WEB CLI
* This CLI gives you easy access to the RPC commands.
* Run `npm run serve` to serve the app.
* Go to `http://localhost:3000/cli` to access the CLI.
* Type `help` to get a list of supported commands.

## Documentation

### Build
Compile markdown to static site from ./src/docs to ./docs:
```
npm run docs:build
```

### Serve
Run a dev documentation server that live-reloads at http://localhost:4567:
```
npm run docs:serve [PORT] [ROOT]
```


## IoC
Our IoC automatically looks through the `controllers`, `listeners` , `middlewares`, `services`,
`repositories`, `commands`, `factories`, `messageprocessors` and `models` folders in `src/api/` for files to bound automatically into the IoC - Container, so you have nothing to do.

**However it is very important to keep the naming right, because otherwise our IoC will not find your created files!!**


## API Routes
The route prefix is `/api` by default, but you can change this in the .env file. The route for the RPC API is `/api/rpc`.

| Route       | Description |
| ----------- | ----------- |
| **/api/info** | Shows us the name, description and the version of the package.json |
| **/status**   | Shows a small monitor page for the server |
| **/cli**      | Web based CLI to use the RPC commands |
| **/api/rpc**  | RPC Server endpoint |


## Project Structure

| Name                            | Description |
| ------------------------------- | ----------- |
| **.vscode/**                    | VSCode tasks, launch configuration and some other settings |
| **dist/**                       | Compiled source files will be placed here |
| **src/**                        | Source files |
| **src/api/commands/**           | RPC Commands |
| **src/api/controllers/**        | REST API Controllers |
| **src/api/exceptions/**         | Exceptions like 404 NotFound |
| **src/api/factories/**          | Factories |
| **src/api/listeners/**          | Event listeners |
| **src/api/messageprocessors/**  | Marketplace messageprocessors |
| **src/api/messages/**           | Marketplace messages |
| **src/api/middlewares/**        | Express Middlewares |
| **src/api/models/**             | Bookshelf Models |
| **src/api/repositories/**       | Repository / DB layer |
| **src/api/requests/**           | Request bodys with validations |
| **src/api/services/**           | Service layer |
| **src/console/**                | Command line scripts |
| **src/config/**                 | Configurations like database or logger |
| **src/constants/**              | Global Constants |
| **src/core/**                   | The core framework |
| **src/database/factories/**     | Model factories to generate database records |
| **src/database/migrations/**    | Migrations scripts to build up the database schema |
| **src/database/seeds/**         | Seed scripts to fake sample data into the database |
| **src/public/**                 | Static assets (fonts, css, js, img). |
| **src/types/** *.d.ts           | Custom type definitions and files that aren't on DefinitelyTyped |
| **test**                        | Tests |
| **test/black-box/** *.test.ts   | Black-Box tests (rpc endpoint tests) |
| **test/integration/** *.test.ts | Integration tests |
| **test/unit/** *.test.ts        | Unit tests |
| .env.example                    | Environment configurations |
| **test/** .env.test.example     | Test environment configurations |
| knexfile.ts                     | This file is used for the migrations and seed task of knex |



# About

This project is based on Express Typescript Boilerplate
[![Dependency Status](https://david-dm.org/w3tecch/express-typescript-boilerplate/status.svg?style=flat)](https://david-dm.org/w3tecch/express-typescript-boilerplate)
[![Build Status](https://travis-ci.org/w3tecch/express-typescript-boilerplate.svg?branch=master)](https://travis-ci.org/w3tecch/express-typescript-boilerplate)
[![Build status](https://ci.appveyor.com/api/projects/status/f8e7jdm8v58hcwpq/branch/master?svg=true&passingText=Windows%20passing&pendingText=Windows%20pending&failingText=Windows%20failing)](https://ci.appveyor.com/project/dweber019/express-typescript-boilerplate/branch/master)
