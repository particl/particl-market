import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ItemImageListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ItemImage>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMIMAGE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * TODO: refactor this to match help().
     *
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
        return this.getName()
            + ' (template <listingItemTemplateId> | item <listingItemId>)'
            + '    <listingItemTemplateId>          - Numeric - [TODO].\n'
            + '    <listingItemId>                  - Numeric - [TODO]';
    }

    public description(): string {
        return 'Return all images for listing item..';
    }
}
