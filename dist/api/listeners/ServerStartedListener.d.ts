/// <reference types="node" />
import { Logger as LoggerType } from '../../core/Logger';
import { DefaultItemCategoryService } from '../services/DefaultItemCategoryService';
import { DefaultProfileService } from '../services/DefaultProfileService';
import { DefaultMarketService } from '../services/DefaultMarketService';
import { EventEmitter } from '../../core/api/events';
import { MessageProcessor } from '../messageprocessors/MessageProcessor';
import { CoreRpcService } from '../services/CoreRpcService';
export declare class ServerStartedListener implements interfaces.Listener {
    messageProcessor: MessageProcessor;
    defaultItemCategoryService: DefaultItemCategoryService;
    defaultProfileService: DefaultProfileService;
    defaultMarketService: DefaultMarketService;
    coreRpcService: CoreRpcService;
    eventEmitter: EventEmitter;
    static Event: symbol;
    static ServerReadyEvent: symbol;
    log: LoggerType;
    isAppReady: boolean;
    isStarted: boolean;
    private previousState;
    private timeout;
    private interval;
    constructor(messageProcessor: MessageProcessor, defaultItemCategoryService: DefaultItemCategoryService, defaultProfileService: DefaultProfileService, defaultMarketService: DefaultMarketService, coreRpcService: CoreRpcService, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    /**
     *
     * @param payload
     * @returns {Promise<void>}
     */
    act(payload: any): Promise<any>;
    pollForConnection(): void;
    stop(): void;
    private checkConnection();
}
