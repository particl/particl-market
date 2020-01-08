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
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProposalAddActionService } from '../../services/action/ProposalAddActionService';
import { MarketService } from '../../services/model/MarketService';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ProposalAddRequest } from '../../requests/action/ProposalAddRequest';
import { MessageException } from '../../exceptions/MessageException';
import { IdentityService } from '../../services/model/IdentityService';

export class ProposalPostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.ProposalAddActionService) public proposalAddActionService: ProposalAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService
    ) {
        super(Commands.PROPOSAL_POST);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     * [0] market: resources.Market
     * [1] proposalTitle
     * [2] proposalDescription
     * [3] daysRetention
     * [4] estimateFee
     * [5] option1Description
     * [n...] optionNDescription
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<SmsgSendResponse> {

        const market: resources.Market = data.params.shift();
        const title = data.params.shift();
        const description = data.params.shift();
        const daysRetention = data.params.shift();
        const estimateFee = data.params.shift();

        // rest of the data.params are option descriptions, and there are minimum of 2 of those
        const options: string[] = data.params;

        const fromAddress = market.Identity.address;     // send from the template profiles address
        const toAddress = market.receiveAddress;    // send to given market address

        const postRequest = {
            sendParams: new SmsgSendParams(market.Identity.wallet, fromAddress, toAddress, true, daysRetention, estimateFee),
            sender: market.Identity,                // todo: we could use sendParams.from?
            market,
            category: ProposalCategory.PUBLIC_VOTE, // type should always be PUBLIC_VOTE when using this command
            title,
            description,
            options
        } as ProposalAddRequest;

        return await this.proposalAddActionService.post(postRequest);
    }

    /**
     * command description
     *
     * [0] marketId
     * [1] proposalTitle
     * [2] proposalDescription
     * [3] daysRetention
     * [4] estimateFee
     * [5] option1Description
     * [n...] optionNDescription
     *
     * @param data, RpcRequest
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // TODO: set the max expiration for proposals of category PUBLIC_VOTE
        // to whatever is the max expiration for free smsg messages

        if (data.params.length < 1) {
            throw new MissingParamException('marketId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('proposalTitle');
        } else if (data.params.length < 3) {
            throw new MissingParamException('proposalDescription');
        } else if (data.params.length < 4) {
            throw new MissingParamException('daysRetention');
        } else if (data.params.length < 5) {
            throw new MissingParamException('estimateFee');
        } else if (data.params.length < 6) {
            throw new MissingParamException('option1Description');
        } else if (data.params.length < 7) {
            throw new MissingParamException('option2Description');
        }

        if (data.params[0] !== undefined && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        } else if (data.params[1] !== undefined && typeof data.params[1] !== 'string') {
            throw new InvalidParamException('proposalTitle', 'string');
        } else if (data.params[2] !== undefined && typeof data.params[2] !== 'string') {
            throw new InvalidParamException('proposalDescription', 'string');
        } else if (data.params[3] !== undefined && typeof data.params[3] !== 'number') {
            throw new InvalidParamException('daysRetention', 'number');
        } else if (data.params[4] !== undefined && typeof data.params[4] !== 'boolean') {
            throw new InvalidParamException('estimateFee', 'boolean');
        }

        if (data.params[3] > parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10)) {
            throw new MessageException('daaysRetention is too large, max: ' + process.env.PAID_MESSAGE_RETENTION_DAYS);
        }

        // make sure the Market exists
        const market: resources.Market = await this.marketService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        // make sure Identity with the id exists
        await this.identityService.findOne(market.Identity.id)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        data.params[0] = market;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <marketId> <proposalTitle> <proposalDescription> <daysRetention> <estimateFee> '
            + '<option1Description> ... <optionNDescription> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>               - number, id of the Market. \n'
            + '    <proposalTitle>          - string, Title for the Proposal. \n'
            + '    <proposalDescription>    - string, Description for the Proposal. \n'
            + '    <daysRetentions>         - number, Days retention. \n'
            + '    <estimateFee>            - boolean, Just estimate the Fee, dont post the Proposal. \n'
            + '    <optionNDescription>     - string, ProposalOption description. ';
    }

    public description(): string {
        return ' Post a proposal.';
    }

    public example(): string {
        return this.getName() + ' proposal post 1 "A question of sets" "The set of all sets contains itself?" 1 false YES NO';
    }
}
