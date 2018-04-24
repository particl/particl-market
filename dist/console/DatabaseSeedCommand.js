"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Logger_1 = require("../core/Logger");
const Knex = require("knex");
const AbstractCommand_1 = require("./lib/AbstractCommand");
const Database_1 = require("../config/Database");
const log = new Logger_1.Logger(__filename);
/**
 * DatabaseSeedCommand
 *
 * @export
 * @class DatabaseResetCommand
 */
class DatabaseSeedCommand extends AbstractCommand_1.AbstractCommand {
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const db = Knex(Database_1.DatabaseConfig);
            // Close connection to the database
            yield db.destroy();
            log.info('Done');
        });
    }
}
DatabaseSeedCommand.command = 'db:seed';
DatabaseSeedCommand.description = 'Seeding database with testdata.';
exports.DatabaseSeedCommand = DatabaseSeedCommand;
//# sourceMappingURL=DatabaseSeedCommand.js.map