// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { injectable } from 'inversify';
import { ActionListenerInterface } from './ActionListenerInterface';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ListingItemAddValidator } from '../messages/validator/ListingItemAddValidator';
import { MPActionExtended } from '../enums/MPActionExtended';
import { GovernanceAction } from '../enums/GovernanceAction';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { SmsgMessageService } from '../services/model/SmsgMessageService';
import { Logger as LoggerType } from '../../core/Logger';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { MarketplaceMessageEvent } from '../messages/MarketplaceMessageEvent';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { BidValidator } from '../messages/validator/BidValidator';
import { BidAcceptValidator } from '../messages/validator/BidAcceptValidator';
import { BidRejectValidator } from '../messages/validator/BidRejectValidator';
import { BidCancelValidator } from '../messages/validator/BidCancelValidator';
import { EscrowLockValidator } from '../messages/validator/EscrowLockValidator';
import { EscrowRefundValidator } from '../messages/validator/EscrowRefundValidator';
import { EscrowReleaseValidator } from '../messages/validator/EscrowReleaseValidator';
import { ProposalAddValidator } from '../messages/validator/ProposalAddValidator';
import { VoteValidator } from '../messages/validator/VoteValidator';

// TODO: rename, refactor
@injectable()
export abstract class BaseActionListenr implements ActionListenerInterface {

    public static validate(msg: MarketplaceMessage): boolean {

        switch (msg.action.type) {
            case MPAction.MPA_LISTING_ADD:
                return ListingItemAddValidator.isValid(msg);
            case MPAction.MPA_BID:
                return BidValidator.isValid(msg);
            case MPAction.MPA_ACCEPT:
                return BidAcceptValidator.isValid(msg);
            case MPAction.MPA_REJECT:
                return BidRejectValidator.isValid(msg);
            case MPAction.MPA_CANCEL:
                return BidCancelValidator.isValid(msg);
            case MPAction.MPA_LOCK:
                return EscrowLockValidator.isValid(msg);
            case MPActionExtended.MPA_REFUND:
                return EscrowRefundValidator.isValid(msg);
            case MPActionExtended.MPA_RELEASE:
                return EscrowReleaseValidator.isValid(msg);
            case GovernanceAction.MPA_PROPOSAL_ADD:
                return ProposalAddValidator.isValid(msg);
            case GovernanceAction.MPA_VOTE:
                return VoteValidator.isValid(msg);
            default:
                throw new NotImplementedException();
        }
    }

    public smsgMessageService: SmsgMessageService;
    public log: LoggerType;
    public eventType: ActionMessageTypes;

    constructor(eventType: ActionMessageTypes, smsgMessageService: SmsgMessageService, Logger: typeof LoggerType) {

        this.log = new Logger(eventType);
        this.smsgMessageService = smsgMessageService;
        this.eventType = eventType;

    }

    /**
     * handle the event
     * @param event
     */
    public abstract async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus>;

    /**
     * - validate the received MarketplaceMessage
     *   - on failure: update the SmsgMessage.status to SmsgMessageStatus.VALIDATION_FAILED
     * - call onEvent to process the message
     * - if there's no errors, update the SmsgMessage.status
     * - in case of Exception, also update the SmsgMessage.status to SmsgMessageStatus.PROCESSING_FAILED
     *
     * @param event
     * @returns {Promise<void>}
     */
    public async act(event: MarketplaceMessageEvent): Promise<void> {
        this.log.info('Received event: ', event.smsgMessage.type/*JSON.stringify(event, null, 2)*/);

        if (BaseActionListenr.validate(event.marketplaceMessage)) {
            await this.onEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    // todo: handle different reasons?
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        } else {
            await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.VALIDATION_FAILED);
        }
    }

}
