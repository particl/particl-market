// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProposalAddMessage } from '../../messages/action/ProposalAddMessage';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ObjectHashDeprecated } from '../../messages/hashable/ObjectHashDeprecated';
import { HashableObjectTypeDeprecated } from '../../enums/HashableObjectTypeDeprecated';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { BidMessage } from '../../messages/action/BidMessage';
import { ProposalAddMessageCreateParams } from '../../requests/message/ProposalAddMessageCreateParams';

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

        const optionsList: any[] = this.createOptionsList(params.options);

        let proposalCategory = ProposalCategory.PUBLIC_VOTE;
        if (params.itemHash) {
            proposalCategory = ProposalCategory.ITEM_VOTE;
        }

        const message: ProposalAddMessage = {
            submitter: params.sender.address,
            title: params.title,
            description: params.description,
            options: optionsList,
            category: proposalCategory,
            item: params.itemHash
        } as ProposalAddMessage;

        message.hash = ObjectHashDeprecated.getHash(message, HashableObjectTypeDeprecated.PROPOSAL_MESSAGE);

        // add hashes for the options too
        for (const option of message.options) {
            option.proposalHash = message.hash;
            option.hash = ObjectHashDeprecated.getHash(option, HashableObjectTypeDeprecated.PROPOSALOPTION_CREATEREQUEST);
        }
        return message;
    }

    // TODO: use KVS[]?
    private createOptionsList(options: string[]): any[] {
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
        return optionsList;
    }

}
