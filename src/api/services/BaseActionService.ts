// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as WebRequest from 'web-request';
import { ActionServiceInterface } from './ActionServiceInterface';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ActionDirection } from '../enums/ActionDirection';
import { ActionRequestInterface } from '../requests/action/ActionRequestInterface';
import { SmsgService } from './SmsgService';
import { SmsgMessageService } from './model/SmsgMessageService';
import { SmsgMessageFactory } from '../factories/model/SmsgMessageFactory';
import { SmsgMessageCreateParams } from '../factories/ModelCreateParams';
import { MessageException } from '../exceptions/MessageException';
import { ValidationException } from '../exceptions/ValidationException';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { strip } from 'omp-lib/dist/util';
import { Logger as LoggerType } from '../../core/Logger';
import { ActionMessageValidatorInterface } from '../messagevalidators/ActionMessageValidatorInterface';
import { MarketplaceNotification } from '../messages/MarketplaceNotification';
import { NotificationService } from './NotificationService';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { unmanaged } from 'inversify';
import { MessageSize } from '../responses/MessageSize';
import { CoreMessageVersion } from '../enums/CoreMessageVersion';
import { MessageVersions } from '../messages/MessageVersions';
import { MessageSizeException } from '../exceptions/MessageSizeException';
import { ActionMessageInterface } from '../messages/action/ActionMessageInterface';
import { MessageWebhooks } from '../messages/MessageWebhooks';
import { AuthOptions, RequestOptions, Headers} from 'web-request';
import {Environment} from '../../core/helpers/Environment';


export abstract class BaseActionService implements ActionServiceInterface {

    public log: LoggerType;

    public smsgService: SmsgService;
    public smsgMessageService: SmsgMessageService;
    public notificationService: NotificationService;
    public smsgMessageFactory: SmsgMessageFactory;
    public validator: ActionMessageValidatorInterface;

    constructor(@unmanaged() eventType: ActionMessageTypes,
                @unmanaged() smsgService: SmsgService,
                @unmanaged() smsgMessageService: SmsgMessageService,
                @unmanaged() notificationService: NotificationService,
                @unmanaged() smsgMessageFactory: SmsgMessageFactory,
                @unmanaged() validator: ActionMessageValidatorInterface,
                @unmanaged() Logger: typeof LoggerType
    ) {
        this.log = new Logger(eventType);
        this.smsgService = smsgService;
        this.smsgMessageService = smsgMessageService;
        this.notificationService = notificationService;
        this.smsgMessageFactory = smsgMessageFactory;
        this.validator = validator;
    }

    /**
     * calculates the size of the MarketplaceMessage.
     * used to determine whether the MarketplaceMessage fits in the SmsgMessage size limits.
     *
     * @param marketplaceMessage
     * @param messageType, optional, override the default message version
     */
    public async getMarketplaceMessageSize(marketplaceMessage: MarketplaceMessage, messageType?: CoreMessageVersion): Promise<MessageSize> {

        const messageVersion: CoreMessageVersion = messageType ? messageType : MessageVersions.get(marketplaceMessage.action.type);
        const maxSize = MessageVersions.maxSize(messageVersion);

        const messageSize = JSON.stringify(marketplaceMessage).length;
        const spaceLeft = maxSize - messageSize;
        const fits = spaceLeft > 0;

        return {
            messageVersion,
            size: messageSize,
            maxSize,
            spaceLeft,
            fits
        } as MessageSize;

    }

    /**
     * Create the MarketplaceMessage to which is to be posted to the network.
     * Called first after call to post().
     *
     * @param actionRequest
     */
    public abstract async createMarketplaceMessage(actionRequest: ActionRequestInterface): Promise<MarketplaceMessage>;

