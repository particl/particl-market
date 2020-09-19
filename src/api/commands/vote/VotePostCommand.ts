// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteActionService } from '../../services/action/VoteActionService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MarketService } from '../../services/model/MarketService';
import { ProposalService } from '../../services/model/ProposalService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { VoteRequest } from '../../requests/action/VoteRequest';
import { IdentityService } from '../../services/model/IdentityService';
import { CommandParamValidationRules, IdValidationRule, NumberValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';
import {BidCancelRequest} from '../../requests/action/BidCancelRequest';


export class VotePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) public voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService
    ) {
        super(Commands.VOTE_POST);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('marketId', true, this.marketService),
                new StringValidationRule('proposalHash', true),
                new NumberValidationRule('proposalOptionId', true)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *   [0]: market: resources.Market
     *   [1]: proposal: resources.Proposal
     *   [2]: proposalOption: resources.ProposalOption
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<SmsgSendResponse> {

        const market: resources.Market = data.params[0];
        const proposal: resources.Proposal = data.params[1];
        const proposalOption: resources.ProposalOption = data.params[2];

        // fetch Market Identity
        const identity: resources.Identity = await this.identityService.findOne(market.Identity.id)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        // TODO: validate that the !daysRetention > process.env.FREE_MESSAGE_RETENTION_DAYS

        const postRequest = {
            sendParams: {
                wallet: identity.wallet,
                fromAddress: identity.address,
                toAddress: market.receiveAddress,
                paid: false,
                daysRetention: Math.ceil((proposal.expiredAt - Date.now()) / 1000 / 60 / 60 / 24),
                estimateFee: false,
                anonFee: true
            } as SmsgSendParams,
            sender: identity,                       // todo: could we use sendParams.from?
            market,
            proposal,
            proposalOption
        } as VoteRequest;

        // calling vote instead of post since we're going to send multiple messages
        return await this.voteActionService.vote(postRequest);

    }

    /**
     * data.params[]:
     *  [0]: marketId
     *  [1]: proposalHash
     *  [2]: proposalOptionId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const market: resources.Market = data.params[0];

        // make sure Proposal with the id exists
        const proposal: resources.Proposal = await this.proposalService.findOneByHash(data.params[1])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('Proposal');
            });

        // make sure ProposalOption exists
        const proposalOption: resources.ProposalOption | undefined = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
            return o.optionId === data.params[2];
        });
        if (!proposalOption) {
            throw new ModelNotFoundException('ProposalOption');
        }

        data.params[0] = market;
        data.params[1] = proposal;
        data.params[2] = proposalOption;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <marketId> <proposalHash> <proposalOptionId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>                  - The id of the Market. ' + ' \n'
            + '    <proposalHash>              - The hash of the Proposal. ' + ' \n'
            + '    <proposalOptionId>          - The id of the ProposalOption. ';
    }

    public description(): string {
        return 'Vote on a Proposal. ';
    }

    public example(): string {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 0';
    }
}
