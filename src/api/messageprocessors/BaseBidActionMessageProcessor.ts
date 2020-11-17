// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { SmsgMessageService } from '../services/model/SmsgMessageService';
import { Logger as LoggerType } from '../../core/Logger';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { BidService } from '../services/model/BidService';
import { ProposalService } from '../services/model/ProposalService';
import { ListingItemService } from '../services/model/ListingItemService';
import { BidFactory } from '../factories/model/BidFactory';
import { BaseActionMessageProcessor } from './BaseActionMessageProcessor';
import { ActionMessageValidatorInterface } from '../messagevalidators/ActionMessageValidatorInterface';
import { ActionServiceInterface } from '../services/ActionServiceInterface';
import { unmanaged } from 'inversify';
import { NotificationService } from '../services/model/NotificationService';

// @injectable()
export abstract class BaseBidActionMessageProcessor extends BaseActionMessageProcessor {

    public listingItemService: ListingItemService;
    public bidFactory: BidFactory;

    constructor(@unmanaged() eventType: ActionMessageTypes,
                @unmanaged() actionService: ActionServiceInterface,
                @unmanaged() smsgMessageService: SmsgMessageService,
                @unmanaged() bidService: BidService,
                @unmanaged() proposalService: ProposalService,
                @unmanaged() notificationService: NotificationService,
                @unmanaged() validator: ActionMessageValidatorInterface,
                @unmanaged() listingItemService: ListingItemService,
                @unmanaged() bidFactory: BidFactory,
                @unmanaged() Logger: typeof LoggerType) {
        super(
            eventType,
            actionService,
            smsgMessageService,
            bidService,
            proposalService,
            notificationService,
            validator,
            Logger
        );

        this.listingItemService = listingItemService;
        this.bidFactory = bidFactory;
    }

    // TODO: this class isn't really needed anymore
}
