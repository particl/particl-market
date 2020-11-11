// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ProposalCreateRequest } from '../../requests/model/ProposalCreateRequest';
import { SmsgService } from '../SmsgService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { EventEmitter } from 'events';
import { ProposalService } from '../model/ProposalService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalAddMessage } from '../../messages/action/ProposalAddMessage';
import { ListingItemService } from '../model/ListingItemService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { VoteActionService } from './VoteActionService';
import { ProposalAddMessageFactory } from '../../factories/message/ProposalAddMessageFactory';
import { ProposalFactory } from '../../factories/model/ProposalFactory';
import { ProposalCreateParams } from '../../factories/ModelCreateParams';
import { BaseActionService } from '../BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ProposalAddRequest } from '../../requests/action/ProposalAddRequest';
import { ProposalAddValidator } from '../../messagevalidators/ProposalAddValidator';
import { MarketService } from '../model/MarketService';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { NotifyService } from '../NotifyService';
import { ActionDirection } from '../../enums/ActionDirection';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { ProposalNotification } from '../../messages/notification/ProposalNotification';
import { BlacklistService } from '../model/BlacklistService';


export class ProposalAddActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.NotifyService) public notificationService: NotifyService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) private flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) private voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) public blacklistService: BlacklistService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ProposalFactory) private proposalFactory: ProposalFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ProposalAddMessageFactory) private actionMessageFactory: ProposalAddMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.ProposalAddValidator) public validator: ProposalAddValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(GovernanceAction.MPA_PROPOSAL_ADD,
            smsgService,
            smsgMessageService,
            notificationService,
            blacklistService,
            smsgMessageFactory,
            validator,
            Logger
        );
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: ProposalAddRequest): Promise<MarketplaceMessage> {
        return await this.actionMessageFactory.get(actionRequest);
    }

    /**
     * called before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     */
    public async beforePost(actionRequest: ProposalAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        // this.log.debug('marketplaceMessage: ', JSON.stringify(marketplaceMessage, null, 2));
        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(actionRequest: ProposalAddRequest,
                           marketplaceMessage: MarketplaceMessage,
                           smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        // this.log.debug('afterPost(), smsgSendResponse:', JSON.stringify(smsgSendResponse, null, 2));
        return smsgSendResponse;
    }

    /**
     * called after posting a message and after receiving it
     *
     * processMessage "processes" the Message (ListingItemAdd/Bid/ProposalAdd/Vote/etc), often creating and/or updating
     * the whatever we're "processing" here.
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     * @param actionRequest
     */
    public async processMessage(marketplaceMessage: MarketplaceMessage,
                                actionDirection: ActionDirection,
                                smsgMessage: resources.SmsgMessage,
                                actionRequest?: ProposalAddRequest): Promise<resources.SmsgMessage> {

        this.log.debug('processMessage(), actionDirection: ', actionDirection);

        const proposalAddMessage: ProposalAddMessage = marketplaceMessage.action as ProposalAddMessage;

        // this.log.debug('processProposal(), proposalAddMessage:', JSON.stringify(proposalAddMessage, null, 2));

        const proposal: resources.Proposal = await this.proposalService.findOneByHash(proposalAddMessage.hash)
            .then(value => value.toJSON())
            .catch(async reason => {

                const proposalRequest: ProposalCreateRequest = await this.proposalFactory.get({
                    actionMessage: proposalAddMessage,
                    smsgMessage
                } as ProposalCreateParams);

                return await this.proposalService.create(proposalRequest).then(async value => {
                    const createdProposal: resources.Proposal = value.toJSON();

                    await this.flaggedItemService.createFlaggedItemsForProposal(createdProposal);
                    await this.proposalService.createEmptyProposalResult(createdProposal);

                    // removed flag set/blacklists created with votes

                    return await this.proposalService.findOne(createdProposal.id).then(result => result.toJSON());
                });
            });

        // in case of INCOMING message, update the times
        if (ActionDirection.INCOMING === actionDirection) {
            // means processMessage was called from onEvent() and we should update the Proposal data
            await this.proposalService.updateTimes(proposal.id, smsgMessage.sent, smsgMessage.sent, smsgMessage.received, smsgMessage.expiration)
                .then(value => value.toJSON());
        }

        return smsgMessage;
    }

    /**
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     */
    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {

        const proposalAddMessage: ProposalAddMessage = marketplaceMessage.action as ProposalAddMessage;

        // only send notifications when receiving messages
        if (ActionDirection.INCOMING === actionDirection
            && proposalAddMessage.category === ProposalCategory.ITEM_VOTE) {

            const proposal: resources.Proposal = await this.proposalService.findOneByMsgId(smsgMessage.msgid)
                .then(value => value.toJSON())
                .catch(err => undefined);

            const listingItem: resources.ListingItem = await this.listingItemService.findOneByHashAndMarketReceiveAddress(
                proposalAddMessage.target!, smsgMessage.to)
                .then(value => value.toJSON())
                .catch(err => undefined);

            const notification: MarketplaceNotification = {
                event: marketplaceMessage.action.type,
                payload: {
                    objectId: _.isEmpty(proposal) ? proposal.id : undefined,
                    objectHash: proposalAddMessage.hash,
                    target: proposalAddMessage.target,
                    market: listingItem.market,
                    category: proposalAddMessage.category
                } as ProposalNotification
            };
            return notification;
        }
        return undefined;
    }

}
