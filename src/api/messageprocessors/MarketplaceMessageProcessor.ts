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
import { ListingItemAddActionListener } from '../listeners/action/ListingItemAddActionListener';
import { BidActionListener } from '../listeners/action/BidActionListener';
import { BidAcceptActionListener } from '../listeners/action/BidAcceptActionListener';
import { BidCancelActionListener } from '../listeners/action/BidCancelActionListener';
import { BidRejectActionListener } from '../listeners/action/BidRejectActionListener';
import { EscrowLockActionListener } from '../listeners/action/EscrowLockActionListener';
import { MPActionExtended } from '../enums/MPActionExtended';
import { EscrowCompleteActionListener } from '../listeners/action/EscrowCompleteActionListener';
import { OrderItemShipActionListener } from '../listeners/action/OrderItemShipActionListener';
import { EscrowReleaseActionListener } from '../listeners/action/EscrowReleaseActionListener';
import { EscrowRefundActionListener } from '../listeners/action/EscrowRefundActionListener';
import { GovernanceAction } from '../enums/GovernanceAction';
import { ProposalAddActionListener } from '../listeners/action/ProposalAddActionListener';
import { VoteActionListener } from '../listeners/action/VoteActionListener';
import { CommentAction } from '../enums/CommentAction';
import { CommentAddActionListener } from '../listeners/action/CommentAddActionListener';
import { NotImplementedException } from '../exceptions/NotImplementedException';


export class MarketplaceMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private actionQueue: PQueue;    // Queue processing the MarketplaceMessages, prioritizing by type

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Listener) @named(Targets.Listener.action.ListingItemAddActionListener) private listingItemAddActionListener: ListingItemAddActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.BidActionListener) private bidActionListener: BidActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.BidAcceptActionListener) private bidAcceptActionListener: BidAcceptActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.BidCancelActionListener) private bidCancelActionListener: BidCancelActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.BidRejectActionListener) private bidRejectActionListener: BidRejectActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.EscrowLockActionListener) private escrowLockActionListener: EscrowLockActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.EscrowCompleteActionListener) private escrowCompleteActionListener: EscrowCompleteActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.OrderItemShipActionListener) private orderItemShipActionListener: OrderItemShipActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.EscrowReleaseActionListener) private escrowReleaseActionListener: EscrowReleaseActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.EscrowRefundActionListener) private escrowRefundActionListener: EscrowRefundActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.ProposalAddActionListener) private proposalAddActionListener: ProposalAddActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.VoteActionListener) private voteActionListener: VoteActionListener,
        @inject(Types.Listener) @named(Targets.Listener.action.CommentAddActionListener) private commentAddActionListener: CommentAddActionListener,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter
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
        const marketplaceMessage: MarketplaceMessage | undefined = await this.smsgMessageFactory.getMarketplaceMessage(smsgMessage)
            .then(value => value)
            .catch(async reason => {
                this.log.error('Could not parse the MarketplaceMessage.');
                // TODO: should not happen, but handle properly
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

        this.log.debug('ADDING MPAction TO QUEUE msgid: ', msgid);

        // add the action processing function to the messageprocessing queue
        switch (smsgMessage.type) {
            case MPAction.MPA_LISTING_ADD:
                await this.actionQueue.add(() => this.listingItemAddActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_LISTING_ADD
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_BID:
                await this.actionQueue.add(() => this.bidActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_BID
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_ACCEPT:
                await this.actionQueue.add(() => this.bidAcceptActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_ACCEPT
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_CANCEL:
                await this.actionQueue.add(() => this.bidCancelActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_CANCEL
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_REJECT:
                await this.actionQueue.add(() => this.bidRejectActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_REJECT
                } as DefaultAddOptions);
                break;
            case MPAction.MPA_LOCK:
                await this.actionQueue.add(() => this.escrowLockActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_LOCK
                } as DefaultAddOptions);
                break;
            case MPActionExtended.MPA_COMPLETE:
                await this.actionQueue.add(() => this.escrowCompleteActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_COMPLETE
                } as DefaultAddOptions);
                break;
            case MPActionExtended.MPA_SHIP:
                await this.actionQueue.add(() => this.orderItemShipActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_SHIP
                } as DefaultAddOptions);
                break;
            case MPActionExtended.MPA_RELEASE:
                await this.actionQueue.add(() => this.escrowReleaseActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_RELEASE
                } as DefaultAddOptions);
                break;
            case MPActionExtended.MPA_REFUND:
                await this.actionQueue.add(() => this.escrowRefundActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_REFUND
                } as DefaultAddOptions);
                break;
            case GovernanceAction.MPA_PROPOSAL_ADD:
                await this.actionQueue.add(() => this.proposalAddActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_PROPOSAL_ADD
                } as DefaultAddOptions);
                break;
            case GovernanceAction.MPA_VOTE:
                await this.actionQueue.add(() => this.voteActionListener.onEvent(marketplaceEvent), {
                    priority: MessageQueuePriority.MPA_VOTE
                } as DefaultAddOptions);
                break;
            case CommentAction.MPA_COMMENT_ADD:
                await this.actionQueue.add(() => this.commentAddActionListener.onEvent(marketplaceEvent), {
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
