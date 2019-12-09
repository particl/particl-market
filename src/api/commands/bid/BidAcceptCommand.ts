// Copyright (c) 2017-2019, The Particl Market developers
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
import { ListingItemService } from '../../services/model/ListingItemService';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { BidService } from '../../services/model/BidService';
import { BidAcceptActionService } from '../../services/action/BidAcceptActionService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { BidAcceptRequest } from '../../requests/action/BidAcceptRequest';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { IdentityService } from '../../services/model/IdentityService';
import { ProfileService } from '../../services/model/ProfileService';
import { MessageException } from '../../exceptions/MessageException';

export class BidAcceptCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.action.BidAcceptActionService) private bidAcceptActionService: BidAcceptActionService
    ) {
        super(Commands.BID_ACCEPT);
        this.log = new Logger(__filename);
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

        const fromIdentity = identity;          // send from the given identity
        const toAddress = bid.bidder;           // send to the address that sent the bid

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromIdentity, toAddress, false, daysRetention, estimateFee),
            bid
        } as BidAcceptRequest;

        return this.bidAcceptActionService.post(postRequest);
    }

    /**
     * data.params[]:
     * [0]: bidId, number
     * [1]: identityId, number
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

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('bidId', 'number');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        }

        const bid: resources.Bid = await this.bidService.findOne(data.params[0]).then(value => value.toJSON());

        // make sure ListingItem exists
        if (_.isEmpty(bid.ListingItem)) {
            this.log.error('ListingItem not found.');
            throw new ModelNotFoundException('ListingItem');
        }

        // make sure we have a ListingItemTemplate, so we know it's our item
        if (_.isEmpty(bid.ListingItem.ListingItemTemplate)) {
            this.log.error('Not your ListingItem.');
            throw new ModelNotFoundException('ListingItemTemplate');
        }

        const listingItem: resources.ListingItem = await this.listingItemService.findOne(bid.ListingItem.id)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItem');
            });

        const identity: resources.Identity = await this.identityService.findOne(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        if (listingItem.ListingItemTemplate.Profile.id !== identity.Profile.id) {
            throw new MessageException('Given Identity does not belong to the Profile which was used to post the ListingItem.');
        }

        // TODO: check that we are the seller

        data.params[0] = bid;
        data.params[1] = identity;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <bidId> <identityId>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <bidId>                  - number - The id of the Bid we want to accept. '
            + '    <identityId>             - number - The id of the Identity used to accept to Bid. ';
    }

    public description(): string {
        return 'Accept Bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 1';
    }
}
