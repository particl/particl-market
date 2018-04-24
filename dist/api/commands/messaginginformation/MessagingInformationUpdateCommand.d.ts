import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { MessagingInformationService } from '../../services/MessagingInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { MessagingInformation } from '../../models/MessagingInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class MessagingInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<MessagingInformation> {
    Logger: typeof LoggerType;
    private listingItemTemplateService;
    private messagingInformationService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemTemplateService: ListingItemTemplateService, messagingInformationService: MessagingInformationService);
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: protocol (MessagingProtocolType)
     *  [2]: public key
     *
     * @param data
     * @returns {Promise<MessagingInformation>}
     */
    execute(data: RpcRequest): Promise<MessagingInformation>;
    usage(): string;
    help(): string;
    description(): string;
}
