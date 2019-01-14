// Copyright (c) 2017-2019, The Particl Market developers
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
import { BidService } from '../../services/BidService';

export class BidAcceptCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.BidActionService) private bidActionService: BidActionService
    ) {
        super(Commands.BID_ACCEPT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: bidId
     *
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const bidId = data.params[0];
        const bid: resources.Bid = await this.bidService.findOne(bidId)
            .then(value => {
                return value.toJSON();
            });
        return this.bidActionService.accept(bid);
    }

    /**
     * data.params[]:
     * [0]: bidId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MessageException('Missing bidId.');
        }

        if (typeof data.params[0] !== 'number') {
            throw new MessageException('bidId should be a number.');
        }

        const bidId = data.params[0];
        const bid: resources.Bid = await this.bidService.findOne(bidId)
            .then(value => {
                return value.toJSON();
            });

        // make sure ListingItem exists
        if (_.isEmpty(bid.ListingItem)) {
            this.log.error('ListingItem not found.');
            throw new MessageException('ListingItem not found.');
        }

        // make sure we have a ListingItemTemplate, so we know it's our item
        if (_.isEmpty(bid.ListingItem.ListingItemTemplate)) {
            this.log.error('Not your ListingItem.');
            throw new MessageException('Not your ListingItem.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <bidId>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <bidId>                  - number - The id of the item we want to accept. ';
    }

    public description(): string {
        return 'Accept bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 1';
    }
}
