import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { VoteMessage } from '../messages/VoteMessage';
import { VoteMessageType } from '../enums/VoteMessageType';
import * as resources from 'resources';

export class VoteFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {VoteMessageType} voteMessageType
     * @param {string} itemHash
     * @param {IdValuePair[]} idValuePairObjects
     * @returns {Promise<VoteMessage>}
     */
    public async getMessage(voteMessageType: VoteMessageType, proposal: resources.Proposal, proposalOption: resources.ProposalOption,
                            senderProfile: resources.Profile, currentBlock: number): Promise<VoteMessage> {

        const proposalHash = proposal.hash;
        const optionId = proposalOption.optionId;
        const voter = senderProfile.address;
        const block = currentBlock;
        const weight = 1;

        return {
            action: voteMessageType,
            proposalHash,
            optionId,
            voter,
            block,
            weight
        } as VoteMessage;
    }
}
