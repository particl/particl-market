// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { SettingService } from '../../services/model/SettingService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProfileService } from '../../services/model/ProfileService';
import { MarketService } from '../../services/model/MarketService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class SettingGetCommand extends BaseCommand implements RpcCommandInterface<resources.Setting[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.SETTING_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [1]: key
     *  [0]: profile: resources.Profile
     *  [2]: market: resources.Market, optional
     *
     * TODO: change this command name to find or similar since we're returning an array
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<resources.Setting[]>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<resources.Setting[]> {

        const key = data.params[0];
        const profile: resources.Profile = data.params[1];
        const market: resources.Market = data.params[2];

        if (!_.isEmpty(market)) {
            // if market was given
            const setting: resources.Setting = await this.settingService.findOneByKeyAndProfileIdAndMarketId(key, profile.id, market.id)
                .then(value => value.toJSON());
            return [setting];

        } else {
            // no market
            return await this.settingService.findAllByKeyAndProfileId(key, profile.id).then(value => value.toJSON());

        }

    }

    /**
     * data.params[]:
     *  [0]: key
     *  [1]: profileId
     *  [2]: marketId, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('key');
        } else if (data.params.length < 2) {
            throw new MissingParamException('profileId');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('key', 'string');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        }

        // optional marketId
        if (data.params[2] && typeof data.params[2] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        // make sure Profile with the id exists
        data.params[1] = await this.profileService.findOne(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        // if given, make sure Market exists
        if (data.params[2]) {
            data.params[2] = await this.marketService.findOne(data.params[2])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Market');
                });

        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <key> [marketId] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the related profile \n'
            + '    <key>                    - String - The key of the setting we want to fetch.'
            + '    <marketId>               - Numeric - The ID of the related Market \n';
    }

    public description(): string {
        return 'Get the Setting(s) for Profile, key and optionally Market.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' 1 key';
    }
}
