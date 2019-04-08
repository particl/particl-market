// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { EventEmitter } from '../../core/api/events';
import { SmsgService } from '../services/SmsgService';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { SmsgMessageService } from '../services/SmsgMessageService';
import { SmsgMessageFactory } from '../factories/model/SmsgMessageFactory';
import { SmsgMessageCreateRequest } from '../requests/SmsgMessageCreateRequest';
import { SmsgMessage } from '../models/SmsgMessage';
import { CoreSmsgMessage } from '../messages/CoreSmsgMessage';

export class SmsgMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 5000; // todo: configurable

    // tslint:disable:max-line-length
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
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
    public async process(messages: CoreSmsgMessage[]): Promise<void> {

        const smsgMessageCreateRequests: SmsgMessageCreateRequest[] = [];
        this.log.debug('INCOMING messages.length: ', messages.length);

        // create the createrequests
        for (const message of messages) {
            // todo: this is an old problem and should be tested again if we could get rid of this now
            // get the message again using smsg, since the smsginbox doesnt return expiration
            const msg: CoreSmsgMessage = await this.smsgService.smsg(message.msgid, false, true);
            const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get(msg);
            smsgMessageCreateRequests.push(smsgMessageCreateRequest);
        }

        this.log.info('process(), smsgMessageCreateRequests: ', JSON.stringify(smsgMessageCreateRequests, null, 2));

        // store all in db
        await this.smsgMessageService.createAll(smsgMessageCreateRequests)
            .then(async (idsProcessed) => {
                // after messages are stored, remove them
                for (const msgid of idsProcessed) {
                    await this.smsgService.smsg(msgid, true, true)
                        .then(value => this.log.debug('REMOVED: ', JSON.stringify(value, null, 2)))
                        .catch(reason => {
                            this.log.error('ERROR: ', reason);
                        });
                }
            })
            .catch(reason => {
                this.log.error('ERROR: ', reason);
            });
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
        await this.smsgService.smsgInbox('unread', '', {updatestatus: false})
            .then( async messages => {
                if (messages.result !== '0') {
                    // Process 10 smsg messages at a time for SQLite insert
                    const smsgMessages: CoreSmsgMessage[] = messages.messages.splice(0, Math.min(10, messages.messages.length));
                    this.log.debug('found new unread smsgmessages: ', JSON.stringify(smsgMessages, null, 2));
                    await this.process(smsgMessages);
                }
                return;
            })
            .catch( reason => {
                this.log.error('poll(), error: ' + reason);
                return;
            });
    }
}
