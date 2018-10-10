"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * AbstractCommand
 * -------------------------------------
 *
 */
const _ = require("lodash");
class AbstractCommand {
    constructor(context) {
        this.context = _.cloneDeep(context);
    }
    static action(command) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield command.run();
                process.exit(0);
            }
            catch (e) {
                process.exit(1);
            }
        });
    }
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('You have to implement a run method!');
        });
    }
}
AbstractCommand.command = 'make:command';
AbstractCommand.description = 'description';
exports.AbstractCommand = AbstractCommand;
//# sourceMappingURL=AbstractCommand.js.map