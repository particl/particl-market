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
import { MessageCreateParams, ListingItemAddMessageCreateParams } from './MessageCreateParams';

export class MarketplaceMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemMessageFactory) private listingItemMessageFactory: ListingItemAddMessageFactory,
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
            case MPAction.MPA_ACCEPT:
            case MPAction.MPA_CANCEL:
            case MPAction.MPA_REJECT:
            case MPAction.MPA_LOCK:
            case MPAction.MPA_REFUND:
            case MPAction.MPA_RELEASE:
            case MPAction.UNKNOWN:
            case GovernanceAction.MP_PROPOSAL_ADD:
            case GovernanceAction.MP_VOTE:
                throw new NotImplementedException();
        }

        return marketplaceMessage;
    }

}
