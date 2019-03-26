// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import {Core, Targets, Types} from '../../constants';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { ompVersion } from 'omp-lib/dist/omp';
import { GovernanceAction } from '../enums/GovernanceAction';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemFactory } from './ListingItemFactory';
import * as resources from 'resources';

export interface ActionMessageCreateParams {
    //
}

export interface ListingItemMessageCreateParams extends ActionMessageCreateParams {
    template: resources.ListingItemTemplate;
}

export class MarketplaceMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) private listingItemFactory: ListingItemFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(type: ActionMessageTypes, parameters: ActionMessageCreateParams): Promise<MarketplaceMessage> {

        let action: ActionMessageInterface;

        switch (type) {
            case MPAction.MPA_LISTING_ADD:
                const template: resources.ListingItemTemplate = (parameters as ListingItemMessageCreateParams).template;
                action = await this.listingItemFactory.getMessage(template);

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
            case GovernanceAction.VOTE:
                throw new NotImplementedException();
        }
        const marketPlaceMessage = {
            version: ompVersion(),
            action,
        } as MarketplaceMessage;

        return marketplaceMessage;
    }

}
