// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemSearchParams } from '../../requests/search/ListingItemSearchParams';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SearchOrder } from '../../enums/SearchOrder';
import { OrderItemStatusResponse } from '../../../core/helpers/OrderItemStatusResponse';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

export class OrderItemStatusCommand extends BaseCommand implements RpcCommandInterface<OrderItemStatusResponse[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
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
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<OrderItemStatusResponse[]> {
        const itemHash = data.params[0];
        const buyer = data.params[1];
        const seller = data.params[2];

        const type = 'ALL';         // todo: refactor to use * instead of ALL
        const profileId = 'ALL';    // todo: refactor to use * instead of ALL

        // searchBy for listingitem(s) with certain seller and having bids from certain buyer
        const listingItems: resources.ListingItem[] = await this.listingItemService.search({
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
        } as ListingItemSearchParams, true).then(value => value.toJSON());


        // Extract status details from the orderItems, since that's what we want to return to the userd
        const orderItemStatuses: OrderItemStatusResponse[] = [];
        for (const listingItem of listingItems) {
            this.log.debug('listingItem.id:', listingItem.id);

            // first create a new collection of only MPA_BID bids
            const mpaBids: resources.Bid[] = _.filter(listingItem.Bids, (bid) => {
                return bid.type === MPAction.MPA_BID;
            });
            this.log.debug('mpaBids:', JSON.stringify(mpaBids, null, 2));

            for (const bid of mpaBids) {

                // we are only creating a status if there's no specific buyer set or when the given buyer matches bid.bidder
                if (!buyer || buyer === '*' || bid.bidder === buyer) {

                    this.log.debug('listingItem.Bids:', JSON.stringify(listingItem.Bids, null, 2));

                    // find the childBids of the Bid
                    const childBids = _.filter(listingItem.Bids, (childBid) => {
                        return childBid.parentBidId === bid.id;
                    });
                    this.log.debug('childBids:', JSON.stringify(childBids, null, 2));

                    if (!_.isEmpty(childBids)) {
                        // we have childBids and there could be multiple of them, so orderBy createdAt
                        const childBidsOrdered = _.orderBy(childBids, ['createdAt'], ['asc']);
                        this.log.debug('childBidsOrdered: ', JSON.stringify(childBidsOrdered, null, 2));
                        const orderItemStatus = new OrderItemStatusResponse(
                            listingItem.hash,
                            childBidsOrdered[0].type,
                            bid.OrderItem.status, // todo: only MPA_BID has the relation to OrderItem
                            childBidsOrdered[0].bidder,
                            listingItem.seller
                        );
                        orderItemStatuses.push(orderItemStatus);

                    } else {
                        // there are no childBids, use the current one
                        const orderItemStatus = new OrderItemStatusResponse(listingItem.hash, bid.type, bid.OrderItem.status, bid.bidder, listingItem.seller);
                        orderItemStatuses.push(orderItemStatus);
                    }
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

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('itemHash', 'string');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('buyer', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('seller', 'string');
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
        return 'Fetch statuses of OrderItems specified by given searchBy params. Shows the first 100 orders.';
    }

    public example(): string {
        return 'orderitem ' + this.getName() + ' ';
    }

}
