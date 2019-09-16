// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { MarketService } from '../../services/model/MarketService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import { ProfileService } from '../../services/model/ProfileService';

export class MarketRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.MARKET_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [1]: profile: resources.Profile
     *  [0]: market: resources.Market
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const profile: resources.Profile = data.params[0];
        const market: resources.Market = data.params[1];

        // TODO: add removal of all other market related data
        return this.marketService.destroy(market.id);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [0]: marketId
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('marketId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        // make sure Profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        // make sure Market with the id exists
        const market: resources.Market = await this.marketService.findOne(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        const defaultMarket: resources.Market = await this.marketService.getDefaultForProfile(data.params[0], true)
            .then(value => value.toJSON());

        if (market.id === defaultMarket.id) {
            throw new MessageException('Default Market cannot be removed.');
        }

        data.params[0] = profile;
        data.params[1] = market;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <marketId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>                - The Id of the Profile which Market we want to remove. '
            + '    <marketId>                 - The Id of the Market we want to remove. ';
    }

    public description(): string {
        return 'Remove a Market.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' 1 1 ';
    }
}
