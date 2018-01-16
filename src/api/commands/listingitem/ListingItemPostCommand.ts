import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { ListingItemService } from '../../services/ListingItemService';

import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemFactory } from '../../factories/ListingItemFactory';
import { ListingItemMessage } from '../../messages/ListingItemMessage';
import { MessageException } from '../../exceptions/MessageException';
import { MessageBroadcastService } from '../../services/MessageBroadcastService';
import { MarketService } from '../../services/MarketService';
import { ObjectHash } from '../../../core/helpers/ObjectHash';

export class ListingItemPostCommand implements RpcCommandInterface<ListingItem> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.MessageBroadcastService) public messageBroadcastService: MessageBroadcastService,
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'postitem';
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: marketId , may be optional
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItem> {
        // find ListingItem
        const itemTemplateModel = await this.listingItemTemplateService.findOne(data.params[0]);

        if (!itemTemplateModel) {
            this.log.warn(`ListingItemTemplate with the id=${data.params[0]} was not found!`);
            throw new MessageException(`ListingItemTemplate not found for id= ${data.params[0]}`);
        } else {
            const itemTemplate = itemTemplateModel.toJSON();
            let marketId;

            if (data.params[1] && typeof data.params[1] === 'number') {
                marketId = data.params[1];
            } else {
                const defaultMarket = await this.marketService.getDefault();
                marketId = defaultMarket.id;
            }

            // get the ListingItemMessage from listing item template
            const addItemMessage = await this.listingItemFactory.getMessage({
                hash: ObjectHash.getHash(itemTemplate),
                listingItemTemplateId: itemTemplate.id,
                information: itemTemplate.itemInformation || {},
                payment:  itemTemplate.paymentInformation || {},
                messaging: itemTemplate.messagingInformation || {}
            } as ListingItemMessage, marketId);

            // TODO: Need to update broadcast message return after broadcast functionality will be done.
            this.messageBroadcastService.broadcast(addItemMessage as any);
            return itemTemplate;
        }
    }

    public help(): string {
        return 'ListingItemPostCommand: TODO: Fill in help string.';
    }
}
