// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { ProposalAddMessage } from '../../messages/action/ProposalAddMessage';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { BidMessage } from '../../messages/action/BidMessage';
import { ProposalAddMessageCreateParams } from '../../requests/message/ProposalAddMessageCreateParams';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableProposalAddMessageConfig } from '../hashableconfig/message/HashableProposalAddMessageConfig';
import { HashableProposalOptionMessageConfig } from '../hashableconfig/message/HashableProposalOptionMessageConfig';
import {HashableProposalAddField, HashableProposalOptionField} from '../hashableconfig/HashableField';
import {GovernanceAction} from '../../enums/GovernanceAction';

export class ProposalAddMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(@inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param params: ProposalAddMessageCreateParams
     *      title: string;
     *      description: string;
     *      options: string[];
     *      sender: resources.Profile;
     *      itemHash?: string;
     * @returns {Promise<BidMessage>}
     */
    public async get(params: ProposalAddMessageCreateParams): Promise<ProposalAddMessage> {

        const optionsList: resources.ProposalOption[] = this.createOptionsList(params.options);

        const category = params.category
            ? params.category
            : params.itemHash
                ? ProposalCategory.ITEM_VOTE
                : ProposalCategory.PUBLIC_VOTE;

        const message: ProposalAddMessage = {
            type: GovernanceAction.MPA_PROPOSAL_ADD,
            submitter: params.sender.address,
            title: params.title,
            description: params.description,
            options: optionsList,
            category,
            item: params.itemHash
        } as ProposalAddMessage;

        // hash the proposal
        let hashableOptions = '';
        for (const option of optionsList) {
            hashableOptions = hashableOptions + option.optionId + ':' + option.description + ':';
        }
        message.hash = ConfigurableHasher.hash(message, new HashableProposalAddMessageConfig([{
            value: hashableOptions,
            to: HashableProposalAddField.PROPOSAL_OPTIONS
        }]));

        // add hashes for the options too
        for (const option of optionsList) {
            option.hash = ConfigurableHasher.hash(option, new HashableProposalOptionMessageConfig([{
                value: message.hash,
                to: HashableProposalOptionField.PROPOSALOPTION_PROPOSAL_HASH
            }]));
        }

        return message;
    }

    private createOptionsList(options: string[]): resources.ProposalOption[] {
        const optionsList: resources.ProposalOption[] = [];
        let optionId = 0;

        for (const description of options) {
            const option = {
                optionId,
                description
            } as resources.ProposalOption;
            optionsList.push(option);
            optionId++;
        }
        optionsList.sort(((a, b) => a.optionId > b.optionId ? 1 : -1));
        return optionsList;
    }

}
