// Copyright (c) 2017-2019, The Particl Market developers
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
import { ActionListenerInterface } from '../ActionListenerInterface';
import { BaseActionListenr } from '../BaseActionListenr';
import { BidService } from '../../services/model/BidService';
import { CommentAction } from '../../enums/CommentAction';
import { CommentService } from '../../services/model/CommentService';
import { CommentAddActionService } from '../../services/action/CommentAddActionService';
import { ProposalService } from '../../services/model/ProposalService';
import { CommentAddMessage } from '../../messages/action/CommentAddMessage';

export class CommentAddActionListener extends BaseActionListenr implements interfaces.Listener, ActionListenerInterface {

    public static Event = Symbol(CommentAction.MPA_COMMENT_ADD);

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.action.CommentAddActionService) public commentAddActionService: CommentAddActionService,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(CommentAction.MPA_COMMENT_ADD, smsgMessageService, bidService, proposalService, Logger);
    }

    /**
     * handles the received CommentAddMessage and returns SmsgMessageStatus as a result
     *
     * TODO: check whether returned SmsgMessageStatuses actually make sense and the responses to those
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: CommentAddMessage = marketplaceMessage.action as CommentAddMessage;

        // processProposal will create or update the Proposal
        return await this.commentAddActionService.processComment(actionMessage, smsgMessage)
            .then(value => {
                this.log.debug('==> PROCESSED COMMENT: ', value ? value.hash : '');
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                this.log.debug('==> COMMENT PROCESSING FAILED: ', reason);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }

}
