import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';

import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemUpdatePostRequest } from '../../requests/ListingItemUpdatePostRequest';


export class ListingItemUpdateCommand implements RpcCommandInterface<ListingItem> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'updateitem';
    }

    /**
     * data.params[]:
     *  [0]: listingitem hash to update
     *  [1]: listingitemtemplate id to update the listingitem with
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        return this.listingItemService.updatePostItem({
            hash: data.params[0],
            listingItemTemplateId: data.params[1] || undefined
        } as ListingItemUpdatePostRequest);

    }

    public help(): string {
        return 'updateitem <listingitemHash>\n'
            + '    <hash>     - String - The hash of the listing item we want to Update.\n'
            + '    <listingItemTemplateId>     - Number - The Id of the listing item template which listing-item we want to Update.';
    }
}
