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
import { GovernanceAction } from '../../enums/GovernanceAction';
import { ProposalAddMessage } from '../../messages/action/ProposalAddMessage';
import { ProposalAddActionService } from '../../services/action/ProposalAddActionService';

export class ProposalAddActionListener extends BaseActionListenr implements interfaces.Listener, ActionListenerInterface {

    public static Event = Symbol(GovernanceAction.MPA_PROPOSAL_ADD);

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,

        @inject(Types.Service) @named(Targets.Service.action.ProposalAddActionService) public proposalAddActionService: ProposalAddActionService,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(GovernanceAction.MPA_PROPOSAL_ADD, smsgMessageService, Logger);
    }

    /**
     * handles the received ProposalAddMessage and returns SmsgMessageStatus as a result
     *
     * TODO: check whether returned SmsgMessageStatuses actually make sense and the responses to those
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: ProposalAddMessage = marketplaceMessage.action as ProposalAddMessage;

        // processProposal will create or update the Proposal
        return await this.proposalAddActionService.processProposal(actionMessage, smsgMessage)
            .then(value => {
                this.log.debug('==> PROCESSED PROPOSAL: ', value.hash);
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                this.log.debug('==> PROPOSAL PROCESSING FAILED: ', reason);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }

}
