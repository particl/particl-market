// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
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
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { BidCancelRequest } from '../../requests/action/BidCancelRequest';
import { BidCancelActionService } from '../../services/action/BidCancelActionService';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { ProfileService } from '../../services/model/ProfileService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { IdentityService } from '../../services/model/IdentityService';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule } from '../CommandParamValidation';


export class BidCancelCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.action.BidCancelActionService) private bidCancelActionService: BidCancelActionService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService
    ) {
        super(Commands.BID_CANCEL);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('bidId', true, this.bidService),
                new IdValidationRule('identityId', true, this.identityService)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     * [0]: bid, resources.Bid
     * [1]: identity, resources.Identity
     *
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {
        const bid: resources.Bid = data.params[0];
        const identity: resources.Identity = data.params[1];

        const fromAddress = identity.address;
        let toAddress = bid.bidder;
        if (identity.address === bid.bidder) {      // if we are the bidder, then send to seller
            toAddress = bid.OrderItem.Order.seller;
        }

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(identity.wallet, fromAddress, toAddress, false, daysRetention, estimateFee),
            bid
        } as BidCancelRequest;
        return this.bidCancelActionService.post(postRequest);
    }

    /**
     * data.params[]:
     * [0]: bidId
     * [1]: identityId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const bid: resources.Bid = data.params[0];
        const identity: resources.Identity = data.params[1];

        // make sure ListingItem exists
        if (_.isEmpty(bid.ListingItem)) {
            this.log.error('ListingItem not found.');
            throw new ModelNotFoundException('ListingItem');
        }

        // make sure the Escrow hasnt been completed yet
        const childBid: resources.Bid | undefined = _.find(bid.ChildBids, (child) => {
            return child.type === MPActionExtended.MPA_COMPLETE;
        });
        if (childBid) {
            throw new MessageException('Escrow has already been completed, unable to cancel.');
        }

        await this.listingItemService.findOne(bid.ListingItem.id)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItem');
            });

        data.params[0] = bid;
        data.params[1] = identity;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <bidId> <identityId>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <bidId>                  - number, The ID of the Bid we want to cancel. '
            + '    <identityId>             - number, The ID of the Identity used to cancel to Bid. ';
    }

    public description(): string {
        return 'Cancel Bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 1 1';
    }
}
