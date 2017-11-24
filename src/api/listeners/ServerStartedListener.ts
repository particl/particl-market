import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { DefaultItemCategoryService } from '../services/DefaultItemCategoryService';
import { DefaultProfileService } from '../services/DefaultProfileService';
import { EventEmitter, events } from '../../core/api/events';

export class ServerStartedListener implements interfaces.Listener {

    public static Event = Symbol('ServerStartedListenerEvent');
    public static ServerReadyEvent = Symbol('ServerReadyListenerEvent');

    public log: LoggerType;

    constructor(
        // @inject(Types.Core) @named(Core.Events) public events: EventEmitter,
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * TODO: Bookshelf doesn't support generating the db directly from the models, so we need to check if db exists and create it if not.
     *
     * @param payload
     * @returns {Promise<void>}
     */
    public async act(payload: any): Promise<any> {
        this.log.info('Receive event ServerStartedListenerEvent', payload);

        // seed the default categories
        await this.defaultItemCategoryService.seedDefaultCategories();

        // seed the default Profile
        await this.defaultProfileService.seedDefaultProfile();

        events.emit(ServerStartedListener.ServerReadyEvent, 'Ready!');
    }



}
