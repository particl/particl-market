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
import PQueue, { Options } from 'p-queue';
import PriorityQueue, { PriorityQueueOptions } from 'p-queue/dist/priority-queue';

export class CoreMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = 5000; // todo: configurable

    private queue: PQueue;
    private count = 0;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
    ) {
        this.log = new Logger(__filename);

        const options = {
            concurrency: 1,             // concurrency limit
            autoStart: true,            // auto-execute tasks as soon as they're added
            throwOnTimeout: false       // throw on timeout
        } as Options<PriorityQueue, PriorityQueueOptions>;
        this.queue = new PQueue(options);
        this.queue
            .on('active', () => {
                // emitted as each item is processed in the queue for the purpose of tracking progress.
                console.log(`working on item #${++this.count}. queue size: ${this.queue.size}, tasks pending: ${this.queue.pending}`);
            })
            .start();
    }

    public async process(msgid: string): Promise<void> {
        this.log.debug('PROCESS msgid: ', msgid);

        // get the message and set it as read
        const msg: CoreSmsgMessage = await this.smsgService.smsg(msgid, false, true);

        if (await this.isMarketplaceMessage(msg)) {
            // has this message already been processed?
            const isProcessed = await this.isCoreMessageAlreadyProcessed(msg);

            if (!isProcessed) {
                this.log.debug('ADD TO QUEUE msgid: ', msgid);

                this.queue.add(async () => {

                    // get the SmsgMessageCreateRequest
                    const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get({
                        direction: ActionDirection.INCOMING,
                        message: msg
                    } as SmsgMessageCreateParams);

                    this.log.debug('SAVING msgid:', JSON.stringify(msgid, null, 2));

                    // store in db
                    await this.smsgMessageService.create(smsgMessageCreateRequest)
                        .then(async (value) => {
                            const smsgMessage: resources.SmsgMessage = value.toJSON();
                            this.log.debug('CREATED msgid:', JSON.stringify(smsgMessage.msgid, null, 2));

                            // after the smsgMessage is stored, remove it
                            await this.smsgService.smsg(msgid, true, true)
                                .then(removed => {
                                    this.log.debug('REMOVED: ', JSON.stringify(removed.msgid, null, 2));
                                });
                        });


                });
            } else {
                this.log.debug('ALREADY PROCESSED msgid: ', msgid);
            }

        } else {
            this.log.debug('Not a MarketplaceMessage, ignoring: ', msgid);
        }

        return;
    }

    /**
     * polls for new smsgmessages and stores them in the database
     *
     * @param {SmsgMessage[]} messages
     * @returns {Promise<void>}
     */
/*
    public async process(messages: CoreSmsgMessage[]): Promise<void> {

        const smsgMessageCreateRequests: SmsgMessageCreateRequest[] = [];
        // this.log.debug('INCOMING messages.length: ', messages.length);

        // - fetch the CoreSmsgMessages from core one by one
        // - create SmsgMessagesCreateRequests
        // - then save the CoreSmsgMessage to the db as SmsgMessages

        for (const message of messages) {
            // todo: this is an old problem and should be tested again if we could get rid of this now
            // get the message again using smsg, since the smsginbox doesnt return location && read (0.18.1.4)
            const msg: CoreSmsgMessage = await this.smsgService.smsg(message.msgid, false, true);

            // check whether an SmsgMessage with the same msgid can already be found
            const existingSmsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgId(msg.msgid, ActionDirection.INCOMING)
                .then(value => value.toJSON())
                .catch(error => {
                    return undefined;
                });

            // in case of resent SmsgMessasge, check whether an SmsgMessage with the previously sent msgid can already be found
            const marketplaceMessage: MarketplaceMessage = JSON.parse(msg.text);
            const resentMsgIdKVS = _.find(marketplaceMessage.action.objects, (kvs: KVS) => {
                return kvs.key === ActionMessageObjects.RESENT_MSGID;
            });

            let existingResentSmsgMessage: resources.SmsgMessage | undefined;
            if (resentMsgIdKVS) {
                this.log.debug('SmsgMessage was resent: ', resentMsgIdKVS.value);

                existingResentSmsgMessage = await this.smsgMessageService.findOneByMsgId(resentMsgIdKVS.value + '', ActionDirection.INCOMING)
                    .then(value => value.toJSON())
                    .catch(error => {
                        return undefined;
                    });
            } else {
                existingResentSmsgMessage = undefined;
            }

            // if the msgid exists OR the resent msgid exists, skip
            if (existingSmsgMessage !== undefined || existingResentSmsgMessage !== undefined) {
                this.log.debug('SmsgMessage with same msgid has already been received, skipping.');
            } else {
                const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get({
                    direction: ActionDirection.INCOMING,
                    message: msg
                } as SmsgMessageCreateParams);
                smsgMessageCreateRequests.push(smsgMessageCreateRequest);
            }

        }

        // this.log.debug('process(), smsgMessageCreateRequests: ', JSON.stringify(smsgMessageCreateRequests, null, 2));
        const msgids = smsgMessageCreateRequests.map(cr => cr.msgid);
        this.log.debug('SAVING msgids:', JSON.stringify(msgids, null, 2));

        // store all in db
        await this.smsgMessageService.createAll(smsgMessageCreateRequests)
            .then(async (idsProcessed) => {
                // after messages are stored, remove them
                for (const msgid of idsProcessed) {
                    await this.smsgService.smsg(msgid, true, true)
                        .then(value => {
                            this.log.debug('REMOVED: ', JSON.stringify(value, null, 2));
                        })
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
*/
    /**
     * main poller
     *
     * @returns {Promise<void>}
     */
/*
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
*/
    private async isMarketplaceMessage(msg: CoreSmsgMessage): Promise<boolean> {
        try {
            const marketplaceMessage: MarketplaceMessage = JSON.parse(msg.text);
            return marketplaceMessage.action ? true : false;
        } catch (e) {
            return false;
        }
    }

    private async isCoreMessageAlreadyProcessed(msg: CoreSmsgMessage): Promise<boolean> {

        // check whether an SmsgMessage with the same msgid can already be found
        const existingSmsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgId(msg.msgid, ActionDirection.INCOMING)
            .then(value => value.toJSON())
            .catch(error => {
                return undefined;
            });

        // in case of resent SmsgMessasge, ...
        const marketplaceMessage: MarketplaceMessage = JSON.parse(msg.text);
        const resentMsgIdKVS = _.find(marketplaceMessage.action.objects, (kvs: KVS) => {
            return kvs.key === ActionMessageObjects.RESENT_MSGID;
        });

        let existingResentSmsgMessage: resources.SmsgMessage | undefined;

        // ...check whether an SmsgMessage with the previously sent msgid can already be found
        if (resentMsgIdKVS) {
            this.log.debug('SmsgMessage was resent: ', resentMsgIdKVS.value);

            existingResentSmsgMessage = await this.smsgMessageService.findOneByMsgId(resentMsgIdKVS.value + '', ActionDirection.INCOMING)
                .then(value => value.toJSON())
                .catch(error => {
                    return undefined;
                });
        } else {
            existingResentSmsgMessage = undefined;
        }

        // if the msgid exists OR the resent msgid exists, skip
        if (existingSmsgMessage !== undefined || existingResentSmsgMessage !== undefined) {
            this.log.debug('SmsgMessage with same msgid has already been processed, skipping.');
            return true;
        } else {
            return false;
        }
    }

}
