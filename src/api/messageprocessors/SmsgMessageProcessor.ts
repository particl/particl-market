// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';

import { EventEmitter } from '../../core/api/events';
import { SmsgService } from '../services/SmsgService';

import { MessageProcessorInterface } from './MessageProcessorInterface';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { BidMessageType } from '../enums/BidMessageType';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { InternalServerException } from '../exceptions/InternalServerException';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';

import { ProposalMessageType } from '../enums/ProposalMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';
import { SmsgMessageService } from '../services/SmsgMessageService';
import { SmsgMessageFactory } from '../factories/SmsgMessageFactory';
import { MessageException } from '../exceptions/MessageException';
import * as resources from 'resources';
import {SmsgMessageCreateRequest} from '../requests/SmsgMessageCreateRequest';
import {SmsgMessage} from '../models/SmsgMessage';

export class SmsgMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 5000;

    // tslint:disable:max-line-length
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
    ) {
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length

    /**
     * polls for new smsgmessages and stores them in the database
     *
     * @param {SmsgMessage[]} messages
     * @returns {Promise<void>}
     */
    public async process(messages: resources.SmsgMessage[]): Promise<void> {

        for (const message of messages) {

            // get the message again using smsg, since the smsginbox doesnt return expiration
            const msg: resources.SmsgMessage = await this.smsgService.smsg(message.msgid, false, true);
            const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get(msg);

            await this.smsgMessageService.create(smsgMessageCreateRequest)
                .then(async smsgMessageModel => {

                    const smsgMessage: resources.SmsgMessage = smsgMessageModel.toJSON();
                    this.log.debug('INCOMING SMSGMESSAGE: '
                        + smsgMessage.from + ' => ' + smsgMessage.to
                        + ' : ' + smsgMessage.type + '[' + smsgMessage.status + '] '
                        + smsgMessage.msgid);

                    // after message is stored, remove it
                    await this.smsgService.smsg(message.msgid, true, true);
                })
                .catch(reason => {
                    this.log.error('ERROR: ', reason);
                });
        }
    }

    public stop(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    public schedulePoll(): void {
        this.timeout = setTimeout(
            async () => {
                await this.poll();
                this.schedulePoll();
            },
            this.interval
        );
    }

    /**
     * main poller
     *
     * @returns {Promise<void>}
     */
    private async poll(): Promise<void> {
        await this.pollMessages()
            .then( async messages => {
                if (messages.result !== '0') {
                    const smsgMessages: resources.SmsgMessage[] = messages.messages;
                    await this.process(smsgMessages);
                }
                return;
            })
            .catch( reason => {
                this.log.error('poll(), error:' + reason);
                // this.eventEmitter.emit('cli', {
                //    message: 'poll(), error' + reason
                // });
                return;
            });
    }


    private async pollMessages(): Promise<any> {
        const response = await this.smsgService.smsgInbox('unread');
        return response;
    }

    private async getMessage(msgId: string, remove: boolean = false, setRead: boolean = true): Promise<resources.SmsgMessage> {
        const response = await this.smsgService.smsg(msgId, remove, setRead);
        // this.log.debug('got response:', response);
        return response;
    }

    private async removeMessage(msgId: string): Promise<resources.SmsgMessage> {
        const response = await this.smsgService.smsg(msgId, true, false);
        // this.log.debug('got response:', response);
        return response;
    }

    private async parseJSONSafe(json: string): Promise<MarketplaceMessage> {
        let parsed: MarketplaceMessage;
        try {
           // this.log.debug('json to parse:', json);
            parsed = JSON.parse(json);
        } catch (e) {
            throw new MessageException('Could not parse the incoming message.');
        }
        return parsed;
    }

    private async getActionEventType(message: ActionMessageInterface): Promise<string> {
        switch (message.action) {
            case EscrowMessageType.MPA_LOCK:
                return Events.LockEscrowReceivedEvent;
            case EscrowMessageType.MPA_REQUEST_REFUND:
                return Events.RequestRefundEscrowReceivedEvent;
            case EscrowMessageType.MPA_REFUND:
                return Events.RefundEscrowReceivedEvent;
            case EscrowMessageType.MPA_RELEASE:
                return Events.ReleaseEscrowReceivedEvent;
            case BidMessageType.MPA_BID:
                return Events.BidReceivedEvent;
            case BidMessageType.MPA_ACCEPT:
                return Events.AcceptBidReceivedEvent;
            case BidMessageType.MPA_REJECT:
                return Events.RejectBidReceivedEvent;
            case BidMessageType.MPA_CANCEL:
                return Events.CancelBidReceivedEvent;
            case ProposalMessageType.MP_PROPOSAL_ADD:
                return Events.ProposalReceivedEvent;
            case VoteMessageType.MP_VOTE:
                return Events.VoteReceivedEvent;
            default:
                throw new InternalServerException('Unknown action message.');
        }
    }
}
