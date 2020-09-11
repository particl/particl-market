// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { MarketService } from '../../services/model/MarketService';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import { ProfileService } from '../../services/model/ProfileService';
import { DefaultMarketService } from '../../services/DefaultMarketService';
import { DefaultProfileService } from '../../services/DefaultProfileService';


export class MarketRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) private defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) private defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.MARKET_REMOVE);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
                name: 'marketId',
                required: true,
                type: 'number'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: market: resources.Market
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const market: resources.Market = data.params[0];

        // TODO: make sure all other market related data is removed
        return this.marketService.destroy(market.id);
    }

    /**
     * data.params[]:
     *  [0]: marketId
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const marketId = data.params[0];

        // make sure Market with the id exists
        const market: resources.Market = await this.marketService.findOne(marketId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        const defaultProfile: resources.Profile = await this.defaultProfileService.getDefault();
        const defaultMarket: resources.Market = await this.defaultMarketService.getDefaultForProfile(defaultProfile.id, false)
            .then(value => value.toJSON());

        this.log.debug('market.id', market.id);
        this.log.debug('defaultMarket.id', defaultMarket.id);
        if (market.id === defaultMarket.id) {
            throw new MessageException('Default Market cannot be removed.');
        }

        data.params[0] = market;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <marketId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>                 - The Id of the Market we want to remove. ';
    }

    public description(): string {
        return 'Remove a Market.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' 1 1 ';
    }
}
