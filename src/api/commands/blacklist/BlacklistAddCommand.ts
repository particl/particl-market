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
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { MarketService } from '../../services/model/MarketService';
import {
    CommandParamValidationRules,
    EnumValidationRule, IdValidationRule,
    ParamValidationRule,
    StringValidationRule
} from '../CommandParamValidation';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { Blacklist } from '../../models/Blacklist';
import { BlacklistType } from '../../enums/BlacklistType';
import { ListingItemService } from '../../services/model/ListingItemService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { BlacklistCreateRequest } from '../../requests/model/BlacklistCreateRequest';
import { BlacklistService } from '../../services/model/BlacklistService';


export class BlacklistAddCommand extends BaseCommand implements RpcCommandInterface<Blacklist> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) public blacklistService: BlacklistService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService
    ) {
        super(Commands.BLACKLIST_ADD);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new EnumValidationRule('type', true, 'BlacklistType',
                    EnumHelper.getValues(BlacklistType) as string[]),
                new StringValidationRule('target', true),
                new IdValidationRule('marketId', false, this.marketService)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: type: BlacklistType
     *  [1]: target: string
     *  [2]: market: resources.Market, optional
     *
     * @param data
     * @returns {Promise<Blacklist>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Blacklist> {
        const type: BlacklistType = data.params[0];
        const target: string = data.params[1];
        const market: resources.Market = data.params[2];

        return await this.blacklistService.create({
            type,
            target,
            market: market.receiveAddress
        } as BlacklistCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: type: BlacklistType
     *  [1]: target: string
     *  [2]: market: resources.Market, optional
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const type: BlacklistType = data.params[0];
        const target: string = data.params[1];
        const market: resources.Market = data.params[2];

        switch (type) {
            case BlacklistType.LISTINGITEM:
                if (_.isNil(market)) {
                    throw new MissingParamException('marketId');
                }
                await this.listingItemService.findOneByHashAndMarketReceiveAddress(target, market.receiveAddress)
                    .catch(reason => {
                        throw new ModelNotFoundException('ListingItem');
                    });
                break;
            case BlacklistType.MARKET:
                const markets = await this.marketService.findAllByHash(target).then(value => value.toJSON());
                if (markets.length === 0) {
                    throw new ModelNotFoundException('Market');
                }
                break;
            default:
                throw new InvalidParamException('type', 'BlacklistType');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <type> <target> [marketId]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <type>                       - BlacklistType\n'
            + '    <target>                     - string, The Blacklist target hash. \n'
            + '    <marketId>                   - [optional] number. \n';
    }

    public description(): string {
        return 'Add a Blacklist.';
    }

    public example(): string {
        return 'blacklist ' + this.getName() + ' LISTINGITEM hash';
    }
}
