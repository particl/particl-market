import { Logger as LoggerType } from '../../../core/Logger';
import { TestDataService } from '../../services/TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class DataCleanCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    private testDataService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, testDataService: TestDataService);
    /**
     * data.params[]:
     *  none
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
