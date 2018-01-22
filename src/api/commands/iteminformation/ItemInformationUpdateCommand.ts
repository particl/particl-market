import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../../services/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformationUpdateRequest } from '../../requests/ItemInformationUpdateRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ItemInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService
    ) {
        super(Commands.ITEMINFORMATION_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listing template id
     *  [1]: title
     *  [2]: short-description
     *  [3]: long-description
     *  [4]: category
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.updateWithCheckListingTemplate({
            listing_item_template_id: data.params[0],
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: {
                key: data.params[4]
            }
        } as ItemInformationUpdateRequest);
    }

    public help(): string {
        return this.getName() + ' <listingItemTemplateId> <title> <shortDescription> <longDescription> <category>\n'
            + '    <listingItemTemplateId>         - Numeric - The ID of the listing item template\n'
            + '                                       whose associated item information we want to\n'
            + '                                       update.\n'
            + '    <title>                         - String - The new title of the item information\n'
            + '                                       we\'re updating.\n'
            + '    <shortDescription>              - String - The new short description of the item\n'
            + '                                       information we\'re updating.\n'
            + '    <longDescription>               - String - The new long description of the item\n'
            + '                                       information we\'re updating.\n'
            + '    <categoryKey>                   - String - The key that identifies the new\n'
            + '                                       category we want to assign to the item\n'
            + '                                       information we\'re updating.';
    }

}
