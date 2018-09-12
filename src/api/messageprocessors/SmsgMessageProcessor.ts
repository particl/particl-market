// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';

import { EventEmitter } from '../../core/api/events';
import { SmsgService } from '../services/SmsgService';

import { MessageProcessorInterface } from './MessageProcessorInterface';
import { SmsgMessageService } from '../services/SmsgMessageService';
import { SmsgMessageFactory } from '../factories/SmsgMessageFactory';
import * as resources from 'resources';
import { SmsgMessageCreateRequest } from '../requests/SmsgMessageCreateRequest';
import { SmsgMessage } from '../models/SmsgMessage';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';

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
    public async process(messages: IncomingSmsgMessage[]): Promise<void> {

        for (const message of messages) {

            // get the message again using smsg, since the smsginbox doesnt return expiration
            const msg: IncomingSmsgMessage = await this.smsgService.smsg(message.msgid, false, true);
            const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get(msg);

            // this.log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
            await this.smsgMessageService.create(smsgMessageCreateRequest)
                .then(async smsgMessageModel => {

                    const smsgMessage: resources.SmsgMessage = smsgMessageModel.toJSON();
                    this.log.debug('INCOMING SMSGMESSAGE: '
                        + smsgMessage.from + ' => ' + smsgMessage.to
                        + ' : ' + smsgMessage.type
                        + ' : ' + smsgMessage.status
                        + ' : ' + smsgMessage.msgid);

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
                    const smsgMessages: IncomingSmsgMessage[] = messages.messages;
                    await this.process(smsgMessages);
                }
                return;
            })
            .catch( reason => {
                this.log.error('poll(), error: ' + reason);
                return;
            });
    }

    /**
     * TODO: should not fetch all unreads at the same time
     *
     * @returns {Promise<any>}
     */
    private async pollMessages(): Promise<any> {
        const response = await this.smsgService.smsgInbox('unread');
        return response;
    }
}
