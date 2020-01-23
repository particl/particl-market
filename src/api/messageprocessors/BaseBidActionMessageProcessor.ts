// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { injectable } from 'inversify';
import { SmsgMessageService } from '../services/model/SmsgMessageService';
import { Logger as LoggerType } from '../../core/Logger';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { BidService } from '../services/model/BidService';
import { ProposalService } from '../services/model/ProposalService';
import { BidCreateRequest } from '../requests/model/BidCreateRequest';
import { BidCreateParams } from '../factories/model/ModelCreateParams';
import { ListingItemService } from '../services/model/ListingItemService';
import { BidFactory } from '../factories/model/BidFactory';
import { BaseActionMessageProcessor } from './BaseActionMessageProcessor';
import { BidAcceptMessage } from '../messages/action/BidAcceptMessage';
import { BidCancelMessage } from '../messages/action/BidCancelMessage';
import { BidRejectMessage } from '../messages/action/BidRejectMessage';
import { EscrowCompleteMessage } from '../messages/action/EscrowCompleteMessage';
import { EscrowReleaseMessage } from '../messages/action/EscrowReleaseMessage';
import { EscrowRefundMessage } from '../messages/action/EscrowRefundMessage';
import { EscrowLockMessage } from '../messages/action/EscrowLockMessage';
import { OrderItemShipMessage } from '../messages/action/OrderItemShipMessage';
import {ActionMessageValidatorInterface} from '../messagevalidators/ActionMessageValidatorInterface';
import {ActionServiceInterface} from '../services/action/ActionServiceInterface';

// @injectable()
export abstract class BaseBidActionMessageProcessor extends BaseActionMessageProcessor {

    public listingItemService: ListingItemService;
    public bidFactory: BidFactory;

    constructor(eventType: ActionMessageTypes,
                actionService: ActionServiceInterface,
                smsgMessageService: SmsgMessageService,
                bidService: BidService,
                proposalService: ProposalService,
                validator: ActionMessageValidatorInterface,
                listingItemService: ListingItemService,
                bidFactory: BidFactory,
                Logger: typeof LoggerType) {
        super(eventType,
            actionService,
            smsgMessageService,
            bidService,
            proposalService,
            validator,
            Logger
        );

        this.listingItemService = listingItemService;
        this.bidFactory = bidFactory;
    }

    // TOOD: this class isn't really needed anymore
}
