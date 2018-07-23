import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ProposalMessage } from '../messages/ProposalMessage';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import * as resources from 'resources';
import {ProposalType} from '../enums/ProposalType';
import {ObjectHash} from '../../core/helpers/ObjectHash';
import {HashableObjectType} from '../enums/HashableObjectType';

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
    public async getMessage(proposalMessageType: ProposalMessageType, proposalType: ProposalType, proposalTitle: string,
                            proposalDescription: string, blockStart: number, blockEnd: number, options: string[],
                            senderProfile: resources.Profile, marketplace: resources.Market): Promise<ProposalMessage> {

        const submitter = senderProfile.address;

        const optionsList: any[] = [];
        let optionId = 0;

        for (const description of options) {
            const option = {
                optionId,
                description
            };
            optionsList.push(option);
            optionId++;
        }

        const message: ProposalMessage = {
            action: proposalMessageType,
            submitter,
            blockStart,
            blockEnd,
            title: proposalTitle,
            description: proposalDescription,
            options: optionsList,
            type: proposalType
        } as ProposalMessage;

        return message;
    }
}
