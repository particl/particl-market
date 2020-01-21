// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Core, Targets, Types } from '../../constants';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { MessageException } from '../exceptions/MessageException';
import { GovernanceAction } from '../enums/GovernanceAction';
import { VoteMessage } from '../messages/action/VoteMessage';
import { ProposalService } from '../services/model/ProposalService';
import { ActionDirection } from '../enums/ActionDirection';
import { Logger as LoggerType } from '../../core/Logger';
import { CoreRpcService } from '../services/CoreRpcService';
import { VoteTicket } from '../services/action/VoteActionService';
import { VoteService } from '../services/model/VoteService';

/**
 *
 */
export class VoteValidator implements ActionMessageValidatorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.VoteService) public voteService: VoteService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async validateMessage(marketplaceMessage: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        // TODO: move common checks to base class
        if (!marketplaceMessage.version) {
            throw new MessageException('version: missing');
        }

        if (!marketplaceMessage.action) {
            throw new MessageException('action: missing');
        }

        if (!marketplaceMessage.action.type) {
            throw new MessageException('action.type: missing');
        }

        if (marketplaceMessage.action.type !== GovernanceAction.MPA_VOTE) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + GovernanceAction.MPA_VOTE]);
        }

        // TODO: check required marketplaceMessage fields exists

        const actionMessage: VoteMessage = marketplaceMessage.action as VoteMessage;

        const proposal: resources.Proposal = await this.proposalService.findOneByHash(actionMessage.proposalHash).then(value => value.toJSON());
        if (actionMessage && actionMessage.generated > proposal.expiredAt) {
            this.log.error('proposal.expiredAt: ' + proposal.expiredAt + ' < ' + 'smsgMessage.sent: ' + actionMessage.generated);
            // smsgMessage -> message was received, there's no smsgMessage if the vote was just saved locally
            // smsgMessage.sent > proposal.expiredAt -> message was sent after expiration
            throw new MessageException('Vote is invalid, it was sent after Proposal expiration.');
        }

        // verify that the Vote was actually sent by the owner of the address
        const verified = await this.verifyVote(actionMessage);
        if (!verified) {
            throw new MessageException('Received signature failed validation.');
        } else {
            this.log.debug('Vote verified!');
        }

        // address needs to have balance for the Vote to matter
        const balance = await this.coreRpcService.getAddressBalance([actionMessage.voter]).then(value => parseInt(value.balance, 10));
        if (balance <= 0) {
            throw new MessageException('Vote address has no balance.');
        }

        return true;
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        // MPA_PROPOSAL_ADD should exists
        // -> (msg.action as MPA_VOTE).proposalHash is the hash of Proposal
        return await this.proposalService.findOneByHash((message.action as VoteMessage).proposalHash, true)
            .then( () => true)
            .catch( () => false);
    }

    /**
     * verifies VoteTicket, returns boolean
     *
     * @param voteMessage
     */
    private async verifyVote(voteMessage: VoteMessage): Promise<boolean> {
        const voteTicket = {
            proposalHash: voteMessage.proposalHash,
            proposalOptionHash: voteMessage.proposalOptionHash,
            address: voteMessage.voter
        } as VoteTicket;
        return await this.coreRpcService.verifyMessage(voteMessage.voter, voteMessage.signature, voteTicket);
    }

}
