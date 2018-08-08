// Copyright (c) 2017-2018, The Particl Market developers
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
import { ListingItemSearchType } from '../../enums/ListingItemSearchType';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { SearchOrder } from '../../enums/SearchOrder';
import { OrderItemStatus } from '../../../core/helpers/OrderItemStatus';

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
        let itemHash = data.params[0];
        let buyer = data.params[1];
        let seller = data.params[2];

        // Check that all args required are present.
        // This is a defense against the impossible.
        // Also gives default values to the fields, which is importamt later.
        if (seller) {
            // If seller, must have buyer
            if (!buyer) {
                // Failure
                // Supplied seller but no buyer
                throw new MessageException('Somehow you managed to supply a seller but not a buyer. This shouldn\t be possible.');
            } else if (!itemHash) {
                // Failure
                // Supplied buyer and seller but not itemHash
                throw new MessageException('Somehow you managed to supply a seller but not a itemHash. This shouldn\t be possible.');
            }
            // Success
        } else {
            seller = '';
            if (buyer) {
                if (!itemHash) {
                    // Failure
                    // Supplied buyer and seller but not itemHash
                    throw new MessageException('Somehow you managed to supply a seller but not a itemHash. This shouldn\t be possible.');
                }
                // Success
            } else {
                buyer = '';
                if (!itemHash) {
                    // Success
                    itemHash = '';
                }
                // Success
            }
        }

        // check vaild itemHash
        if (typeof itemHash !== 'string' && itemHash !== '*') {
            throw new MessageException('Value needs to be a string or wildcard *. Got <${itemHash}> instead.');
        }

        // check vaild itemHash
        if (typeof buyer !== 'string' && buyer !== '*') {
            throw new MessageException('Value needs to be a string or wildcard *. Got <${buyer}> instead.');
        }

        // check vaild itemHash
        if (typeof seller !== 'string' && seller !== '*') {
            throw new MessageException('Value needs to be a string or wildcard *. Got <${seller}> instead.');
        }

        const type = 'ALL';
        const profileId = 'ALL';
        const orderItems: Bookshelf.Collection<ListingItem> = await this.listingItemService.search({
            itemHash,
            buyer,
            seller,
            order: SearchOrder.ASC.toString(),
            type,
            profileId,
            searchString: '',
            page: 1,
            pageLimit: 100,
            withBids: true
        } as ListingItemSearchParams, true);
        const orderItemsJson = orderItems.toJSON();
        // Extract status details from the orderItems, since that's what we want to return to the userd
        const orderItemStatuses: OrderItemStatus[] = [];
        for (const orderItem of orderItemsJson) {
            delete(orderItem.ItemInformation.ItemImages);
            const listingItemHash = orderItem.hash;
            const tmpSeller = orderItem.seller;

            for (const i in orderItem.Bids) {
                if (i) {
                    const tmpBuyer = orderItem.Bids[i].bidder;
                    if (!buyer || buyer === '*' || tmpBuyer === buyer) {
                        const bidType = orderItem.Bids[i].action;
                        const orderStatus = orderItem.Bids[i].OrderItem.status;
                        const orderItemStatus = new OrderItemStatus(listingItemHash, bidType, orderStatus, tmpBuyer, tmpSeller);
                        orderItemStatuses.push(orderItemStatus);
                    }
                }
            }
        }
        return orderItemStatuses;
    }

    // tslint:disable:max-line-length
    public usage(): string {
        return this.getName() + ' [<itemhash|*> [<buyer|*> [<seller|*>]]]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '<itemHash|*> - The hash of the order item we want to get the status of. \n'
            + '               Can use * for wildcard. \n'
            + '<buyer|*>    - The buyer of the order items we want to get the status of. \n'
            + '               Can use * for wildcard. \n'
            + '<seller|*>   - The buyer of the order items we want to get the status of. \n'
            + '               Can use * for wildcard. \n';
    }

    // tslint:enable:max-line-length

    public description(): string {
        return 'Fetch statuses of orders specified by given search params. Shows the first 100 orders.';
    }

    public example(): string {
        return 'orderitem ' + this.getName() + ' ';
    }

}
