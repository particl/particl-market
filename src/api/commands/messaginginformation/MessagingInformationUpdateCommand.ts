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
import * as resources from 'resources';

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

        // messaging information cannot be updated if there's a ListingItem related to ListingItemTemplate.
        // (the item has allready been posted)
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(data.params[0]);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();

        if (!_.isEmpty(listingItemTemplate.ListingItems)) {
            throw new MessageException('MessagingInformation cannot be updated if there is a ListingItem related to ListingItemTemplate.');
        } else {

            // todo: updates only the first one
            return this.messagingInformationService.update(listingItemTemplate.MessagingInformation[0].id, {
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

}
