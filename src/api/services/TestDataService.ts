import { Bookshelf } from '../../config/Database';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import * as _ from 'lodash';
import { MessageException } from '../exceptions/MessageException';
import { TestDataCreateRequest } from '../requests/TestDataCreateRequest';
import { ListingItem } from '../models/ListingItem';
import { ListingItemService } from './ListingItemService';
import { DefaultItemCategoryService } from './DefaultItemCategoryService';
import { DefaultProfileService } from './DefaultProfileService';
import { ProfileService } from './ProfileService';

export class TestDataService {

    public log: LoggerType;
    public ignoreTables: string[] = ['sqlite_sequence', 'version', 'version_lock', 'knex_migrations', 'knex_migrations_lock'];

    constructor(
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * clean up the database
     * insert the default data
     *
     * @param ignoreTables
     * @param seed
     * @returns {Promise<void>}
     */
    public async clean(ignoreTables: string[], seed: boolean = true): Promise<void> {

        await this.cleanDb(ignoreTables);
        if (seed) {
            await this.defaultItemCategoryService.seedDefaultCategories();
            await this.defaultProfileService.seedDefaultProfile();
        }

        return;
    }

    /**
     * creates testdata
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async create(@request(TestDataCreateRequest) body: any): Promise<any> {
        switch (body.model) {
            case 'listingitem': {
                return await this.listingItemService.create(body.data);
            }
            case 'profile': {
                return await this.profileService.create(body.data);
            }
            default: {
                throw new MessageException('Not implemented');
            }
        }
    }

    /**
     * clean up the db
     *
     * @param ignoreTables
     * @returns {Promise<void>}
     */
    private async cleanDb(ignoreTables: string[]): Promise<void> {

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

    private async getTableNames(knex: any): Promise<any> {
        return await knex.raw("SELECT name FROM sqlite_master WHERE type='table';");
    }

}
