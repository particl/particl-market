import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ProposalMessage } from '../messages/ProposalMessage';
import { ProposalMessageType } from '../enums/ProposalMessageType';

export class ProposalFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {BidMessageType} bidMessageType
     * @param {string} itemHash
     * @param {IdValuePair[]} idValuePairObjects
     * @returns {Promise<BidMessage>}
     */
    public async getMessage(proposalMessageType: ProposalMessageType, data?: any[]): Promise<ProposalMessage> {

        const message = {
            action: proposalMessageType,
            objects: data
        } as ProposalMessage;

        return message;
    }
}
