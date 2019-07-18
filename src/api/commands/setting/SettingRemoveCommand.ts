// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { SettingService } from '../../services/model/SettingService';
import { ProfileService } from '../../services/model/ProfileService';
import { MarketService } from '../../services/model/MarketService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class SettingRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.SETTING_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: key
     *  [1]: profile: resources.Profile
     *  [2]: market: resources.Market, optional
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<void> {
        const key = data.params[0];
        const profile: resources.Profile = data.params[1];
        const market: resources.Market = data.params[2];

        if (!_.isEmpty(market)) {
            // if market was given
            return await this.settingService.destroyByKeyAndProfileIdAndMarketId(key, profile.id, market.id);
        } else {
            // no market
            const settings: resources.Setting[] = await this.settingService.findAllByKeyAndProfileId(key, profile.id)
                .then(value => value.toJSON());
            for (const setting of settings) {
                await this.settingService.destroy(setting.id);
            }
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

        // optional
        if (data.params[3] && typeof data.params[3] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        // make sure Profile with the id exists
        data.params[1] = await this.profileService.findOne(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        // if given, make sure Market exists
        if (data.params[3]) {
            data.params[3] = await this.marketService.findOne(data.params[3])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Market');
                });

        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <key> <profileId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <key>                    - key of the setting, which we want to remove. '
            + '    <profileId>              - The ID of the Profile, for which the Setting belongs to. ';
    }

    public description(): string {
        return 'Remove a Setting.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' key 1';
    }
}
