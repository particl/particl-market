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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalAddRequest } from '../../requests/action/ProposalAddRequest';
import { IdentityService } from '../../services/model/IdentityService';

export class MarketFlagCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.action.ProposalAddActionService) public proposalAddActionService: ProposalAddActionService
    ) {
        super(Commands.MARKET_FLAG);
        this.log = new Logger(__filename);
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
        const options: string[] = [ItemVote.KEEP, ItemVote.REMOVE];

        const fromAddress = identity.address;
        const toAddress = market.receiveAddress;

        const postRequest = {
            sendParams: new SmsgSendParams(identity.wallet, fromAddress, toAddress, true, daysRetention, false),
            sender: identity,
            market,
            category: ProposalCategory.MARKET_VOTE,
            title,
            description,
            options,
            itemHash: market.receiveAddress // todo: rename to target
        } as ProposalAddRequest;

        return await this.proposalAddActionService.post(postRequest);
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

        if (data.params.length < 1) {
            throw new MissingParamException('marketId');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        const market: resources.Market = await this.marketService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        // check if item is already flagged
        if (!_.isEmpty(market.FlaggedItem)) {
            this.log.error('Market is already flagged.');
            throw new MessageException('Market is already flagged.');
        }

        // make sure identity exists
        const identity: resources.Identity = await this.identityService.findOne(market.Identity.id)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);

        data.params[0] = market;
        data.params[1] = identity;
        data.params[2] = data.params[2] ? data.params[2] : 'This Market should be removed.';
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
