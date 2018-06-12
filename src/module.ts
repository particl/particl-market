import 'reflect-metadata';

import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

let proc: ChildProcess;

/**
 * Spawns the application in a seperate process
 */
exports.start = () => {
    const p = path.join(__dirname, 'app.js');
    const environment = {
        NODE_ENV: 'alpha',
        TESTNET: true,
        INIT: true,
        MIGRATE: true,
        ELECTRON_RUN_AS_NODE: true
    };

    proc = spawn(process.execPath, [p], { env: environment});
    return proc;
};

/**
 * Stops the process.
 */
exports.stop = () => {
    if (proc) {
        proc.kill('SIGINT');
    }
};
