import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { MessagingInformationService } from '../../services/MessagingInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { MessagingInformationUpdateRequest } from '../../requests/MessagingInformationUpdateRequest';
import { MessagingInformation } from '../../models/MessagingInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class MessagingInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<MessagingInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) private messagingInformationService: MessagingInformationService
    ) {
        super(Commands.MESSAGINGINFORMATION_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: protocol (MessagingProtocolType)
     *  [2]: public key
     *
     * @param data
     * @returns {Promise<MessagingInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<MessagingInformation> {
        // messaging information cannot be updated if there's a ListingItem related to ListingItemTemplate. (the item has allready been posted)
        const result = await this.getItemMessagingInformation(data.params[0]);
        if (result[0].listingItemId) {
            throw new MessageException('Messaging information cannot be updated if there is a ListingItem related to ListingItemTemplate.');
        } else {
            // set body to update
            return this.messagingInformationService.update(result[1].id, {
                listing_item_template_id: data.params[0],
                protocol: data.params[1],
                publicKey: data.params[2]
            } as MessagingInformationUpdateRequest);
        }
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> <protocol> <publicKey> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>      - Numeric - [TODO] \n'
            + '    <protocol>               - ENUM{SMSG} - [TODO] \n'
            + '    <publicKey>              - String - [TODO] ';
    }

    public description(): string {
        return 'Update the details of messaging information associated with listingTemplateId.';
    }

    /**
     * TODO: NOTE: This function may be duplicated between commands.
     * function to get item-information and message-information
     *
     * @param listingItemTemplateId
     * @returns {Promise<any>}
     */
    private async getItemMessagingInformation(listingItemTemplateId: number): Promise<any> {
        // find the existing listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        // find the related ItemInformation
        const ItemInformation = listingItemTemplate.related('ItemInformation').toJSON();
        // find the related MessageInformation
        const MessageInformation = listingItemTemplate.related('MessagingInformation').toJSON();
        // Through exception if ItemInformation or MessageInformation does not exist
        // make sure the ItemInformation being updated is related ListingItemTemplate,
        // because we shouldn't be able to edit ItemInformations for item's that aren't ours.
        if (_.size(ItemInformation) === 0 || _.size(MessageInformation) === 0) {
            this.log.warn(`Item Information or Message information with the listing template id=${listingItemTemplateId} was not found!`);
            throw new MessageException(`Item Information or Message information with the listing template id=${listingItemTemplateId} was not found!`);
        }
        return [ItemInformation, MessageInformation[0]];
    }


}
