import { Logger as LoggerType } from '../../../core/Logger';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
export declare class EscrowAddCommand extends BaseCommand implements RpcCommandInterface<Escrow> {
    private escrowService;
    private listingItemTemplateService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(escrowService: EscrowService, listingItemTemplateService: ListingItemTemplateService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: escrowtype
     *  [2]: buyer ratio
     *  [3]: seller ratio
     * @param data
     * @returns {Promise<Escrow>}
     */
    execute(data: RpcRequest): Promise<Escrow>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
