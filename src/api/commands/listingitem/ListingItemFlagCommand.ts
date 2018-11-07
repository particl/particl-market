// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import * as resources from 'resources';
import { ProposalType } from '../../enums/ProposalType';
import { ListingItem } from '../../models/ListingItem';
import { ProfileService } from '../../services/ProfileService';
import { MarketService } from '../../services/MarketService';
import { ProposalActionService } from '../../services/ProposalActionService';
import { CoreRpcService } from '../../services/CoreRpcService';
import { ListingItemActionService } from '../../services/ListingItemActionService';
import { ItemVote } from '../../enums/ItemVote';
import { ProposalFactory } from '../../factories/ProposalFactory';
import * as _ from 'lodash';
import {ModelNotFoundException} from '../../exceptions/ModelNotFoundException';

export class ListingItemFlagCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemActionService) public listingItemActionService: ListingItemActionService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ProposalActionService) public proposalActionService: ProposalActionService,
        @inject(Types.Factory) @named(Targets.Factory.ProposalFactory) private proposalFactory: ProposalFactory
    ) {
        super(Commands.ITEM_FLAG);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemHash
     *  [1]: profileId
     *  [2]: reason, optional
     *  [3]: expiryTime (from listingitem, set in validate)
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const listingItemHash = data.params.shift();
        const profileId = data.params.shift();
        const proposalDescription = data.params.shift();
        const daysRetention = data.params.shift();  // not perfect, but more than needed

        const optionsList: string[] = [ItemVote.KEEP, ItemVote.REMOVE];
        const proposalTitle = listingItemHash;

        const profileModel = await this.profileService.findOne(profileId); // throws if not found
        const profile: resources.Profile = profileModel.toJSON();

        // Get the default market.
        // TODO: this should be a command parameter
        const marketModel = await this.marketService.getDefault(); // throws if not found
        const market: resources.Market = marketModel.toJSON();

        return await this.proposalActionService.send(
            proposalTitle,
            proposalDescription,
            daysRetention,
            optionsList,
            profile,
            market,
            listingItemHash,
            false
        );

    }

    /**
     * data.params[]:
     *  [0]: listingItemHash
     *  [1]: profileId
     *  [2]: reason, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MessageException('Missing listingItemHash.');
        }
        if (data.params.length < 2) {
            throw new MessageException('Missing profileId.');
        }

        let listingItemModel: ListingItem;
        if (typeof data.params[0] !== 'string') {
            throw new MessageException('Invalid listingItemHash.');
        } else {
            listingItemModel = await this.listingItemService.findOneByHash(data.params[0])
                .catch(reason => {
                    throw new MessageException('ListingItem not found.');
                });
        }
        const listingItem: resources.ListingItem = listingItemModel.toJSON();

        // check if item is already flagged
        if (!_.isEmpty(listingItem.FlaggedItem)) {
            throw new MessageException('Item is already flagged.');
        }

        // hash is what we need in execute()
        data.params[0] = listingItem.hash;  // set to hash

        if (typeof data.params[1] !== 'number') {
            throw new MessageException('profileId needs to be a number.');
        } else {
            // make sure profile with the id exists
            await this.profileService.findOne(data.params[1])    // throws if not found
                .catch(reason => {
                    this.log.error(reason);
                    throw new MessageException('Profile not found.');
                });
        }

        data.params[2] = data.params.length === 3 ? data.params[2] : 'This ListingItem should be removed.';
        data.params[3] = listingItem.expiryTime;

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<listingItemHash>] <profileId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemHash>  - String - The hash of the ListingItem we want to report. \n'
            + '    <profileId>        - Numeric - The ID of the Profile reporting the item.';
    }

    public description(): string {
        return 'Report a ListingItem.';
    }
}
