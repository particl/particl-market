import { Logger as LoggerType } from '../../../core/Logger';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
export declare class EscrowRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    private listingItemTemplateService;
    private escrowService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemTemplateService: ListingItemTemplateService, escrowService: EscrowService);
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     * @param data
     * @returns {Promise<Escrow>}
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
