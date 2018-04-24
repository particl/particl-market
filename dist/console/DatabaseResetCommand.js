"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Logger_1 = require("../core/Logger");
const Knex = require("knex");
const AbstractCommand_1 = require("./lib/AbstractCommand");
const Database_1 = require("../config/Database");
const log = new Logger_1.Logger(__filename);
/**
 * DatabaseResetCommand rollback all current migrations and
 * then migrate to the latest one.
 *
 * @export
 * @class DatabaseResetCommand
 */
class DatabaseResetCommand extends AbstractCommand_1.AbstractCommand {
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const knex = Knex(Database_1.DatabaseConfig);
            const migrate = knex.migrate;
            // Force unlock in case of bad state
            yield migrate.forceFreeMigrationsLock();
            // Get completed migrations
            log.info('Get completed migrations');
            const completedMigrations = yield migrate._listCompleted();
            // Rollback migrations
            log.info('Rollback migrations');
            yield migrate._waterfallBatch(0, completedMigrations.reverse(), 'down');
            // Migrate to latest
            log.info('Migrate to latest');
            yield migrate.latest();
            // Close connection to the database
            yield knex.destroy();
            log.info('Done');
        });
    }
}
DatabaseResetCommand.command = 'db:reset';
DatabaseResetCommand.description = 'Reverse all current migrations and migrate to latest.';
exports.DatabaseResetCommand = DatabaseResetCommand;
//# sourceMappingURL=DatabaseResetCommand.js.map