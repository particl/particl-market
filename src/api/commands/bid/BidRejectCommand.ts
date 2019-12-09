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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BidRejectReason } from '../../enums/BidRejectReason';
import { BidRejectRequest } from '../../requests/action/BidRejectRequest';
import { IdentityService } from '../../services/model/IdentityService';

export class BidRejectCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.action.BidRejectActionService) private bidRejectActionService: BidRejectActionService
    ) {
        super(Commands.BID_REJECT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: bid, resources.Bid
     * [1]: identity, resources.Identity
     * [2]: reason: BidRejectReason, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {
        const bid: resources.Bid = data.params[0];
        const identity: resources.Identity = data.params[1];
        const reason: BidRejectReason = data.params[2];

        const fromIdentity = identity;          // send from the given identity
        // const fromAddress = bid.OrderItem.Order.seller;  // we are the seller
        const toAddress = bid.OrderItem.Order.buyer;

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromIdentity, toAddress, false, daysRetention, estimateFee),
            bid,
            reason
        } as BidRejectRequest;

        return this.bidRejectActionService.post(postRequest);
    }

    /**
     * data.params[]:
     * [0]: bidId
     * [1]: identityId
     * [2]: reason: BidRejectReason, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('bidId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('identityId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('bidId', 'number');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        }

        if (data.params.length >= 3) {
            const reason = data.params[2];
            if (typeof reason !== 'string') {
                throw new InvalidParamException('reasonEnum', 'BidRejectReason');
            } else if (!BidRejectReason[reason]) {
                throw new InvalidParamException('reasonEnum', 'BidRejectReason');
            }
            data.params[2] = BidRejectReason[reason];
        }

        // make sure Bid exists
        const bid: resources.Bid = await this.bidService.findOne(data.params[0]).then(value => value.toJSON());

        // make sure ListingItem exists
        if (_.isEmpty(bid.ListingItem)) {
            this.log.error('ListingItem not found.');
            throw new ModelNotFoundException('ListingItem');
        }

        // make sure we have a ListingItemTemplate, so we know we are the seller
        if (_.isEmpty(bid.ListingItem.ListingItemTemplate)) {
            throw new ModelNotFoundException('ListingItemTemplate');
        }

        // make sure the Bid has not been accepted yet
        const childBid: resources.Bid | undefined = _.find(bid.ChildBids, (child) => {
            return child.type === MPAction.MPA_ACCEPT;
        });
        if (childBid) {
            throw new MessageException('Bid has already been accepted.');
        }

        const identity: resources.Identity = await this.identityService.findOne(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        data.params[0] = bid;
        data.params[1] = identity;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <bidId> <identityId> [reason] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
        + '    <bidId>                  - Numeric - The ID of the Bid we want to reject. '
        + '    <identityId>             - number - The id of the Identity used to cancel to Bid. '
        + '    <reason>                 - [optional] BidRejectReason - The predefined reason you want to specify for cancelling the Bid. ';
    }

    public description(): string {
        return 'Reject a Bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 1 OUT_OF_STOCK ';
    }
}
