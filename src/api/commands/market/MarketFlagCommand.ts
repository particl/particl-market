// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketService } from '../../services/model/MarketService';
import { ProposalAddActionService } from '../../services/action/ProposalAddActionService';
import { ItemVote } from '../../enums/ItemVote';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalAddRequest } from '../../requests/action/ProposalAddRequest';
import { IdentityService } from '../../services/model/IdentityService';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';
import { ProposalService } from '../../services/model/ProposalService';
import { VoteRequest } from '../../requests/action/VoteRequest';
import {VoteActionService} from '../../services/action/VoteActionService';


export class MarketFlagCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.action.ProposalAddActionService) public proposalAddActionService: ProposalAddActionService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) public voteActionService: VoteActionService
    ) {
        super(Commands.MARKET_FLAG);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('marketId', true, this.marketService),
                new StringValidationRule('reason', false, 'This Market should be removed.')
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: market: resources.Market
     *  [1]: identity: resources.Identity
     *  [2]: reason
     *  [3]: expiryTime (set in validate)
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const market: resources.Market = data.params[0];
        const identity: resources.Identity = data.params[1];
        const title = market.receiveAddress;
        const description = data.params[2];
        const daysRetention = data.params[3];

        const postRequest = {
            sendParams: {
                wallet: identity.wallet,
                fromAddress: identity.address,
                toAddress: market.receiveAddress,
                daysRetention,
                estimateFee: false,
                anonFee: false
            } as SmsgSendParams,
            sender: identity,
            market,
            category: ProposalCategory.MARKET_VOTE,  // type should always be MARKET_VOTE when using this command
            title,
            description,
            options: [ItemVote.KEEP, ItemVote.REMOVE] as string[],
            target: market.receiveAddress
        } as ProposalAddRequest;

        // todo: cleanup this duplicate code

        const smsgSendResponse: SmsgSendResponse = await this.proposalAddActionService.post(postRequest);

        const proposal: resources.Proposal = await this.proposalService.findOneByMsgId(smsgSendResponse.msgid!).then(value => value.toJSON());
        const proposalOption: resources.ProposalOption | undefined = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
            return o.description === ItemVote.REMOVE;
        });

        // prepare the VoteRequest for sending votes
        const voteRequest = {
            sendParams: postRequest.sendParams,
            sender: postRequest.sender,          // Identity
            market: postRequest.market,
            proposal,
            proposalOption
        } as VoteRequest;

        // then post the Votes for removal (+create Blacklist)
        smsgSendResponse.childResults = await this.voteActionService.vote(voteRequest);

        return smsgSendResponse;

    }

    /**
     * data.params[]:
     *  [0]: marketId, number
     *  [1]: reason, string, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const market: resources.Market = data.params[0];
        const reason = data.params[1];

        // check if item is already flagged
        if (!_.isEmpty(market.FlaggedItem)) {
            this.log.error('Market is already flagged.');
            throw new MessageException('Market is already flagged.');
        }

        if (market.receiveKey === process.env.APP_DEFAULT_MARKETPLACE_PRIVATE_KEY) {
            this.log.error('Cannot flag the default Market.');
            throw new MessageException('Cannot flag the default Market.');
        }

        // make sure identity exists
        const identity: resources.Identity = await this.identityService.findOne(market.Identity.id)
            .then(value => value.toJSON())
            .catch(ex => {
                throw new ModelNotFoundException('Identity');
            });

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);

        data.params[0] = market;
        data.params[1] = identity;
        data.params[2] = reason;
        data.params[3] = daysRetention;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <marketId> [reason]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>         - Numeric - The id of the Market we want to report. \n'
            + '    <reason>           - String - Optional reason for the flagging';
    }

    public description(): string {
        return 'Report a Market.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' 1 \'reason\'';
    }
}
