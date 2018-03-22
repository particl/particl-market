import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { DefaultItemCategoryService } from '../services/DefaultItemCategoryService';
import { DefaultProfileService } from '../services/DefaultProfileService';
import { DefaultMarketService } from '../services/DefaultMarketService';
import { EventEmitter } from '../../core/api/events';
import { MessageProcessor} from '../messageprocessors/MessageProcessor';
import { CoreRpcService } from '../services/CoreRpcService';

export class ServerStartedListener implements interfaces.Listener {

    public static Event = Symbol('ServerStartedListenerEvent');
    public static ServerReadyEvent = Symbol('ServerReadyListenerEvent');

    public log: LoggerType;
    public isAppReady = false;
    public isStarted = false;
    private previousState = false;

    private timeout: any;
    private interval = 1000;

    constructor(
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.MessageProcessor) public messageProcessor: MessageProcessor,
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) public defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param payload
     * @returns {Promise<void>}
     */
    public async act(payload: any): Promise<any> {
        this.log.info('Received event ServerStartedListenerEvent', payload);
        this.isAppReady = true;
        this.pollForConnection();
    }

    public pollForConnection(): void {
        this.timeout = setTimeout(
            async () => {
                this.isStarted = await this.checkConnection();
                this.pollForConnection();
            },
            this.interval
        );
    }

    public stop(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    private async checkConnection(): Promise<boolean> {
        const isConnected = await this.coreRpcService.isConnected();
        if (isConnected) {

            // clearTimeout(this.timeout);
            // this.timeout = undefined;
            if (this.previousState !== isConnected) {
                this.log.info('connection with particld established.');

                // seed the default market
                await this.defaultMarketService.seedDefaultMarket();

                // seed the default categories
                await this.defaultItemCategoryService.seedDefaultCategories();

                // seed the default Profile
                await this.defaultProfileService.seedDefaultProfile();

                // start message polling
                this.messageProcessor.schedulePoll();
                this.interval = 10000;
            }

            // this.log.info('connected to particld, checking again in ' + this.interval + 'ms.');
        } else {

            if (this.previousState !== isConnected) {
                this.log.info('connection with particld disconnected.');

                // stop message polling
                this.messageProcessor.stop();
                this.interval = 1000;
            }
            if (process.env.NODE_ENV !== 'test') {
                this.log.error('failed to connect to particld, retrying in ' + this.interval + 'ms.');
            }
        }

        this.previousState = isConnected;

        return isConnected;
    }


}
