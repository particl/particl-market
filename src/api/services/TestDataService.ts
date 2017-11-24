import { Bookshelf } from '../../config/Database';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import * as _ from 'lodash';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItem } from '../models/ListingItem';
import { ListingItemService } from './ListingItemService';

export class TestDataService {

    public log: LoggerType;
    public ignoreTables: string[] = ['sqlite_sequence', 'version', 'version_lock', 'knex_migrations', 'knex_migrations_lock'];

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * clean up the database
     *
     * @param ignoreTables to ignore
     * @returns {Promise<void>}
     */
    public async clean(ignoreTables: string[]): Promise<void> {

        // by default ignore these
        ignoreTables = this.ignoreTables.concat(ignoreTables);
        this.log.info('cleaning up the db, ignoring tables: ', this.ignoreTables);
        const options = {
            mode: 'delete',
            ignoreTables
        };
        this.log.debug('ignoreTables: ', ignoreTables);

        const existingTables = await this.getTableNames(Bookshelf.knex);
        const tablesToClean = existingTables
            .map( (table) => {
                return table.name; // [Object.keys(table)[0]];
            })
            .filter( (tableName) => {
                return !_.includes(ignoreTables, tableName);
            });


        // this.log.debug('tablesToClean: ', tablesToClean);
        for (const table of tablesToClean) {
            await Bookshelf.knex.select().from(table).del();
        }
        return;
    }

    @validate()
    public async create(@request(ListingItemCreateRequest) data: any): Promise<ListingItem> {
        return await this.listingItemService.create(data);
    }

    private async getTableNames(knex: any): Promise<any> {
        return await knex.raw("SELECT name FROM sqlite_master WHERE type='table';");
    }

}
