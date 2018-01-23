# dapp-shell

[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=xludx&repoName=dapp-shell&branch=develop&pipelineName=dapp-shell&accountName=ludx&type=cf-2)]( https://g.codefresh.io/repositories/xludx/dapp-shell/builds?filter=trigger:build;branch:develop;service:5a6681e5867c720001c99eca~dapp-shell)

## Getting Started
### Step 1:  Set up the Development Environment
You need to set up your development environment before you can do anything.

Install [Node.js and NPM](https://nodejs.org/en/download/)
* on OSX use [homebrew](http://brew.sh) `brew install node`
* on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`
* on Linux (Ubuntu) use `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`<br/>
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

Do it manually or run:
```
./bin/copy-env.sh
```

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

> This starts a local server using `nodemon`, which will watch for any file changes and will restart the sever according to these changes.
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

* `npm run console make:resource` - Generates a controller, service, requests, repo, model and a migration with CRUD operations.
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


## IoC
Our IoC automatically looks through the `controllers`, `listeners` , `middlewares`, `services`,
`repositories`, `commands`, `factories`, `messageprocessors` and `models` folders in `src/api/` for files to bound automatically into the IoC - Container, so you have nothing to do.

**However it is very important to keep the naming right, because otherwise our IoC will not find your created files!!**


## API Routes
The route prefix is `/api` by default, but you can change this in the .env file. The route for the RPC API is `/api`.

| Route       | Description |
| ----------- | ----------- |
| **/api/info** | Shows us the name, description and the version of the package.json |
| **/api/docs** | This is the Swagger UI with our API documentation |
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
| **src/api/middlewares/**        | Express Middlewares like populateUser |
| **src/api/models/**             | Bookshelf Models |
| **src/api/repositories/**       | Repository / DB layer |
| **src/api/requests/**           | Request bodys with validations |
| **src/api/services/**           | Service layer |
| **src/api/** swagger.json       | Swagger documentation |
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

> A delightful way to building a RESTful API with NodeJs & TypeScript.
> An Node.js RESTful API boilerplate featuring
[Express](https://expressjs.com/),
[Inversify](http://inversify.io/),
[Winston](https://github.com/winstonjs/winston),
[TypeScript](https://www.typescriptlang.org/),
[TsLint](http://palantir.github.io/tslint/),
[@types](https://www.npmjs.com/~types),
[Jest](https://facebook.github.io/jest/),
[Swagger](http://swagger.io/),
[validatejs](https://validatejs.org/),
[knex](http://knexjs.org/) and
[bookshelf](http://bookshelfjs.org/)
by [w3tech](https://github.com/w3tecch)

## Features
- **Beautiful Syntax** thanks to the awesome annotations from [Inversify Express Utils](https://github.com/inversify/inversify-express-utils).
- **Easy API Testing** with included black-box testing.
- **Dependency Injection** done with the nice framework from [Inversify](http://inversify.io/).
- **Fast Database Building** with simple migration and seeding from [Knex](http://knexjs.org/).
- **Simplified Database Query** with the ORM of [Knex](http://knexjs.org/) called [Bookshelf](http://bookshelfjs.org/).
- **Clear Structure** with controllers, services, repositories, models, middlewares...
- **Easy Exception Handling** with our own simple and easy to adopt logic. You will love it.
- **Easy Data Seeding** with our own factories.
- **Custom Commands** are also available in our setup and really easy to use or even extend.
- **Scaffolding Commands** will speed up your development tremendously as you should focus on business code and not scaffolding.
- **Smart Validation** thanks to [class-validator](https://github.com/pleerock/class-validator) with some nice annotations.
- **API Documentation** thanks to [swagger](http://swagger.io/).
- **API Monitoring** thanks to [express-status-monitor](https://github.com/RafalWilinski/express-status-monitor).
- **Integrated Testing Tool** thanks to [Wallaby.js](https://wallabyjs.com/)

## Documentations of our main dependencies
* [Express](https://expressjs.com/)
* [Knex](http://knexjs.org/)
* [Bookshelf](http://bookshelfjs.org/)
* [Bookshelf Cheatsheet](http://ricostacruz.com/cheatsheets/bookshelf.html)
* [Inversify](http://inversify.io/)
* [Inversify Express Utils](https://github.com/inversify/inversify-express-utils)
* [class-validator](https://github.com/pleerock/class-validator)
* [Jest](http://facebook.github.io/jest/)
* [Auth0 API Documentation](https://auth0.com/docs/api/management/v2)
* [swagger Documentation](http://swagger.io/)
