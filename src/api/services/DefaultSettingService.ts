// Copyright (c) 2017-2020, The Particl Market developers
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

    /**
     * saves/updates the default market env vars as Settings
     *
     * @param defaultProfile
     */
    public async saveDefaultSettings(defaultProfile: resources.Profile): Promise<resources.Setting[]> {

        const settings: resources.Setting[] = [];

        if (!_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_NAME])
            && !_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY])
            && !_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_ADDRESS])) {

            await this.insertOrUpdateSettingFromEnv(SettingValue.DEFAULT_MARKETPLACE_NAME)
                .then(value => {
                    const settingValue = value ? value.value : 'undefined';
                    this.log.debug('DEFAULT_MARKETPLACE_NAME: ', settingValue);
                    if (value) {
                        settings.push(value);
                    }
                });

            await this.insertOrUpdateSettingFromEnv(SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY)
                .then(value => {
                    const settingValue = value ? value.value : 'undefined';
                    this.log.debug('DEFAULT_MARKETPLACE_PRIVATE_KEY: ', settingValue);
                    if (value) {
                        settings.push(value);
                    }
                });

            await this.insertOrUpdateSettingFromEnv(SettingValue.DEFAULT_MARKETPLACE_ADDRESS)
                .then(value => {
                    const settingValue = value ? value.value : 'undefined';
                    this.log.debug('DEFAULT_MARKETPLACE_ADDRESS: ', settingValue);
                    if (value) {
                        settings.push(value);
                    }
                });
        }

        return settings;
    }

    /**
     * updates the default profile id Setting
     *
     * @param profileId
     */
    public async insertOrUpdateDefaultProfileSetting(profileId: number): Promise<resources.Setting> {
        // retrieve the default Profile id, if it exists
        const foundSettings: resources.Setting[] = await this.settingService.findAllByKey(SettingValue.DEFAULT_PROFILE_ID).then(value => value.toJSON());
        const defaultProfileIdSetting = foundSettings[0];

        // undefined if default profile is not set yet. if set already, update, if not set, create
        if (_.isEmpty(defaultProfileIdSetting)) {
            return await this.settingService.create({
                key: SettingValue.DEFAULT_PROFILE_ID.toString(),
                value: '' + profileId
            } as SettingCreateRequest).then(value => value.toJSON());

        } else {
            return await this.settingService.update(defaultProfileIdSetting.id, {
                key: SettingValue.DEFAULT_PROFILE_ID.toString(),
                value: '' + profileId
            } as SettingUpdateRequest).then(value => value.toJSON());
        }
    }

    /**
     * updates the default profile id Setting
     *
     * @param profileId
     * @param marketId
     */
    public async insertOrUpdateProfilesDefaultMarketSetting(profileId: number, marketId: number): Promise<resources.Setting> {
        // retrieve the default Market id, if it exists
        const foundSettings: resources.Setting[] = await this.settingService.findAllByKeyAndProfileId(SettingValue.DEFAULT_MARKETPLACE_ID, profileId)
            .then(value => value.toJSON());
        const defaultMarketIdSetting = foundSettings[0];

        // undefined if default market is not set yet. if set already, update, if not set, create
        if (_.isEmpty(defaultMarketIdSetting)) {
            return await this.settingService.create({
                profile_id: profileId,
                key: SettingValue.DEFAULT_MARKETPLACE_ID.toString(),
                value: '' + marketId
            } as SettingCreateRequest).then(value => value.toJSON());

        } else {
            return await this.settingService.update(defaultMarketIdSetting.id, {
                key: SettingValue.DEFAULT_MARKETPLACE_ID.toString(),
                value: '' + marketId
            } as SettingUpdateRequest).then(value => value.toJSON());
        }
    }

    /**
     *
     * @param settingKey
     * @param profile
     */
    private async insertOrUpdateSettingFromEnv(settingKey: string): Promise<resources.Setting | undefined> {

        if (!_.isEmpty(process.env[settingKey])) {

            const foundSettings: resources.Setting[] = await this.settingService.findAllByKey(settingKey).then(value => value.toJSON());
            const foundSettingWithTheKey = foundSettings[0];

            const settingRequest = {
                key: settingKey,
                value: process.env[settingKey]
            } as SettingCreateRequest | SettingUpdateRequest;

            if (!_.isEmpty(foundSettingWithTheKey)) { // not empty, update
                return await this.settingService.update(foundSettingWithTheKey.id, settingRequest).then(value => value.toJSON());
            } else { // empty, insert
                return await this.settingService.create(settingRequest as SettingCreateRequest).then(value => value.toJSON());
            }

        } else {
            // if no default setting env var exists, return existing setting or undefined if that doesnt exist either
            const foundSettings: resources.Setting[] = await this.settingService.findAllByKey(settingKey).then(value => value.toJSON());
            return foundSettings[0] ? foundSettings[0] : undefined;
        }
    }

}
