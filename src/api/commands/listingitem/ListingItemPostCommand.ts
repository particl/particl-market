import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { ListingItemService } from '../../services/ListingItemService';

import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageBroadcastService } from '../../services/MessageBroadcastService';
import { ListingItemPostRequest } from '../../requests/ListingItemPostRequest';

export class ListingItemPostCommand implements RpcCommandInterface<ListingItem> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'postitem';
    }

    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: marketId, may be optional
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        return this.listingItemService.post({
            listingItemTemplateId: data.params[0],
            marketId: data.params[1] || undefined
        } as ListingItemPostRequest);

    }

    public help(): string {
        return 'ListingItemPostCommand: TODO: Fill in help string.';
    }
}
