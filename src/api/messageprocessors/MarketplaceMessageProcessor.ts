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
import { SmsgMessage } from '../models/SmsgMessage';
import { CoreSmsgMessage } from '../messages/CoreSmsgMessage';
import { ActionDirection } from '../enums/ActionDirection';
import { SmsgMessageCreateParams } from '../factories/model/ModelCreateParams';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../enums/ActionMessageObjects';
import PQueue, { DefaultAddOptions, Options } from 'pm-queue';
import PriorityQueue, { PriorityQueueOptions } from 'pm-queue/dist/priority-queue';
import { MessageQueuePriority } from '../enums/MessageQueuePriority';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MarketplaceMessageEvent } from '../messages/MarketplaceMessageEvent';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { ListingItemAddActionMessageProcessor } from './action/ListingItemAddActionMessageProcessor';
import { BidActionMessageProcessor } from './action/BidActionMessageProcessor';
import { BidAcceptActionMessageProcessor } from './action/BidAcceptActionMessageProcessor';
import { BidCancelActionMessageProcessor } from './action/BidCancelActionMessageProcessor';
import { BidRejectActionMessageProcessor } from './action/BidRejectActionMessageProcessor';
import { EscrowLockActionMessageProcessor } from './action/EscrowLockActionMessageProcessor';
import { MPActionExtended } from '../enums/MPActionExtended';
import { EscrowCompleteActionMessageProcessor } from './action/EscrowCompleteActionMessageProcessor';
import { OrderItemShipActionMessageProcessor } from './action/OrderItemShipActionMessageProcessor';
import { EscrowReleaseActionMessageProcessor } from './action/EscrowReleaseActionMessageProcessor';
import { EscrowRefundActionMessageProcessor } from './action/EscrowRefundActionMessageProcessor';
import { GovernanceAction } from '../enums/GovernanceAction';
import { ProposalAddActionMessageProcessor } from './action/ProposalAddActionMessageProcessor';
import { VoteActionMessageProcessor } from './action/VoteActionMessageProcessor';
import { CommentAction } from '../enums/CommentAction';
import { CommentAddActionMessageProcessor } from './action/CommentAddActionMessageProcessor';
import { NotImplementedException } from '../exceptions/NotImplementedException';


