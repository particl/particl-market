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
     * Create the MarketplaceMessage to which is to be posted to the network.
     * Called first after call to post().
     *
     * @param params
     */
    public abstract async createMessage(params: ActionRequestInterface): Promise<MarketplaceMessage>;

    /**
     * Validate the MarketplaceMessage to which is to be posted to the network.
     * Called after the call to createMessage().
     *
     * @param marketplaceMessage
     */
    public abstract async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean>;

    /**
     * - create the marketplaceMessage, extending class should implement
     * - validate it, extending class should implement
     * - return smsg fee estimate, if thats what was requested
     * - strip marketplaceMessage
     * - send marketplaceMessage
     * - save outgoing marketplaceMessage to database
     *
     * @param params
     */
    public async post(params: ActionRequestInterface): Promise<SmsgSendResponse> {

        // create the marketplaceMessage, extending class should implement
        let marketplaceMessage = await this.createMessage(params);

        // each message has objects?: KVS[] for extending messages, add those to the message here
        if (!_.isEmpty(params.objects)) {
            marketplaceMessage.action.objects = marketplaceMessage.action.objects ? marketplaceMessage.action.objects : [];
            marketplaceMessage.action.objects.push(...(params.objects ? params.objects : []));
        }

        // validate it, extending class should implement
        const validated = await this.validateMessage(marketplaceMessage).catch(reason => false);
        if (!validated) {
            throw new ValidationException('Invalid MarketplaceMessage.', ['Send failed.']);
        }

        // return smsg fee estimate, if thats what was requested
        if (params.sendParams.estimateFee) {
            return await this.smsgService.estimateFee(marketplaceMessage, params.sendParams);
        }

        // if message is paid, make sure we have enough balance to pay for it
        if (params.sendParams.paidMessage) {
            const canAfford = await this.smsgService.canAffordToSendMessage(marketplaceMessage, params.sendParams);
            if (!canAfford) {
                throw new MessageException('Not enough balance to send the message.');
            }
        }

        // do whatever still needs to be done before sending the message, extending class should implement
        marketplaceMessage = await this.beforePost(params, marketplaceMessage);
        marketplaceMessage = strip(marketplaceMessage);

        // finally send the message
        let smsgSendResponse: SmsgSendResponse = await this.smsgService.sendMessage(marketplaceMessage, params.sendParams);

        // save the outgoing message to database as SmsgMessage
        const smsgMessage: resources.SmsgMessage = await this.saveOutgoingMessage(smsgSendResponse.msgid!);

        // do whatever needs to be done after sending the message, extending class should implement
        smsgSendResponse = await this.afterPost(params, marketplaceMessage, smsgMessage, smsgSendResponse);

        return smsgSendResponse;
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
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public abstract async afterPost(params: ActionRequestInterface, message: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                                    smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse>;

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
