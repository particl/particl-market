// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemSearchParams } from '../../requests/ListingItemSearchParams';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { SearchOrder } from '../../enums/SearchOrder';
import { OrderItemStatus } from '../../../core/helpers/OrderItemStatus';
import * as resources from 'resources';

export class OrderItemStatusCommand extends BaseCommand implements RpcCommandInterface<OrderItemStatus[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.ORDERITEM_STATUS);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: itemhash, string
     *  [1]: buyer, string
     *  [2]: seller, string
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<OrderItemStatus[]> {
        const itemHash = data.params[0];
        const buyer = data.params[1];
        const seller = data.params[2];

        const type = 'ALL';         // todo: use * instead of ALL
        const profileId = 'ALL';    // todo: use * instead of ALL

        // search for listingitem(s) with certain seller and having bids from certain buyer
        const listingItemsModel: Bookshelf.Collection<ListingItem> = await this.listingItemService.search({
            itemHash,
            buyer,
            seller,
            order: SearchOrder.ASC.toString(),
            type,
            profileId,
            searchString: '',
            page: 0,
            pageLimit: 100,
            withBids: true
        } as ListingItemSearchParams, true);
        const listingItems = listingItemsModel.toJSON();

        // this.log.debug('listingItems:', JSON.stringify(listingItems, null, 2));

        // Extract status details from the orderItems, since that's what we want to return to the userd
        const orderItemStatuses: OrderItemStatus[] = [];
        for (const listingItem of listingItems) {
            for (const bid of listingItem.Bids) {
                if (!buyer || buyer === '*' || bid.bidder === buyer) {
                    const orderItemStatus = new OrderItemStatus(listingItem.hash, bid.action, bid.OrderItem.status, bid.bidder, listingItem.seller);
                    orderItemStatuses.push(orderItemStatus);
                }
            }
        }
        this.log.debug('orderItemStatuses:', JSON.stringify(orderItemStatuses, null, 2));

        return orderItemStatuses;
    }

    /**
     *  [0]: itemhash | *, string
     *  [1]: buyer | *, string
     *  [2]: seller | *, string
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            data.params[0] = '*';
        }

        if (data.params.length < 2) {
            data.params[1] = '*';
        }

        if (data.params.length < 3) {
            data.params[2] = '*';
        }

        const itemHash = data.params[0];
        const buyer = data.params[1];
        const seller = data.params[2];

        if (typeof itemHash !== 'string') {
            throw new MessageException('itemHash should be a string.');
        }

        if (typeof buyer !== 'string') {
            throw new MessageException('buyer should be a string.');
        }

        if (typeof seller !== 'string') {
            throw new MessageException('seller should be a string.');
        }

        return data;
    }

    // tslint:disable:max-line-length
    public usage(): string {
        return this.getName() + ' [<itemhash|*> [<buyer|*> [<seller|*>]]]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '<itemHash|*> - The hash of the OrderItem we want to get the status of. \n'
            + '               Can use * for wildcard. \n'
            + '<buyer|*>    - The buyer of the OrderItems we want to get the status of. \n'
            + '               Can use * for wildcard. \n'
            + '<seller|*>   - The seller of the OrderItems we want to get the status of. \n'
            + '               Can use * for wildcard. \n';
    }

    // tslint:enable:max-line-length

    public description(): string {
        return 'Fetch statuses of OrderItems specified by given search params. Shows the first 100 orders.';
    }

    public example(): string {
        return 'orderitem ' + this.getName() + ' ';
    }

}
