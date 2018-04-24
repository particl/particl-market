import { Logger as LoggerType } from '../../../core/Logger';
import { ItemInformationService } from '../../services/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemInformationGetCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {
    Logger: typeof LoggerType;
    private itemInformationService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemInformationService: ItemInformationService);
    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    execute(data: RpcRequest): Promise<ItemInformation>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
