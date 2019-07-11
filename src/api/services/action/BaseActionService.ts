// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
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
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { strip } from 'omp-lib/dist/util';
import { Logger as LoggerType } from '../../../core/Logger';

export abstract class BaseActionService implements ActionServiceInterface {

    public log: LoggerType;

    public smsgService: SmsgService;
    public smsgMessageService: SmsgMessageService;
    public smsgMessageFactory: SmsgMessageFactory;

    constructor(smsgService: SmsgService, smsgMessageService: SmsgMessageService, smsgMessageFactory: SmsgMessageFactory) {
        this.smsgService = smsgService;
        this.smsgMessageService = smsgMessageService;
        this.smsgMessageFactory = smsgMessageFactory;
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

                // each message has objects?: KVS[] for extending messages, add those to the message here
                if (!_.isEmpty(params.objects)) {
                    marketplaceMessage.action.objects = marketplaceMessage.action.objects ? marketplaceMessage.action.objects : [];
                    marketplaceMessage.action.objects.push(...(params.objects ? params.objects : []));
                }

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
                                    await this.saveOutgoingMessage(smsgSendResponse.msgid);
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
                        return await this.smsgMessageService.create(createRequest)
                            .then(value => value.toJSON());
                    });
            });
    }

}
