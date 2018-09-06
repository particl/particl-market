// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { FlaggedItemCreateRequest } from '../../requests/FlaggedItemCreateRequest';
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
import { ListingItemTemplate } from '../../models/ListingItemTemplate';

export class ListingItemFlagCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemActionService) public listingItemActionService: ListingItemActionService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ProposalActionService) public proposalActionService: ProposalActionService
    ) {
        super(Commands.ITEM_FLAG);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemId or hash
     *  [1]: profileId
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {
        if (data.params.length < 4) {
            throw new MessageException('Requires arg: listingItemId');
        }

        let listingItem: ListingItem;
        // if listingItemId is number then findById, else findOneByHash
        const listingItemId = data.params.shift();
        if (typeof listingItemId === 'number') {
            listingItem = await this.listingItemService.findOne(listingItemId);
        } else {
            listingItem = await this.listingItemService.findOneByHash(listingItemId);
        }

        const listingItemTemplate: any = listingItem.ListingItemTemplate();

        const profileId = data.params.shift();
        const blockStart = await this.coreRpcService.getBlockCount();
        const blockEnd = blockStart + 1000000;

        if (typeof profileId !== 'number') {
            throw new MessageException('profileId needs to be a number.');
        } else if (typeof blockStart !== 'number') {
            throw new MessageException('blockStart needs to be a number.');
        } else if (typeof blockEnd !== 'number') {
            throw new MessageException('blockEnd needs to be a number.');
        }

        // check if item already flagged
        const isFlagged = await this.listingItemService.isItemFlagged(listingItem);

        if (isFlagged) {
            throw new MessageException('Item already being flagged!');
        } else {
            const type = ProposalType.ITEM_VOTE;
            const proposalTitle = 'ITEM_FLAG:';
            const proposalDescription = 'ITEM_FLAG:';
            const daysRetention = 30;
            const estimateFee = false;

            let profile: resources.Profile;
            try {
                const profileModel = await this.profileService.findOne(profileId);
                profile = profileModel.toJSON();
            } catch ( ex ) {
                this.log.error(ex);
                throw new MessageException('Profile not found.');
            }

            // Get the default market.
            // TODO: Might want to let users specify this later.
            let market: resources.Market;
            const marketModel = await this.marketService.getDefault();
            if (!marketModel) {
                throw new MessageException(`Default market doesn't exist!`);
            }
            market = marketModel.toJSON();

            // rest of the data.params are option descriptions
            const optionsList: string[] = ['REMOVE', 'KEEP'];

            // todo: get rid of the blocks
            // const daysRetention = Math.ceil((blockEnd - blockStart) / (24 * 30));
            // return this.proposalActionService.send(type, proposalTitle, proposalDescription, blockStart, blockEnd,
            //     daysRetention, optionsList, profile, market, estimateFee);

            const proposalMessage = await this.listingItemActionService.createProposalMessage(listingItemTemplate, daysRetention, profile);
            this.log.debug('post(), proposalMessage: ', proposalMessage);
            return await this.listingItemActionService.postProposal(proposalMessage, daysRetention, profile, market);
        }
    }

    public usage(): string {
        return this.getName() + ' [<listingItemId>|<hash>] <profileId> <blockStart> <blockEnd>';
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