export class MarketplaceMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private actionQueue: PQueue;    // Queue processing the MarketplaceMessages, prioritizing by type

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.ListingItemAddActionMessageProcessor) private listingItemAddActionMessageProcessor: ListingItemAddActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.BidActionMessageProcessor) private bidActionMessageProcessor: BidActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.BidAcceptActionMessageProcessor) private bidAcceptActionMessageProcessor: BidAcceptActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.BidCancelActionMessageProcessor) private bidCancelActionMessageProcessor: BidCancelActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.BidRejectActionMessageProcessor) private bidRejectActionMessageProcessor: BidRejectActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.EscrowLockActionMessageProcessor) private escrowLockActionMessageProcessor: EscrowLockActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.EscrowCompleteActionMessageProcessor) private escrowCompleteActionMessageProcessor: EscrowCompleteActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.OrderItemShipActionMessageProcessor) private orderItemShipActionMessageProcessor: OrderItemShipActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.EscrowReleaseActionMessageProcessor) private escrowReleaseActionMessageProcessor: EscrowReleaseActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.EscrowRefundActionMessageProcessor) private escrowRefundActionMessageProcessor: EscrowRefundActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.ProposalAddActionMessageProcessor) private proposalAddActionMessageProcessor: ProposalAddActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.VoteActionMessageProcessor) private voteActionMessageProcessor: VoteActionMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.action.CommentAddActionMessageProcessor) private commentAddActionMessageProcessor: CommentAddActionMessageProcessor,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
        // tslint:enable:max-line-length
    ) {
        this.log = new Logger(__filename);

        const options = {
            concurrency: 1,             // concurrency limit
            autoStart: true,            // auto-execute tasks as soon as they're added
            throwOnTimeout: false       // throw on timeout
        } as Options<PriorityQueue, PriorityQueueOptions>;

        this.actionQueue = new PQueue(options);
        this.actionQueue
            .on('active', () => {
                // emitted as each item is processed in the queue for the purpose of tracking progress.
                this.log.debug(`ACTIONQUEUE: queue size: ${this.actionQueue.size}, tasks pending: ${this.actionQueue.pending}`);
            })
            .start();

    }

    public async process(msgid: string): Promise<void> {
        this.log.debug('PROCESS msgid: ', msgid);

        const smsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgId(msgid, ActionDirection.INCOMING).then(value => value.toJSON());

        // update status and processed count before the actual processing,
        // the message processing result will be updated in process()
        await this.smsgMessageService.updateStatus(smsgMessage.id, SmsgMessageStatus.PROCESSING);
        await this.smsgMessageService.updateProcessedCount(smsgMessage.id);

        const marketplaceMessage: MarketplaceMessage | undefined = await this.smsgMessageFactory.getMarketplaceMessage(smsgMessage)
            .then(value => value)
            .catch(async reason => {
                this.log.error('Could not parse the MarketplaceMessage.');
                await this.smsgMessageService.updateStatus(smsgMessage.id, SmsgMessageStatus.PARSING_FAILED);
                throw reason;
            });

        if (MPAction.MPA_LISTING_ADD === smsgMessage.type) {
            smsgMessage.text = '';
        }
        const marketplaceEvent: MarketplaceMessageEvent = {
            smsgMessage,
            marketplaceMessage
        };
        this.log.debug('SMSGMESSAGE: '
            + smsgMessage.from + ' => ' + smsgMessage.to
            + ' : ' + smsgMessage.type
            + ' : ' + smsgMessage.status
            + ' : ' + smsgMessage.msgid);

        this.log.debug('=====================================================================================================');
        this.log.debug('ADDING MPAction TO QUEUE msgid: ', msgid);
        this.log.debug('=====================================================================================================');

        // add the action processing function to the messageprocessing queue
        switch (smsgMessage.type) {
            case MPAction.MPA_LISTING_ADD:
                await this.actionQueue.add(async () => await this.listingItemAddActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_LISTING_ADD
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_BID:
                await this.actionQueue.add(async () => await this.bidActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_BID
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_ACCEPT:
                await this.actionQueue.add(async () => await this.bidAcceptActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_ACCEPT
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_CANCEL:
                await this.actionQueue.add(async () => await this.bidCancelActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_CANCEL
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_REJECT:
                await this.actionQueue.add(async () => await this.bidRejectActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_REJECT
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_LOCK:
                await this.actionQueue.add(async () => await this.escrowLockActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_LOCK
                } as DefaultAddOptions);
                break;
            case MPActionExtended.MPA_COMPLETE:
                await this.actionQueue.add(async () => await this.escrowCompleteActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_COMPLETE
                } as DefaultAddOptions);
                break;
            case MPActionExtended.MPA_SHIP:
                await this.actionQueue.add(async () => await this.orderItemShipActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_SHIP
                } as DefaultAddOptions);
                break;
            case MPActionExtended.MPA_RELEASE:
                await this.actionQueue.add(async () => await this.escrowReleaseActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_RELEASE
                } as DefaultAddOptions);
                break;
            case MPActionExtended.MPA_REFUND:
                await this.actionQueue.add(async () => await this.escrowRefundActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_REFUND
                } as DefaultAddOptions);
                break;
            case GovernanceAction.MPA_PROPOSAL_ADD:
                await this.actionQueue.add(async () => await this.proposalAddActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_PROPOSAL_ADD
                } as DefaultAddOptions);
                break;
            case GovernanceAction.MPA_VOTE:
                await this.actionQueue.add(async () => await this.voteActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_VOTE
                } as DefaultAddOptions);
                break;
            case CommentAction.MPA_COMMENT_ADD:
                await this.actionQueue.add(async () => await this.commentAddActionMessageProcessor.process(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_COMMENT_ADD
                } as DefaultAddOptions);
                break;
            default:
                // a valid mp message, possibly should be handled by a bot
                // TODO: pass it on to using zmq to all listening bots
                this.log.error('ERROR: Received a message type thats missing a Listener.');
                throw new NotImplementedException();
        }

        // TODO: push notifications about messages to socket.io / gui
        //       -> refactor this: https://github.com/particl/particl-market/pull/469/files
        // TODO: push bot related messages to zmq

        return;
    }

}
