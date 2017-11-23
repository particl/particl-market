import { Bookshelf } from '../../config/Database';
import * as knexCleaner from 'knex-cleaner';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';

export class TestDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * destroy all data
     * @returns {Promise<void>}
     */
    public async clean(): Promise<void> {

        const options = {
            mode: 'delete'
            // ignoreTables: ['Dont_Del_1', 'Dont_Del_2']
        };

        knexCleaner.clean(Bookshelf.knex, options).then( () => {
            this.log.info('db cleaned');
        });

        return;
    }

}
