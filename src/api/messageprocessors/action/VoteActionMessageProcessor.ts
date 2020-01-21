// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../../constants';
import { Logger as LoggerType } from '../../../core/Logger';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { ActionMessageProcessorInterface } from '../ActionMessageProcessorInterface';
import { BaseActionMessageProcessor } from '../BaseActionMessageProcessor';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { VoteActionService } from '../../services/action/VoteActionService';
import { VoteMessage } from '../../messages/action/VoteMessage';
import { BidService } from '../../services/model/BidService';
import { ProposalService } from '../../services/model/ProposalService';
import { VoteValidator } from '../../messagevalidators/VoteValidator';
import {ActionDirection} from '../../enums/ActionDirection';

export class VoteActionMessageProcessor extends BaseActionMessageProcessor implements ActionMessageProcessorInterface {

    public static Event = Symbol(GovernanceAction.MPA_VOTE);

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) public voteActionService: VoteActionService,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.VoteValidator) public validator: VoteValidator,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(GovernanceAction.MPA_VOTE, voteActionService, smsgMessageService, bidService, proposalService, validator, Logger);
    }

    /**
     * handles the received VoteMessage and returns SmsgMessageStatus as a result
     *
     * TODO: check whether returned SmsgMessageStatuses actually make sense and the responses to those
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: VoteMessage = marketplaceMessage.action as VoteMessage;

        // processVote will create or update the Vote
        return await this.voteActionService.processMessage(marketplaceMessage, ActionDirection.OUTGOING, smsgMessage)
            .then(value => {
                if (value) {
                    this.log.debug('==> PROCESSED VOTE: ', smsgMessage ? smsgMessage.msgid : '');
                } else {
                    this.log.debug('==> PROCESSED VOTE, with no weight. vote ignored.');
                }
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                this.log.debug('==> VOTE PROCESSING FAILED: ', reason);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }


}
