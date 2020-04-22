// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { ActionMessageProcessorInterface } from './ActionMessageProcessorInterface';
import { SmsgMessageService } from '../services/model/SmsgMessageService';
import { Logger as LoggerType } from '../../core/Logger';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { MarketplaceMessageEvent } from '../messages/MarketplaceMessageEvent';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { BidService } from '../services/model/BidService';
import { ProposalService } from '../services/model/ProposalService';
import { ActionMessageValidatorInterface } from '../messagevalidators/ActionMessageValidatorInterface';
import { ActionDirection } from '../enums/ActionDirection';
import { ActionServiceInterface } from '../services/action/ActionServiceInterface';
import { MarketplaceNotification } from '../messages/MarketplaceNotification';
import { unmanaged } from 'inversify';

// @injectable()
export abstract class BaseActionMessageProcessor implements ActionMessageProcessorInterface {

    public smsgMessageService: SmsgMessageService;
    public bidService: BidService;
    public proposalService: ProposalService;
    public log: LoggerType;
    public eventType: ActionMessageTypes;
    public validator: ActionMessageValidatorInterface;
    public actionService: ActionServiceInterface;

    constructor(@unmanaged() eventType: ActionMessageTypes,
                @unmanaged() actionService: ActionServiceInterface,
                @unmanaged() smsgMessageService: SmsgMessageService,
                @unmanaged() bidService: BidService,
                @unmanaged() proposalService: ProposalService,
                @unmanaged() validator: ActionMessageValidatorInterface,
                @unmanaged() Logger: typeof LoggerType) {
        this.eventType = eventType;
        this.actionService = actionService;
        this.smsgMessageService = smsgMessageService;
        this.bidService = bidService;
        this.proposalService = proposalService;
        this.validator = validator;
        this.log = new Logger(eventType);
    }

    /**
     * handle the event, called from process()
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
    public async process(event: MarketplaceMessageEvent): Promise<void> {
        this.log.info('Received event: ', event.smsgMessage.type);

        const validContent = await this.validator.validateMessage(event.marketplaceMessage, ActionDirection.INCOMING, event.smsgMessage)
            .then(value => value)
            .catch(reason => false);
        const validSequence = await this.validator.validateSequence(event.marketplaceMessage, ActionDirection.INCOMING, event.smsgMessage)
            .then(value => value)
            .catch(reason => false);

        let updatedSmsgMessage: resources.SmsgMessage  = {} as resources.SmsgMessage;

        if (validContent) {
            if (!validSequence) {
                // if the sequence is not valid and if not expired, then wait to process again later
                if (event.smsgMessage.expiration >= Date.now()) {
                    this.log.error('Marketplace message has an invalid sequence. Waiting to process later. msgid: ', event.smsgMessage.msgid);
                    await this.smsgMessageService.updateStatus(event.smsgMessage.id, SmsgMessageStatus.WAITING);
                } else {
                    // expired, set processing failed.
                    this.log.error('Marketplace message has an invalid sequence and has expired. msgid: ', event.smsgMessage.msgid);
                    await this.smsgMessageService.updateStatus(event.smsgMessage.id, SmsgMessageStatus.PROCESSING_FAILED);
                }
                // skip this.onEvent()
                return;
            }

            await this.onEvent(event)

                .then(async status => {
                    // update the status based on onEvent result
                    updatedSmsgMessage = await this.smsgMessageService.updateStatus(event.smsgMessage.id, status).then(value => value.toJSON());
                })
                .catch(async reason => {

                    // if exception was thrown, processing failed
                    this.log.error('ERROR: ', reason);

                    this.log.error('marketplaceMessage:', JSON.stringify(event.marketplaceMessage, null, 2));
                    this.log.error('eventType:', JSON.stringify(event.smsgMessage.type, null, 2));
                    this.log.error('PROCESSING: ' + event.smsgMessage.msgid + ' PARSING FAILED');

                    updatedSmsgMessage = await this.smsgMessageService.updateStatus(event.smsgMessage.id, SmsgMessageStatus.PROCESSING_FAILED)
                        .then(value => value.toJSON());
                });
        } else {
            this.log.error('event.marketplaceMessage validation failed. msgid: ', event.smsgMessage.msgid);
            updatedSmsgMessage = await this.smsgMessageService.updateStatus(event.smsgMessage.id, SmsgMessageStatus.VALIDATION_FAILED)
                .then(value => value.toJSON());
        }

        const notification: MarketplaceNotification | undefined = await this.actionService.createNotification(event.marketplaceMessage,
            ActionDirection.INCOMING, updatedSmsgMessage);

        // only send if we created one
        if (notification) {
            await this.actionService.sendNotification(notification);
        }

    }
}
