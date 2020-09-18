// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { ProposalAddMessage } from '../../messages/action/ProposalAddMessage';
import { ProposalCreateRequest } from '../../requests/model/ProposalCreateRequest';
import { ProposalOptionCreateRequest } from '../../requests/model/ProposalOptionCreateRequest';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { ProposalCreateParams } from '../ModelCreateParams';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashMismatchException } from '../../exceptions/HashMismatchException';
import { HashableProposalCreateRequestConfig } from '../hashableconfig/createrequest/HashableProposalCreateRequestConfig';
import { HashableProposalAddField, HashableProposalOptionField } from '../hashableconfig/HashableField';
import { HashableProposalOptionMessageConfig } from '../hashableconfig/message/HashableProposalOptionMessageConfig';
import { HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';


export class ProposalFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(@inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param params
     * @returns {Promise<ProposalCreateRequest>}
     */
    public async get(params: ProposalCreateParams): Promise<ProposalCreateRequest> {

        // this.log.debug('get(), params: ', JSON.stringify(params, null, 2));
        const actionMessage: ProposalAddMessage = params.actionMessage;
        const smsgMessage: resources.SmsgMessage = params.smsgMessage!;

        const optionsList: ProposalOptionCreateRequest[] = this.getOptionCreateRequests(actionMessage.options);

        const createRequest = {
            submitter: actionMessage.submitter,
            category: actionMessage.category,
            title: actionMessage.title,
            description: actionMessage.description,
            target: actionMessage.target,
            options: optionsList,
            postedAt: !_.isNil(smsgMessage) ? smsgMessage.sent : undefined,
            receivedAt: !_.isNil(smsgMessage) ? smsgMessage.received : undefined,
            expiredAt: !_.isNil(smsgMessage) ? smsgMessage.expiration : undefined,
            timeStart: !_.isNil(smsgMessage) ? smsgMessage.sent : undefined,
            msgid: !_.isNil(smsgMessage) ? smsgMessage.msgid : undefined,
            market: !_.isNil(smsgMessage) ? smsgMessage.to : undefined
        } as ProposalCreateRequest;

        // hash the proposal
        let hashableOptions = '';
        for (const option of createRequest.options) {
            hashableOptions = hashableOptions + option.optionId + ':' + option.description + ':';
        }
        createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableProposalCreateRequestConfig([{
            value: hashableOptions,
            to: HashableProposalAddField.PROPOSAL_OPTIONS
        }, {
            value: createRequest.market,
            to: HashableProposalAddField.PROPOSAL_MARKET
        }] as HashableFieldValueConfig[]));

        // validate that the createRequest.hash should have a matching hash with the incoming or outgoing message
        if (actionMessage.hash !== createRequest.hash) {
            const error = new HashMismatchException('ProposalCreateRequest', actionMessage.hash, createRequest.hash);
            this.log.error(error.getMessage());
            throw error;
        }

        // add hashes for the options too
        for (const option of createRequest.options) {
            option.hash = ConfigurableHasher.hash(option, new HashableProposalOptionMessageConfig([{
                value: createRequest.hash,
                to: HashableProposalOptionField.PROPOSALOPTION_PROPOSAL_HASH
            }]));
        }
        // createRequest.options = optionsList;
        // this.log.debug('get(), createRequest: ', JSON.stringify(createRequest, null, 2));

        return createRequest;
    }

    // todo: ProposalOptionFactory
    private getOptionCreateRequests(options: resources.ProposalOption[]): ProposalOptionCreateRequest[] {
        const optionsList: ProposalOptionCreateRequest[] = [];

        for (const proposalOption of options) {
            const option = {
                optionId: proposalOption.optionId,
                description: proposalOption.description
            } as ProposalOptionCreateRequest;
            optionsList.push(option);
        }
        optionsList.sort(((a, b) => a.optionId > b.optionId ? 1 : -1));

        return optionsList;
    }
}
