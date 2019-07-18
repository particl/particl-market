// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Setting } from '../../models/Setting';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { SettingUpdateRequest } from '../../requests/model/SettingUpdateRequest';
import { SettingService } from '../../services/model/SettingService';
import { SettingCreateRequest } from '../../requests/model/SettingCreateRequest';
import { ProfileService } from '../../services/model/ProfileService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MarketService } from '../../services/model/MarketService';

export class SettingSetCommand extends BaseCommand implements RpcCommandInterface<Setting> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) private settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.SETTING_SET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: key
     *  [1]: value
     *  [2]: profile: resources.Profile
     *  [3]: market: resources.Market, optional
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Setting>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Setting> {
        const key = data.params[0];
        const value = data.params[1];
        const profile: resources.Profile = data.params[2];
        const market: resources.Market = data.params[3];

        const settingRequest = {
            key,
            value,
            profile_id: profile.id
        } as SettingCreateRequest | SettingUpdateRequest;

        if (!_.isEmpty(market)) {
            // if market was given

            return await this.settingService.findOneByKeyAndProfileIdAndMarketId(key, profile.id, market.id)
                .then(async (settingValue) => {
                    // found, update
                    const foundSetting: resources.Setting = settingValue.toJSON();
                    return await this.settingService.update(foundSetting.id, settingRequest);
                })
                .catch(async reason => {
                    // not found, insert
                    return await this.settingService.create(settingRequest as SettingCreateRequest);
                });
        } else {
            // no market
            // findAll, then pick the one with no market set if one exists

            return await this.settingService.findAllByKeyAndProfileId(key, profile.id)
                .then(async (settingValues) => {
                    const foundSettings: resources.Setting[] = settingValues.toJSON();

                    if (!_.isEmpty(foundSettings)) {
                        // found one or more matching settings with the key
                        const foundSettingWithTheKey = _.find(foundSettings, (valueMatchingWithKey) => {
                            // select the first one where Market is not set
                            return _.isEmpty(valueMatchingWithKey.Market);
                        });

                        if (!_.isEmpty(foundSettingWithTheKey)) {
                            // not empty, update
                            return await this.settingService.update(foundSettingWithTheKey!.id, settingRequest);
                        } else {
                            // empty, insert
                            return await this.settingService.create(settingRequest as SettingCreateRequest);
                        }

                    } else {
                        // no settings found -> insert
                        return await this.settingService.create(settingRequest as SettingCreateRequest);
                    }

                });
        }

    }

    /**
     * data.params[]:
     *  [0]: key
     *  [1]: value
     *  [2]: profileId
     *  [3]: marketId, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('key');
        } else if (data.params.length < 2) {
            throw new MissingParamException('value');
        } else if (data.params.length < 3) {
            throw new MissingParamException('profileId');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('key', 'string');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('value', 'string');
        } else if (typeof data.params[2] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        }

        // optional
        if (data.params[3] && typeof data.params[3] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        // make sure Profile with the id exists
        data.params[2] = await this.profileService.findOne(data.params[2])
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
        return this.getName() + ' <key> <value> <profileId> [marketId]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <key>                    - String - The key of the Setting we want to fetch. \n'
            + '    <value>                  - String - The value of the Setting we want to set.'
            + '    <profileId>              - Numeric - The ID of the related Profile \n'
            + '    <marketId>               - Numeric - The ID of the related Market \n';
    }

    public description(): string {
        return 'Set a Setting value for a key.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' key value 1';
    }
}
