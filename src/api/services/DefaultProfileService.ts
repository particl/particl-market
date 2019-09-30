// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Profile } from '../models/Profile';
import { ProfileService } from './model/ProfileService';
import { CoreRpcService, RpcWalletInfo } from './CoreRpcService';
import { ProfileCreateRequest } from '../requests/model/ProfileCreateRequest';
import { SettingService } from './model/SettingService';
import { SettingValue } from '../enums/SettingValue';
import { SettingCreateRequest } from '../requests/model/SettingCreateRequest';
import { IdentityCreateRequest } from '../requests/model/IdentityCreateRequest';
import { IdentityService } from './model/IdentityService';

export class DefaultProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async seedDefaultProfile(): Promise<Profile> {

        const defaultProfileSettings: resources.Setting[] = await this.settingService.findAllByKey(SettingValue.DEFAULT_PROFILE_ID)
            .then(value => value.toJSON());
        const defaultProfileSetting = defaultProfileSettings[0];

        // not set yet
        if (_.isEmpty(defaultProfileSetting)) {

            // if some profile exists, set that one as the default
            let profile: resources.Profile;
            const profiles = await this.profileService.findAll().then(value => value.toJSON());
            if (profiles.length > 0) {
                profile = profiles[0];
            } else {

                // we are starting the mp for the first time
                // create default Profile
                const address = await this.profileService.getNewAddress();
                profile = await this.profileService.create({
                    name: 'DEFAULT',
                    address
                } as ProfileCreateRequest)
                    .then(value => value.toJSON());

                // create Wallet for default Profile
                const walletInfo: RpcWalletInfo = await this.coreRpcService.getWalletInfo();
                this.log.debug('walletInfo: ', JSON.stringify(walletInfo, null, 2));
                const identity: resources.Identity = await this.identityService.create({
                    profile_id: profile.id,
                    wallet: walletInfo.walletname
                } as IdentityCreateRequest)
                    .then(value => value.toJSON());

                // create the default identity Setting for Profile
                await this.settingService.create({
                    profile_id: profile.id,
                    key: SettingValue.DEFAULT_IDENTITY.toString(),
                    value: '' + identity.id
                } as SettingCreateRequest);
            }

            // create the default profile setting
            await this.settingService.create({
                profile_id: profile.id,
                key: SettingValue.DEFAULT_PROFILE_ID.toString(),
                value: '' + profile.id
            } as SettingCreateRequest);

            return await this.profileService.findOne(profile.id, true);
        } else {
            return await this.profileService.findOne(+defaultProfileSetting.value, true);
        }
    }

}
