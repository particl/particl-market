"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const figlet = require("figlet");
const chalk = require("chalk");
figlet(process.argv[2], (error, data) => {
    if (error) {
        return process.exit(1);
    }
    console.log(chalk.blue(data));
    console.log('');
    process.exit(0);
});
//# sourceMappingURL=banner.js.map