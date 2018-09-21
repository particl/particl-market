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
import { ProposalMessage } from '../../messages/ProposalMessage';
import { ProposalFactory } from '../../factories/ProposalFactory';
import { ProposalMessageType } from '../../enums/ProposalMessageType';

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

        const optionsList: string[] = [ItemVote.KEEP, ItemVote.REMOVE];
        const proposalTitle = listingItemHash;
        const proposalDescription = '';
        const daysRetention = 30;

        // TODO: refactor these to startTime and endTime
        // TODO: When we're expiring by time not block make this listingItem.ExpiryTime();
        const blockStart: number = await this.coreRpcService.getBlockCount();
        const blockEnd: number = blockStart + (daysRetention * 24 * 30);

        if (typeof blockStart !== 'number') {
            throw new MessageException('blockStart needs to be a number.');
        } else if (typeof blockEnd !== 'number') {
            throw new MessageException('blockEnd needs to be a number.');
        }

        const profileModel = await this.profileService.findOne(profileId) // throws if not found
            .catch(reason => {
                this.log.error('ERROR:', reason);
                throw new MessageException('Profile not found.');
            });
        const profile: resources.Profile = profileModel.toJSON();

        const proposalMessage: ProposalMessage = await this.proposalFactory.getMessage(
            ProposalMessageType.MP_PROPOSAL_ADD,
            proposalTitle,
            proposalDescription,
            blockStart,
            blockEnd,
            optionsList,
            profile,
            listingItemHash
        );

        // Get the default market.
        // TODO: We might want to let users specify this later.
        const marketModel = await this.marketService.getDefault(); // throws if not found
        const market: resources.Market = marketModel.toJSON();

        this.log.debug('post(), proposalMessage: ', JSON.stringify(proposalMessage, null, 2));
        return await this.listingItemActionService.postProposal(proposalMessage, daysRetention, profile, market);

    }

    /**
     * data.params[]:
     *  [0]: listingItemId or hash
     *  [1]: profileId
     *
     * when data.params[0] is hash, fetch the id
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 2) {
            throw new MessageException('Missing params.');
        }

        let listingItemModel: ListingItem;
        if (typeof data.params[0] === 'number') {
            listingItemModel = await this.listingItemService.findOne(data.params[0]);
        } else {
            listingItemModel = await this.listingItemService.findOneByHash(data.params[0]);
        }
        const listingItem: resources.ListingItem = listingItemModel.toJSON();

        // hash is what we need in execute()
        data.params[0] = listingItem.hash;  // set to hash

        if (typeof data.params[1] !== 'number') {
            throw new MessageException('profileId needs to be a number.');
        }

        // check if item already flagged
        const isFlagged = await this.listingItemService.isItemFlagged(listingItem);
        if (isFlagged) {
            throw new MessageException('Item is already flagged.');
        }


        // -----------------
        if (data.params.length < 1) {
            this.log.error('ListingItemTemplate ID missing.');
            throw new MessageException('ListingItemTemplate ID missing.');
        } else if (typeof data.params[0] !== 'number') {
            this.log.error('ListingItemTemplate ID must be numeric.');
            throw new MessageException('ListingItemTemplate ID must be numeric.');
        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' [<listingItemId>|<hash>] <profileId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>     - Numeric - The ID of the listing item we want to flag. \n'

            + '    <hash>             - String - The hash of the listing item we want to flag. \n'
            + '    <profileId>        - TODO';
    }

    public description(): string {
        return 'Flag a listing item via given listingItemId or hash.';
    }
}
