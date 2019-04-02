// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { ActionMessageTypes } from '../../enums/ActionMessageTypes';
import { ompVersion } from 'omp-lib/dist/omp';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { ListingItemAddMessageFactory } from './ListingItemAddMessageFactory';
import {
    MessageCreateParams,
    ListingItemAddMessageCreateParams,
    BidMessageCreateParams, BidAcceptMessageCreateParams, BidCancelMessageCreateParams, BidRejectMessageCreateParams,
    EscrowMessageCreateParams,
    ProposalAddMessageCreateParams, VoteMessageCreateParams
} from './MessageCreateParams';
import { BidMessageFactory } from './BidMessageFactory';
import { BidAcceptMessageFactory } from './BidAcceptMessageFactory';
import { BidCancelMessageFactory } from './BidCancelMessageFactory';
import { BidRejectMessageFactory } from './BidRejectMessageFactory';
import { EscrowLockMessageFactory } from './EscrowLockMessageFactory';
import { EscrowRefundMessageFactory } from './EscrowRefundMessageFactory';
import { EscrowReleaseMessageFactory } from './EscrowReleaseMessageFactory';
import { VoteMessageFactory } from './VoteMessageFactory';
import { ProposalAddMessageFactory } from './ProposalAddMessageFactory';

export class MarketplaceMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemAddMessageFactory) private listingItemMessageFactory: ListingItemAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidMessageFactory) private bidMessageFactory: BidMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidAcceptMessageFactory) private bidAcceptMessageFactory: BidAcceptMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidCancelMessageFactory) private bidCancelMessageFactory: BidCancelMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidRejectMessageFactory) private bidRejectMessageFactory: BidRejectMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.EscrowLockMessageFactory) private escrowLockMessageFactory: EscrowLockMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.EscrowRefundMessageFactory) private escrowRefundMessageFactory: EscrowRefundMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.EscrowReleaseMessageFactory) private escrowReleaseMessageFactory: EscrowReleaseMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ProposalAddMessageFactory) private proposalMessageFactory: ProposalAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.VoteMessageFactory) private voteMessageFactory: VoteMessageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(type: ActionMessageTypes, parameters: MessageCreateParams): Promise<MarketplaceMessage> {

        const marketplaceMessage = {
            version: ompVersion()
        } as MarketplaceMessage;

        switch (type) {
            case MPAction.MPA_LISTING_ADD:
                marketplaceMessage.action = await this.listingItemMessageFactory.get(parameters as ListingItemAddMessageCreateParams);
                break;
            case MPAction.MPA_BID:
                marketplaceMessage.action = await this.bidMessageFactory.get(parameters as BidMessageCreateParams);
                break;
            case MPAction.MPA_ACCEPT:
                marketplaceMessage.action = await this.bidAcceptMessageFactory.get(parameters as BidAcceptMessageCreateParams);
                break;
            case MPAction.MPA_CANCEL:
                marketplaceMessage.action = await this.bidCancelMessageFactory.get(parameters as BidCancelMessageCreateParams);
                break;
            case MPAction.MPA_REJECT:
                marketplaceMessage.action = await this.bidRejectMessageFactory.get(parameters as BidRejectMessageCreateParams);
                break;
            case MPAction.MPA_LOCK:
                marketplaceMessage.action = await this.escrowLockMessageFactory.get(parameters as EscrowMessageCreateParams);
                break;
            case MPAction.MPA_REFUND:
                marketplaceMessage.action = await this.escrowRefundMessageFactory.get(parameters as EscrowMessageCreateParams);
                break;
            case MPAction.MPA_RELEASE:
                marketplaceMessage.action = await this.escrowReleaseMessageFactory.get(parameters as EscrowMessageCreateParams);
                break;
            case GovernanceAction.MP_PROPOSAL_ADD:
                marketplaceMessage.action = await this.proposalMessageFactory.get(parameters as ProposalAddMessageCreateParams);
                break;
            case GovernanceAction.MP_VOTE:
                marketplaceMessage.action = await this.voteMessageFactory.get(parameters as VoteMessageCreateParams);
                break;

            case MPAction.UNKNOWN:
                throw new NotImplementedException();
        }

        return marketplaceMessage;
    }

}