    /**
     * - create the marketplaceMessage, extending class should implement
     * - validate it, extending class should implement
     * - return smsg fee estimate, if thats what was requested
     * - strip marketplaceMessage
     * - send marketplaceMessage
     * - save outgoing marketplaceMessage to database
     *
     * @param actionRequest
     */
    public async post(actionRequest: ActionRequestInterface): Promise<SmsgSendResponse> {

        // create the marketplaceMessage, extending class should implement
        let marketplaceMessage: MarketplaceMessage = await this.createMarketplaceMessage(actionRequest);
        // this.log.debug('post(), got marketplaceMessage:'); // , JSON.stringify(marketplaceMessage, null, 2));

        const messageSize: MessageSize = await this.getMarketplaceMessageSize(marketplaceMessage, actionRequest.sendParams.messageType);
        if (!messageSize.fits) {
            this.log.error('messageDataSize:', JSON.stringify(messageSize, null, 2));
            throw new MessageSizeException(marketplaceMessage.action.type, messageSize);
        }
        // this.log.debug('post(), messageSize:', JSON.stringify(messageSize, null, 2));

        // each message has objects?: KVS[] for extending messages, add those to the message here
        if (!_.isEmpty(actionRequest.objects)) {
            marketplaceMessage.action.objects = marketplaceMessage.action.objects ? marketplaceMessage.action.objects : [];
            marketplaceMessage.action.objects.push(...(actionRequest.objects ? actionRequest.objects : []));
        }

        // set process.env.MPMESSAGE_DEBUG=true to enable this
        this.marketplaceMessageDebug(ActionDirection.OUTGOING, marketplaceMessage.action);

        // validate message with the messageValidator
        const validContent = await this.validator.validateMessage(marketplaceMessage, ActionDirection.OUTGOING)
            .catch(reason => {
                this.log.error('Error: ', reason);
                return false;
            });

        this.log.debug('post(), validContent: ', validContent);

        if (!validContent) {
            this.log.error('ActionMessage validation failed.');
            throw new ValidationException('Invalid MarketplaceMessage.', ['Send failed.']);
        }
        // TODO: also validate the sequence?
        // await this.validator.validateSequence(marketplaceMessage, ActionDirection.OUTGOING);

        // optionally override the default messageVersion to the one set in sendParams
        const messageVersion = actionRequest.sendParams.messageType
            ? actionRequest.sendParams.messageType
            : MessageVersions.get(marketplaceMessage.action.type);

        // return smsg fee estimate, if thats what was requested
        if (actionRequest.sendParams.estimateFee) {
            if (messageVersion === CoreMessageVersion.PAID) {
                return await this.smsgService.estimateFee(marketplaceMessage, actionRequest.sendParams);
            } else {
                return {
                    result: 'No fee for FREE message.',
                    fee: 0
                } as SmsgSendResponse;
            }
        }

        // if message is paid, make sure we have enough balance to pay for it
        if (messageVersion === CoreMessageVersion.PAID) {
            const canAfford = await this.smsgService.canAffordToSendMessage(marketplaceMessage, actionRequest.sendParams);
            if (!canAfford) {
                throw new MessageException('Not enough balance to send the message.');
            }
        }

        // do whatever still needs to be done before sending the message, extending class should implement
        marketplaceMessage = await this.beforePost(actionRequest, marketplaceMessage);
        marketplaceMessage = strip(marketplaceMessage);

        // finally send the message
        let smsgSendResponse: SmsgSendResponse = await this.smsgService.sendMessage(marketplaceMessage,
            actionRequest.sendParams);

        if (smsgSendResponse.result === 'Sent.') {
            await this.callWebHooks(marketplaceMessage.action, ActionDirection.OUTGOING);
        }

        // save the outgoing message to database as SmsgMessage
        let smsgMessage: resources.SmsgMessage = await this.saveOutgoingMessage(smsgSendResponse.msgid!);

        // do whatever needs to be done after sending the message, extending class should implement
        smsgSendResponse = await this.afterPost(actionRequest, marketplaceMessage, smsgMessage, smsgSendResponse);

        // called for incoming and outgoing message
        smsgMessage = await this.processMessage(marketplaceMessage, ActionDirection.OUTGOING, smsgMessage, actionRequest);
        const notification: MarketplaceNotification | undefined = await this.createNotification(marketplaceMessage, ActionDirection.OUTGOING, smsgMessage);

        // only send if we created one
        if (notification) {
            await this.sendNotification(notification);
        }

        return smsgSendResponse;
    }

