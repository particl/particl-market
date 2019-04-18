// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ActionServiceInterface } from './ActionServiceInterface';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { ActionDirection } from '../../enums/ActionDirection';
import { ActionRequestInterface } from '../../requests/action/ActionRequestInterface';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { SmsgService } from '../SmsgService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { SmsgMessageCreateParams } from '../../factories/model/ModelCreateParams';
import { MessageException } from '../../exceptions/MessageException';
import { ValidationException } from '../../exceptions/ValidationException';
import { ActionProcessorInterface } from './ActionProcessorInterface';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { ActionMessageTypes } from '../../enums/ActionMessageTypes';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ListingItemAddValidator } from '../../messages/validator/ListingItemAddValidator';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { EventEmitter } from 'events';
import { MPActionExtended } from '../../enums/MPActionExtended';
import {strip} from 'omp-lib/dist/util';

export abstract class BaseActionService implements ActionServiceInterface, ActionProcessorInterface {

    private static validate(msg: MarketplaceMessage): boolean {

        switch (msg.action.type) {
            case MPAction.MPA_LISTING_ADD:
                return ListingItemAddValidator.isValid(msg);
            case MPAction.MPA_BID:
            case MPAction.MPA_ACCEPT:
            case MPAction.MPA_REJECT:
            case MPAction.MPA_CANCEL:
            case MPAction.MPA_LOCK:
            case MPActionExtended.MPA_REFUND:
            case MPActionExtended.MPA_RELEASE:
            case GovernanceAction.MPA_PROPOSAL_ADD:
            case GovernanceAction.MPA_VOTE:
            default:
                throw new NotImplementedException();
        }
    }

    public smsgService: SmsgService;
    public smsgMessageService: SmsgMessageService;
    public smsgMessageFactory: SmsgMessageFactory;
    public eventEmitter: EventEmitter;

    constructor(eventType: ActionMessageTypes, smsgService: SmsgService, smsgMessageService: SmsgMessageService, smsgMessageFactory: SmsgMessageFactory,
                eventEmitter: EventEmitter) {
        this.smsgService = smsgService;
        this.smsgMessageService = smsgMessageService;
        this.smsgMessageFactory = smsgMessageFactory;
        this.eventEmitter = eventEmitter;
        this.configureEventListener(eventType);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     * @param params
     */
    public abstract async createMessage(params: ActionRequestInterface): Promise<MarketplaceMessage>;

    /**
     * validate the MarketplaceMessage to which is to be posted to the network
     * @param marketplaceMessage
     */
    public abstract async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean>;

    /**
     * handle the event
     * @param event
     */
    public abstract async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus>;

    /**
     * - create the marketplaceMessage, extending class should implement
     * - validate it, extending class should implement
     * - return estimate, if thats what was requested
     * - strip marketplaceMessage
     * - send marketplaceMessage
     * - save outgoing marketplaceMessage to database
     *
     * @param params
     */
    public async post(params: ActionRequestInterface): Promise<SmsgSendResponse> {
        return await this.createMessage(params)
            .then(async marketplaceMessage => {

                const validated = await this.validateMessage(marketplaceMessage);
                if (validated) {
                    if (params.sendParams.estimateFee) {
                        return await this.estimateFee(marketplaceMessage, params.sendParams);
                    } else {
                        marketplaceMessage = await this.beforePost(params, marketplaceMessage);
                        marketplaceMessage = strip(marketplaceMessage);
                        return await this.sendMessage(marketplaceMessage, params.sendParams)
                            .then(async smsgSendResponse => {
                                smsgSendResponse = await this.afterPost(params, marketplaceMessage, smsgSendResponse);
                                // todo: get rid of this if, its only here because smsgSendResponse.msgid is optional
                                // because in one special case we return msgids, so they're both optional
                                if (smsgSendResponse.msgid) {
                                    await this.saveMessage(smsgSendResponse.msgid, ActionDirection.OUTGOING);
                                    return smsgSendResponse;
                                } else {
                                    // we should never end up here.
                                    throw new MessageException('No smsgSendResponse.msgid.');
                                }
                            });
                    }
                } else {
                    throw new ValidationException('Invalid MarketplaceMessage.', ['Send failed.']);
                }
            });
    }

    /**
     * called before post is executed and message is sent
     *
     * if you need to add something to MarketplaceMessage, this is the place to do it.
     * @param params
     * @param message
     */
    public abstract async beforePost(params: ActionRequestInterface, message: MarketplaceMessage): Promise<MarketplaceMessage>;

    /**
     * called after post is executed and message is sent
     * @param params
     * @param message
     * @param smsgSendResponse
     */
    public abstract async afterPost(params: ActionRequestInterface, message: MarketplaceMessage, smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse>;

    /**
     *
     * @param marketplaceMessage
     * @param sendParams
     */
    private async estimateFee(marketplaceMessage: MarketplaceMessage, sendParams: SmsgSendParams): Promise<SmsgSendResponse> {
        sendParams.estimateFee = true; // forcing estimation just in case someone calls this directly with incorrect params
        return await this.sendMessage(marketplaceMessage, sendParams);
    }

    /**
     *
     * @param marketplaceMessage
     * @param sendParams
     */
    private async sendMessage(marketplaceMessage: MarketplaceMessage, sendParams: SmsgSendParams): Promise<SmsgSendResponse> {
        return await this.smsgService.smsgSend(sendParams.fromAddress, sendParams.toAddress, marketplaceMessage, sendParams.paidMessage,
            sendParams.daysRetention, sendParams.estimateFee);
    }

    /**
     * finds the CoreSmsgMessage and saves it into the database as SmsgMessage
     *
     * @param direction
     * @param msgid
     */
    private async saveMessage(msgid: string, direction: ActionDirection): Promise<resources.SmsgMessage> {
        return await this.smsgService.smsg(msgid, false, false)
            .then(async coreMessage => {
                return await this.smsgMessageFactory.get({
                    direction: ActionDirection.OUTGOING,
                    message: coreMessage
                    // todo: add also target here if its known
                } as SmsgMessageCreateParams)
                    .then(async createRequest => {
                        return await this.smsgMessageService.create(createRequest)
                            .then(value => value.toJSON());
                    });
            });
    }

    /**
     * - validate the received MarketplaceMessage
     *   - on failure: update the SmsgMessage.status to SmsgMessageStatus.VALIDATION_FAILED
     * - call onEvent to process the message
     * - if there's no errors, update the SmsgMessage.status
     * - in case of Exception, also update the SmsgMessage.status to SmsgMessageStatus.PROCESSING_FAILED
     *
     * @param eventType
     */
    private configureEventListener(eventType: ActionMessageTypes): void {
        this.eventEmitter.on(eventType, async (event: MarketplaceMessageEvent) => {

            if (BaseActionService.validate(event.marketplaceMessage)) {
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
        });
    }

}
