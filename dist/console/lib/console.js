"use strict";
/**
 * console.Commander
 * ------------------------------------------------
 *
 * Here you can define your console commands, so you are able
 * to use them in the terminal with 'npm run console <command>'.
 *
 * These console commands can also be accessed in the production
 * environment. For example to import users.
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const glob = require("glob");
const path = require("path");
const commander = require("commander");
const figlet = require("figlet");
const chalk = require("chalk");
// It also loads the .env file into the 'process.env' variable.
const dotenv_1 = require("dotenv");
dotenv_1.config();
// Configures the logger
const LoggerConfig_1 = require("../../config/LoggerConfig");
new LoggerConfig_1.LoggerConfig().configure();
figlet('console', (error, data) => {
    console.log(chalk.blue(data));
    // Find all command files
    glob(path.join(__dirname, '../**/*Command.ts'), (err, matches) => {
        if (err) {
            console.log(err);
            return;
        }
        const files = matches
            .filter(m => m.search(/\/lib/g) <= 0)
            .map(m => ({
            path: m,
            name: m.replace(__dirname.split(path.sep).join('/').replace('/lib', ''), '').replace('.ts', '').substring(1)
        }));
        const commands = files.map(f => require(f.path)[f.name]);
        const keys = commands.map(c => {
            return c.command;
        });
        const key = process.argv[2];
        if (keys.indexOf(key) < 0 && key !== '--help') {
            console.log(chalk.red('➜ ') + chalk.bold(`Command ${key} was not found!`));
            console.log();
            return;
        }
        if (key !== '--help') {
            console.log(chalk.green('➜ ') + chalk.bold(key));
            console.log();
        }
        commands.forEach((c) => {
            commander
                .command(c.command)
                .description(c.description)
                .action(() => c.action(new c()));
        });
        commander.parse(process.argv);
    });
});
//# sourceMappingURL=console.js.map