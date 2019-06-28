// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { BidService } from '../../services/model/BidService';
import { BidRejectActionService } from '../../services/action/BidRejectActionService';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { BidCancelRequest } from '../../requests/action/BidCancelRequest';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { NotImplementedException } from '../../exceptions/NotImplementedException';

export class BidRejectCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.action.BidRejectActionService) private bidRejectActionService: BidRejectActionService
    ) {
        super(Commands.BID_REJECT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: bid, resources.Bid
     *
     * @param {RpcRequest} data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {
        const bid: resources.Bid = data.params[0];

        const fromAddress = bid.OrderItem.Order.seller;  // we are the seller
        const toAddress = bid.OrderItem.Order.buyer;

        // TODO: currently hardcoded!!! parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10)
        const daysRetention = 2;
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, false, daysRetention, estimateFee),
            bid
        } as BidCancelRequest;

        return this.bidRejectActionService.post(postRequest);
    }

    /**
     * data.params[]:
     * [0]: bidId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('bidId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('bidId', 'number');
        }

        const bid: resources.Bid = await this.bidService.findOne(data.params[0]).then(value => value.toJSON());
        data.params[0] = bid;

        if (_.isEmpty(bid.ListingItem)) {
            throw new ModelNotFoundException('ListingItem');
        }

        const childBid: resources.Bid | undefined = _.find(bid.ChildBids, (child) => {
            return child.type === MPAction.MPA_ACCEPT;
        });
        if (childBid) {
            throw new MessageException('Bid has already been accepted.');
        }

        // TODO: check that we are the seller

        return data;
    }

    public usage(): string {
        return this.getName() + ' <itemhash> <bidId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
        + '    <itemhash>               - String - The hash if the item whose bid we want to reject. '
        + '    <bidId>                  - Numeric - The ID of the bid we want to reject. ';
    }

    public description(): string {
        return 'Reject bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
}
