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
import { MessageException } from '../../exceptions/MessageException';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalAddMessage } from '../../messages/action/ProposalAddMessage';
import { ListingItemService } from '../model/ListingItemService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { VoteActionService } from './VoteActionService';
import { ProposalAddMessageFactory } from '../../factories/message/ProposalAddMessageFactory';
import { ProposalFactory } from '../../factories/model/ProposalFactory';
import { ompVersion } from 'omp-lib/dist/omp';
import { ProposalCreateParams } from '../../factories/model/ModelCreateParams';
import { ProposalAddMessageCreateParams } from '../../requests/message/ProposalAddMessageCreateParams';
import { BaseActionService } from '../BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ProposalAddRequest } from '../../requests/action/ProposalAddRequest';
import { ProposalAddValidator } from '../../messagevalidators/ProposalAddValidator';
import { MarketService } from '../model/MarketService';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { NotificationService } from '../NotificationService';
import { ActionDirection } from '../../enums/ActionDirection';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { ProposalNotification } from '../../messages/notification/ProposalNotification';

export class ProposalAddActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) private flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) private voteActionService: VoteActionService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ProposalFactory) private proposalFactory: ProposalFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ProposalAddMessageFactory) private proposalMessageFactory: ProposalAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ProposalAddMessageFactory) private proposalAddMessageFactory: ProposalAddMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.ProposalAddValidator) public validator: ProposalAddValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(GovernanceAction.MPA_PROPOSAL_ADD,
            smsgService,
            smsgMessageService,
            notificationService,
            smsgMessageFactory,
            validator,
            Logger);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: ProposalAddRequest): Promise<MarketplaceMessage> {

        const actionMessage: ProposalAddMessage = await this.proposalAddMessageFactory.get({
            title: actionRequest.title,
            description: actionRequest.description,
            options: actionRequest.options,
            sender: actionRequest.sender,
            category: actionRequest.category,
            target: actionRequest.target,
            market: actionRequest.market.receiveAddress
        } as ProposalAddMessageCreateParams);

        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;
    }

    /**
     * called before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     */
    public async beforePost(actionRequest: ProposalAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
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

        const proposalAddMessage: ProposalAddMessage = marketplaceMessage.action as ProposalAddMessage;
        this.log.debug('processProposal(), proposalAddMessage:', JSON.stringify(proposalAddMessage, null, 2));

        // if Proposal doesnt exist yet, create it
        const proposal: resources.Proposal = await this.proposalService.findOneByHash(proposalAddMessage.hash)
            .then(value => value.toJSON())
            .catch(async reason => {

                const proposalRequest: ProposalCreateRequest = await this.proposalFactory.get(
                    {} as ProposalCreateParams,
                    proposalAddMessage,
                    smsgMessage
                );
                const createdProposal: resources.Proposal = await this.proposalService.create(proposalRequest).then(value => value.toJSON());

                // in case of ITEM_VOTE || MARKET_VOTE, we also need to create the FlaggedItem
                if (ProposalCategory.ITEM_VOTE === createdProposal.category || ProposalCategory.MARKET_VOTE === createdProposal.category) {
                    await this.createFlaggedItemForProposal(createdProposal);
                    this.log.debug('processProposal(), created FlaggedItem');
                }

                // also create the first ProposalResult
                await this.proposalService.createEmptyProposalResult(createdProposal);
                this.log.debug('processProposal(), created ProposalResult');

                return await this.proposalService.findOne(createdProposal.id).then(value => value.toJSON());
            });

        // in case of INCOMING message, update the times
        if (ActionDirection.INCOMING === actionDirection) {
            // means processMessage was called from onEvent() and we should update the Proposal data
            await this.proposalService.updateTimes(proposal.id, smsgMessage.sent, smsgMessage.sent, smsgMessage.received, smsgMessage.expiration)
                .then(value => value.toJSON());
            this.log.debug('processProposal(), proposal updated');
        } else {
            // called from send(), we already created the Proposal so nothing else needs to be done
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

            const listingItem: resources.ListingItem = await this.listingItemService.findOneByHashAndMarketReceiveAddress(
                proposalAddMessage.target!, smsgMessage.to)
                .then(value => value.toJSON())
                .catch(err => undefined);

            const notification: MarketplaceNotification = {
                event: marketplaceMessage.action.type,
                payload: {
                    category: proposalAddMessage.category,
                    hash: proposalAddMessage.hash,
                    target: proposalAddMessage.target,
                    market: listingItem.market
                } as ProposalNotification
            };
            return notification;
        }
        return undefined;
    }

    /**
     *
     * @param proposal
     */
    public async createFlaggedItemForProposal(proposal: resources.Proposal): Promise<resources.FlaggedItem> {

        let listingItem: resources.ListingItem;
        let markets: resources.Market[];

        const flaggedItemCreateRequest = {
            proposal_id: proposal.id,
            reason: proposal.description
        } as FlaggedItemCreateRequest;

        if (ProposalCategory.ITEM_VOTE === proposal.category) {
            listingItem = await this.listingItemService.findOneByHashAndMarketReceiveAddress(proposal.title, proposal.market).then(value => value.toJSON());

            // this is called from processProposal, so FlaggedItem could already exist for the one who flagged it
            if (_.isEmpty(listingItem.FlaggedItem)) {
                // only create if FlaggedItem doesnt already exist
                flaggedItemCreateRequest.listing_item_id = listingItem.id;
                return await this.flaggedItemService.create(flaggedItemCreateRequest).then(value => value.toJSON());
            } else {
                // else just return the existing
                return await this.flaggedItemService.findOne(listingItem.FlaggedItem.id).then(value => value.toJSON());
            }
        } else if (ProposalCategory.MARKET_VOTE === proposal.category) {

            const createdFlaggedItems: resources.FlaggedItem[] = [];
            markets = await this.marketService.findAllByReceiveAddress(proposal.title).then(value => value.toJSON()[0]);

            // create FlaggedItem for all the Markets
            for (const market of markets) {
                let flaggedItem: resources.FlaggedItem;
                if (_.isEmpty(market.FlaggedItem)) {
                    // only create if FlaggedItem doesnt already exist
                    flaggedItemCreateRequest.market_id = market.id;
                    flaggedItem = await this.flaggedItemService.create(flaggedItemCreateRequest).then(value => value.toJSON());
                } else {
                    // else just return the existing
                    flaggedItem = await this.flaggedItemService.findOne(market.FlaggedItem.id).then(value => value.toJSON());
                }
                createdFlaggedItems.push(flaggedItem);
            }

            // the result is not used for anything so just return the [0]
            return createdFlaggedItems[0];

        } else {
            throw new MessageException('Unsupported ProposalCategory.');
        }
    }

}
