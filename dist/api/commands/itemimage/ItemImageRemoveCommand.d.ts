import { Logger as LoggerType } from '../../../core/Logger';
import { ItemImageService } from '../../services/ItemImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemImageRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    private itemImageService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemImageService: ItemImageService);
    /**
     * data.params[]:
     *  [0]: ItemImage.Id
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
