import { Logger as LoggerType } from '../../../core/Logger';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
export declare class EscrowUpdateCommand extends BaseCommand implements RpcCommandInterface<Escrow> {
    Logger: typeof LoggerType;
    private listingItemTemplateService;
    private escrowService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemTemplateService: ListingItemTemplateService, escrowService: EscrowService);
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
}
