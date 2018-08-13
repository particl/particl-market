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
import {ProposalCreateRequest} from '../requests/ProposalCreateRequest';
import {ProposalOptionCreateRequest} from '../requests/ProposalOptionCreateRequest';
import {MessageException} from '../exceptions/MessageException';

export class ProposalFactory {

    public log: LoggerType;

    constructor(@inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
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
                            senderProfile: resources.Profile): Promise<ProposalMessage> {

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

        message.hash = ObjectHash.getHash(message, HashableObjectType.PROPOSAL_MESSAGE);

        // add hashes for the options too
        for (const option of message.options) {
            option.proposalHash = message.hash;
            option.hash = ObjectHash.getHash(option, HashableObjectType.PROPOSALOPTION_CREATEREQUEST);
        }
        return message;
    }

    /**
     *
     * @param {ProposalMessage} proposalMessage
     * @returns {Promise<ProposalCreateRequest>}
     */
    public async getModel(proposalMessage: ProposalMessage): Promise<ProposalCreateRequest> {

        const proposalCreateRequest = {
            submitter: proposalMessage.submitter,
            blockStart: proposalMessage.blockStart,
            blockEnd: proposalMessage.blockEnd,
            hash: proposalMessage.hash,
            type: proposalMessage.type,
            title: proposalMessage.title,
            description: proposalMessage.description,
            options: proposalMessage.options as ProposalOptionCreateRequest[]
        } as ProposalCreateRequest;

        const correctHash = ObjectHash.getHash(proposalCreateRequest, HashableObjectType.PROPOSAL_CREATEREQUEST);
        if (correctHash !== proposalCreateRequest.hash) {
            throw new MessageException(`Received proposal hash <${proposalCreateRequest.hash}> doesn't match actual hash <${correctHash}>.`);
        }

        return proposalCreateRequest;
    }

}
