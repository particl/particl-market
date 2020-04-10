// Copyright (c) 2017-2020, The Particl Market developers
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
import { CoreSmsgMessage } from '../messages/CoreSmsgMessage';
import { ActionDirection } from '../enums/ActionDirection';
import { SmsgMessageCreateParams } from '../factories/model/ModelCreateParams';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../enums/ActionMessageObjects';
import PQueue, { DefaultAddOptions, Options } from 'pm-queue';
import PriorityQueue, { PriorityQueueOptions } from 'pm-queue/dist/priority-queue';
import { MessageQueuePriority } from '../enums/MessageQueuePriority';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { MarketplaceMessageProcessor } from './MarketplaceMessageProcessor';
import { hasActionMessageType } from '../enums/ActionMessageTypes';

export class CoreMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private queue: PQueue;          // Queue processing the SmsgMessages

    constructor(
        // tslint:disable-next-line:max-line-length
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.MarketplaceMessageProcessor) public marketplaceMessageProcessor: MarketplaceMessageProcessor,
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
                this.log.debug(`QUEUE: queue size: ${this.queue.size}, tasks pending: ${this.queue.pending}`);
            })
            .start();

    }

    public async process(msgid: string): Promise<void> {
        this.log.debug('PROCESS msgid: ', msgid);

        // get the message and set it as read
        const msg: CoreSmsgMessage = await this.smsgService.smsg(msgid, false, true);

        const isMPMessage = await this.isMarketplaceMessage(msg);

        if (isMPMessage) {
            // has this message already been processed?
            const isProcessed = await this.isCoreMessageAlreadyProcessed(msg);

            if (!isProcessed) {
                this.log.debug('ADDING SMSG TO QUEUE msgid: ', msgid);

                await this.queue.add(async () => {

                    const smsgMessage: resources.SmsgMessage = await this.saveSmsgMessage(msg);
                    const marketplaceMessage: MarketplaceMessage | undefined = await this.smsgMessageFactory.getMarketplaceMessage(smsgMessage)
                        .then(value => value)
                        .catch(async reason => {
                            this.log.error('Could not parse the MarketplaceMessage.');
                            return undefined;
                        });

                    if (marketplaceMessage && smsgMessage.type) {
                        // pass the processing to MarketplaceMessageProcessor
                        await this.marketplaceMessageProcessor.process(msgid);

                    } else {
                        // parsing failed, log some error data and update the smsgMessage
                        this.log.error('marketplaceMessage:', JSON.stringify(marketplaceMessage, null, 2));
                        this.log.error('eventType:', JSON.stringify(smsgMessage.type, null, 2));
                        this.log.error('PROCESSING: ' + smsgMessage.msgid + ' PARSING FAILED');
                        await this.smsgMessageService.updateStatus(smsgMessage.id, SmsgMessageStatus.PARSING_FAILED);
                    }

                }, {
                    priority: MessageQueuePriority.SMSGMESSAGE
                } as DefaultAddOptions);

            } else {
                this.log.debug('ALREADY PROCESSED msgid: ', msgid);
            }

        } else {
            this.log.debug('Not a MarketplaceMessage, ignoring: ', msgid);
        }

        return;
    }

    private async saveSmsgMessage(msg: CoreSmsgMessage): Promise<resources.SmsgMessage> {
        // get the SmsgMessageCreateRequest
        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: msg
        } as SmsgMessageCreateParams);

        this.log.debug('SAVING msgid:', JSON.stringify(msg.msgid, null, 2));

        // store in db
        return await this.smsgMessageService.create(smsgMessageCreateRequest)
            .then(async (value) => {
                const smsgMessage: resources.SmsgMessage = value.toJSON();
                this.log.debug('CREATED msgid:', JSON.stringify(smsgMessage.msgid, null, 2));

                // after the smsgMessage is stored, remove it
                await this.smsgService.smsg(msg.msgid, true, true)
                    .then(removed => {
                        this.log.debug('REMOVED: ', JSON.stringify(removed.msgid, null, 2));
                    });
                return smsgMessage;
            });
    }

    private async isMarketplaceMessage(msg: CoreSmsgMessage): Promise<boolean> {
        try {
            const marketplaceMessage: MarketplaceMessage = JSON.parse(msg.text);
            const actionValue: string = (marketplaceMessage.action && marketplaceMessage.action.type) || '';
            return hasActionMessageType(actionValue);
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
