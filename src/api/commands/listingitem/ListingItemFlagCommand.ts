// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ProfileService } from '../../services/model/ProfileService';
import { MarketService } from '../../services/model/MarketService';
import { ProposalAddActionService } from '../../services/action/ProposalAddActionService';
import { ItemVote } from '../../enums/ItemVote';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalAddRequest } from '../../requests/action/ProposalAddRequest';
import { IdentityService } from '../../services/model/IdentityService';

export class ListingItemFlagCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.action.ProposalAddActionService) public proposalAddActionService: ProposalAddActionService
    ) {
        super(Commands.ITEM_FLAG);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItem: resources.ListingItem
     *  [1]: identity: resources.Identity
     *  [2]: reason
     *  [3]: expiryTime (set in validate)
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const listingItem: resources.ListingItem = data.params[0];
        const identity: resources.Identity = data.params[1];
        const title = listingItem.hash;
        const description = data.params[2];
        const daysRetention = data.params[3];
        const options: string[] = [ItemVote.KEEP, ItemVote.REMOVE];

        // get the ListingItem market
        const market: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(identity.Profile.id, listingItem.market)
            .then(value => value.toJSON()); // throws if not found

        const fromAddress = identity.address;
        const toAddress = market.receiveAddress;

        const postRequest = {
            sendParams: new SmsgSendParams(identity.wallet, fromAddress, toAddress, true, daysRetention, false),
            sender: identity,
            market,
            category: ProposalCategory.ITEM_VOTE, // type should always be ITEM_VOTE when using this command
            title,
            description,
            options,
            itemHash: listingItem.hash
        } as ProposalAddRequest;

        return await this.proposalAddActionService.post(postRequest);
    }

    /**
     * data.params[]:
     *  [0]: listingItemId, number
     *  [1]: identityId, number
     *  [2]: reason, string, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('listingItemId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('identityId');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemId', 'number');
        } else if (data.params[1] && typeof data.params[1] !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        }

        const listingItem: resources.ListingItem = await this.listingItemService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItem');
            });

        // check if item is already flagged
        if (!_.isEmpty(listingItem.FlaggedItem)) {
            this.log.error('ListingItem is already flagged.');
            throw new MessageException('ListingItem is already flagged.');
        }

        // make sure identity with the id exists
        const identity: resources.Identity = await this.identityService.findOne(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        // check whether the identity is used on the ListingItems Market
        const foundMarket = _.find(identity.Markets, market => {
            return market.receiveAddress === listingItem.market;
        });

        if (!foundMarket) {
            throw new MessageException('Given Identity is not used on the Market which the ListingItem was posted to.');
        }

        const daysRetention = Math.ceil((listingItem.expiredAt  - new Date().getTime()) / 1000 / 60 / 60 / 24);

        data.params[0] = listingItem;
        data.params[1] = identity;
        data.params[2] = data.params[2] ? data.params[2] : 'This ListingItem should be removed.';
        data.params[3] = daysRetention;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemId> <identityId> [reason]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>    - Numeric - The id of the ListingItem we want to report. \n'
            + '    <identityId>       - Numeric - The id of the Identity used to report the item. \n'
            + '    <reason>           - String - Optional reason for the flagging';
    }

    public description(): string {
        return 'Report a ListingItem.';
    }

    public example(): string {
        return 'item 1 1';
    }
}