    /**
     * sends the notification, also called from the MessageProcessor
     *
     * @param notification
     */
    public async sendNotification(notification: MarketplaceNotification): Promise<void> {
        await this.notificationService.send(notification);
    }

    /**
     * called before post is executed (and )message is sent)
     *
     * if you need to add something to MarketplaceMessage, this is the place to do it.
     * @param actionRequest
     * @param message
     */
    public abstract async beforePost(actionRequest: ActionRequestInterface, message: MarketplaceMessage): Promise<MarketplaceMessage>;

    /**
     * called after post is executed (message is sent)
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public abstract async afterPost(actionRequest: ActionRequestInterface,
                                    marketplaceMessage: MarketplaceMessage,
                                    smsgMessage: resources.SmsgMessage,
                                    smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse>;

    /**
     * called after posting a message and after receiving it
     *
     * processMessage "processes" the Message (ListingItemAdd/Bid/ProposalAdd/Vote/etc), often creating and/or updating
     * the whatever we're "processing" here.
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     * @param actionRequest
     */
    public abstract async processMessage(marketplaceMessage: MarketplaceMessage, // TODO: change to ActionMessageInterface, but first move _rawtx
                                         actionDirection: ActionDirection,
                                         smsgMessage: resources.SmsgMessage,
                                         actionRequest?: ActionRequestInterface): Promise<resources.SmsgMessage>;


    /**
     * create MarketplaceNotification to be sent to the gui, return undefined if notification is not needed
     *
     * called after onEvent, so smsgMessage also contains the latest status, processedCount and processedAt
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     */
    public abstract async createNotification(marketplaceMessage: MarketplaceMessage,
                                             actionDirection: ActionDirection,
                                             smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined>;


    /**
     * call the configured webhooks
     *
     * @param actionMessage
     * @param actionDirection
     */
    public async callWebHooks(actionMessage: ActionMessageInterface, actionDirection: ActionDirection): Promise<void> {
        const webhookUrl = MessageWebhooks.get(actionMessage.type);

        if (!_.isNil(webhookUrl)) {
            this.log.debug('webhookUrl: ' + webhookUrl);

            const options = this.getOptions();
            const postData = JSON.stringify({
                type: actionMessage.type,
                message: actionMessage,
                direction: actionDirection
            });
            await WebRequest.post(webhookUrl, options, postData)
                .catch(reason => {
                    this.log.warn('reason: ' + reason);
                });
        }
        return;
    }

    public marketplaceMessageDebug(direction: ActionDirection, actionRequest: ActionMessageInterface): void {
        if (Environment.isTruthy(process.env.MPMESSAGE_DEBUG)) {
            this.log.debug(direction + ': ', JSON.stringify(actionRequest, null, 2));
        }
    }

    /**
     * finds the CoreSmsgMessage and saves it into the database as SmsgMessage
     *
     * @param msgid
     */
    private async saveOutgoingMessage(msgid: string): Promise<resources.SmsgMessage> {
        return await this.smsgService.smsg(msgid, false, false)
            .then(async coreMessage => {
                return await this.smsgMessageFactory.get({
                    direction: ActionDirection.OUTGOING,
                    message: coreMessage,
                    status: SmsgMessageStatus.SENT
                    // todo: add also target here if its known
                } as SmsgMessageCreateParams)
                    .then(async createRequest => {
                        return await this.smsgMessageService.create(createRequest).then(value => value.toJSON());
                    });
            });
    }

    private getOptions(): RequestOptions {

        let auth;
        if (!_.isNil(process.env.WEBHOOK_USER) && !_.isNil(process.env.WEBHOOK_PASSWORD)) {
            auth = {
                user: (process.env.WEBHOOK_USER ? process.env.WEBHOOK_USER : undefined),
                pass: (process.env.WEBHOOK_PASSWORD ? process.env.WEBHOOK_PASSWORD : undefined),
                sendImmediately: false
            } as AuthOptions;
        }

        const headers = {
            'User-Agent': 'Marketplace Webhook client',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        } as Headers;

        return {
            auth,
            headers
        } as RequestOptions;
    }
}
