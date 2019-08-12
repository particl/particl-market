// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { CoreRpcService } from './CoreRpcService';
import { SettingService } from './model/SettingService';
import { SettingUpdateRequest } from '../requests/model/SettingUpdateRequest';
import { SettingCreateRequest } from '../requests/model/SettingCreateRequest';
import { SettingValue } from '../enums/SettingValue';

export class DefaultSettingService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async saveDefaultProfileSettings(defaultProfile: resources.Profile): Promise<void> {

        if (!_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_NAME])
            && !_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY])
            && !_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_ADDRESS])) {

            await this.insertOrUpdateSettingFromEnv(SettingValue.DEFAULT_MARKETPLACE_NAME, defaultProfile)
                .then(value => {
                    const settingValue = value ? value.value : 'undefined';
                    this.log.debug('DEFAULT_MARKETPLACE_NAME: ', settingValue);
                });

            await this.insertOrUpdateSettingFromEnv(SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY, defaultProfile)
                .then(value => {
                    const settingValue = value ? value.value : 'undefined';
                    this.log.debug('DEFAULT_MARKETPLACE_PRIVATE_KEY: ', settingValue);
                });

            await this.insertOrUpdateSettingFromEnv(SettingValue.DEFAULT_MARKETPLACE_ADDRESS, defaultProfile)
                .then(value => {
                    const settingValue = value ? value.value : 'undefined';
                    this.log.debug('DEFAULT_MARKETPLACE_ADDRESS: ', settingValue);
                });
        }

        return;
    }

    public async insertOrUpdateSettingFromEnv(settingKey: string, profile: resources.Profile): Promise<resources.Setting | undefined> {

        if (!_.isEmpty(process.env[settingKey])) {

             // if set already, update, if not set, create,
            const foundSettings: resources.Setting[] = await this.settingService.findAllByKeyAndProfileId(settingKey, profile.id)
                .then(value => value.toJSON());

            const foundSettingWithTheKey = _.find(foundSettings, (valueMatchingWithKey) => {
                // select the first one where Market is not set
                return _.isEmpty(valueMatchingWithKey.Market);
            });

            const settingRequest = {
                key: settingKey,
                value: process.env[settingKey],
                profile_id: profile.id
            } as SettingCreateRequest | SettingUpdateRequest;

            // if found, update, if not, create,
            if (!_.isEmpty(foundSettingWithTheKey)) {
                // not empty, update
                return await this.settingService.update(foundSettingWithTheKey!.id, settingRequest).then(value => value.toJSON());
            } else {
                // empty, insert
                return await this.settingService.create(settingRequest as SettingCreateRequest).then(value => value.toJSON());
            }

        } else {
            // if no default setting env var exists, return existing setting or undefined if that doesnt exist either
            const foundSettings: resources.Setting[] = await this.settingService.findAllByKeyAndProfileId(settingKey, profile.id)
                .then(value => value.toJSON());
            return foundSettings[0] ? foundSettings[0] : undefined;
        }
    }

}
