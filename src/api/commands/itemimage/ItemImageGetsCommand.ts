import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
// import { ItemImageService } from '../../services/ItemImageService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';

export class ItemImageGetsCommand implements RpcCommandInterface<Bookshelf.Collection<ItemImage>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'getitemimages';
    }

    /**
     * data.params[]:
     *  [0]: ListingItem.Id
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemImage>> {
        const retval: ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0], true);
        // this.log.debug('ASD: ' + JSON.stringify(retval.toJSON().ItemInformation.ItemImages));
        // const tmp = await retval.ItemInformation();
        return retval.toJSON().ItemInformation.ItemImages;
    }

    public help(): string {
        return 'getitemimages <listingItemId>\n'
            + '<listingItemId>           - Numeric - The ID of the listing item template whose associated images we want to find.';
    }
}
