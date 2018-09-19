// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import * as resources from 'resources';

import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemService } from '../../services/ListingItemService';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { BidActionService } from '../../services/BidActionService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';

export class BidAcceptCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.BidActionService) private bidActionService: BidActionService
    ) {
        super(Commands.BID_ACCEPT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: itemId
     * [1]: bidId
     *
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const itemId = data.params[0];
        const bidId = data.params[1];

        const listingItemModel = await this.listingItemService.findOne(itemId);
        const listingItem = listingItemModel.toJSON();

        // make sure we have a ListingItemTemplate, so we know it's our item
        if (_.isEmpty(listingItem.ListingItemTemplate)) {
            this.log.error('Not your item.'); // Added for Unit Tests
            throw new MessageException('Not your item.');
        }

        // find the bid
        const bids: resources.Bid[] = listingItem.Bids;
        const bidToAccept = bids.find(bid => {
            return bid.id === bidId;
        });

        if (!bidToAccept) {
            this.log.error('Bid not found.'); // Added for Unit Tests
            throw new MessageException('Bid not found.');
        }

        return this.bidActionService.accept(listingItem, bidToAccept);
    }

    /**
     * data.params[]:
     * [0]: itemhash, string
     * [1]: bidId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 2) {
            throw new MessageException('Missing params.');
        }

        // find listingItem by hash
        const listingItemModel = await this.listingItemService.findOneByHash(data.params[0]);
        const listingItem = listingItemModel.toJSON();

        data.params[0] = listingItem.id;
        return data;
    }

    public usage(): string {
        return this.getName() + ' <itemhash> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to accept. ';
    }

    public description(): string {
        return 'Accept bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
}
