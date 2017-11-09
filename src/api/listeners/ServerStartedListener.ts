import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { DefaultItemCategoryService } from '../services/DefaultItemCategoryService';

export class ServerStartedListener implements interfaces.Listener {

    public static Event = Symbol('ServerStartedListenerEvent');

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public act(payload: any): void {
        this.log.info('Receive event ServerStartedListenerEvent', payload);

        // seed the default categories
        this.defaultItemCategoryService.seedDefaultCategories();
    }



}
