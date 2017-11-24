import { Bookshelf } from '../../config/Database';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import * as _ from 'lodash';

export class TestDataService {

    public log: LoggerType;
    public ignoreTables: string[] = ['sqlite_sequence', 'version', 'version_lock' /*, 'knex_migrations', 'knex_migrations_lock'*/];

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * clean up the database
     *
     * @param tables to ignore
     * @returns {Promise<void>}
     */
    public async clean(tables: string[]): Promise<void> {

        // by default ignore these
        this.ignoreTables = this.ignoreTables.concat(tables);
        this.log.info('cleaning up the db, ignoring tables: ', this.ignoreTables);
        const options = {
            mode: 'delete',
            ignoreTables: this.ignoreTables
        };

        const existingTables = await this.getTableNames(Bookshelf.knex);
        const tablesToClean = existingTables
            .map( (table) => {
                return table.name; // [Object.keys(table)[0]];
            })
            .filter( (tableName) => {
                return !_.includes(this.ignoreTables, tableName);
            });

        this.log.info('tablesToClean: ', tablesToClean);

        for (const table of tablesToClean) {
            this.log.info('table: ', table);
            await Bookshelf.knex.select().from(table).del();
        }
        return;
    }

    private async getTableNames(knex: any): Promise<any> {
        return await knex.raw("SELECT name FROM sqlite_master WHERE type='table';");
    }

}
