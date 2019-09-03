// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Core, Targets, Types } from '../../constants';
import { EventEmitter } from '../../core/api/events';
import { SmsgService } from '../services/SmsgService';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { SmsgMessageService } from '../services/model/SmsgMessageService';
import { SmsgMessageFactory } from '../factories/model/SmsgMessageFactory';
import { SmsgMessageCreateRequest } from '../requests/model/SmsgMessageCreateRequest';
import { SmsgMessage } from '../models/SmsgMessage';
import { CoreSmsgMessage } from '../messages/CoreSmsgMessage';
import { ActionDirection } from '../enums/ActionDirection';
import { SmsgMessageCreateParams } from '../factories/model/ModelCreateParams';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../enums/ActionMessageObjects';

export class CoreMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 5000; // todo: configurable

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * polls for new smsgmessages and stores them in the database
     *
     * @param {SmsgMessage[]} messages
     * @returns {Promise<void>}
     */
    public async process(messages: CoreSmsgMessage[]): Promise<void> {

        const smsgMessageCreateRequests: SmsgMessageCreateRequest[] = [];
        // this.log.debug('INCOMING messages.length: ', messages.length);

        // - fetch the CoreSmsgMessage from core
        // - create SmsgMessagesCreateRequests
        // - then save the CoreSmsgMessage to the db as SmsgMessages

        for (const message of messages) {
            // todo: this is an old problem and should be tested again if we could get rid of this now
            // get the message again using smsg, since the smsginbox doesnt return expiration
            const msg: CoreSmsgMessage = await this.smsgService.smsg(message.msgid, false, true);

            // check whether an SmsgMessage with the msgid was already received and processed
            const existingSmsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgId(msg.msgid, ActionDirection.INCOMING)
                .then(value => value.toJSON())
                .catch(error => {
                    return undefined;
                });

            // in case of resent SmsgMessasge, check whether an SmsgMessage with the previously sent msgid was already received and processed
            const marketplaceMessage: MarketplaceMessage = JSON.parse(msg.text);
            const resentMsgIdKVS = _.find(marketplaceMessage.action.objects, (kvs: KVS) => {
                return kvs.key === ActionMessageObjects.RESENT_MSGID;
            });

            let existingResentSmsgMessage: resources.SmsgMessage;
            if (resentMsgIdKVS) {
                existingResentSmsgMessage = await this.smsgMessageService.findOneByMsgId(resentMsgIdKVS.value as string, ActionDirection.INCOMING)
                    .then(value => value.toJSON())
                    .catch(error => {
                        return undefined;
                    });
            }

            if (!existingSmsgMessage && !existingResentSmsgMessage!) {
                const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get({
                    direction: ActionDirection.INCOMING,
                    message: msg
                } as SmsgMessageCreateParams);
                smsgMessageCreateRequests.push(smsgMessageCreateRequest);
            } else {
                this.log.debug('SmsgMessage has already been received, skipping.');
            }

        }

        // this.log.debug('process(), smsgMessageCreateRequests: ', JSON.stringify(smsgMessageCreateRequests, null, 2));

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
            .catch(async (reason) => {
                this.log.error('ERROR: ', reason);
                if ((smsgMessageCreateRequests.length > 1) && (reason.errno === 19) && String(reason.code).includes('SQLITE_CONSTRAINT')) {
                    // Parse individual messages if the batch write failed due to a sqlite constrainst error,
                    // which results in the entire batched write failing
                    this.log.debug('process(): Parsing individual messages');
                    for (const smsgMessageCreateRequest of smsgMessageCreateRequests) {
                        await this.smsgMessageService.create(smsgMessageCreateRequest)
                            .then(async message => {
                                this.log.debug(`Created single message ${smsgMessageCreateRequest.msgid}`);
                                await this.smsgService.smsg(smsgMessageCreateRequest.msgid, true, true)
                                    .then(value => this.log.debug('REMOVED: ', JSON.stringify(value, null, 2)))
                                    .catch((reason2) => this.log.error('ERROR: ', reason2));
                            })
                            .catch(err => this.log.debug(`Failed processing single message ${smsgMessageCreateRequest.msgid}`));
                    }
                }
            });

        return;
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
                } else {
                    // this.log.debug('no new unread smsgmessages...');
                }
                return;
            })
            .catch( reason => {
                this.log.error('poll(), error: ' + reason);
                return;
            });
    }
}
