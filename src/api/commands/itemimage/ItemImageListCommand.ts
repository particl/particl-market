import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ItemImageListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ItemImage>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.ITEMIMAGE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplateId or listingItemId
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ItemImage>> {
        if ( data.params.length !== 2 ) {
            throw new MessageException('Invalid number of args. Expected 2, got <' + data.params.length + '>.');
        }
        const idType = data.params[0];
        if ( idType === 'template' ) {
            const listingItemTemplateId = data.params[1];
            const retval: ListingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId, true);
            return retval.toJSON().ItemInformation.ItemImages;

        } else if ( idType === 'item' ) {
            const listingItemId = data.params[1];
            const retval: ListingItem = await this.listingItemService.findOne(listingItemId, true);
            // this.log.debug('ADSDAS: ' + JSON.stringify(retval, null, 2));
            return retval.toJSON().ItemInformation.ItemImages;
        } else {
            throw new MessageException(`Invalid ID type detected <${idType}>. Expected 'template' or 'item'.`);
        }
    }

    public help(): string {
        return this.getName()
            + ' (template <listingItemTemplateId> | item <listingItemId>) \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template whose images we want to list. \n'
            + '    <listingItemId>               - Numeric - The ID of the listing item whose images we want to list. ';
    }

    public description(): string {
        return 'Return all images for listing item.';
    }
}
