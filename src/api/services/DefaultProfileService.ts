// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Core, Targets, Types } from '../../constants';
import { Profile } from '../models/Profile';
import { ProfileService } from './model/ProfileService';
import { CoreRpcService } from './CoreRpcService';
import { ProfileCreateRequest } from '../requests/model/ProfileCreateRequest';
import { SettingService } from './model/SettingService';
import { SettingValue } from '../enums/SettingValue';
import { IdentityCreateRequest } from '../requests/model/IdentityCreateRequest';
import { IdentityService } from './model/IdentityService';
import { RpcExtKey, RpcExtKeyResult, RpcMnemonic, RpcWallet, RpcWalletInfo } from 'omp-lib/dist/interfaces/rpc';
import { IdentityType } from '../enums/IdentityType';
import { Identity } from '../models/Identity';
import { DefaultSettingService } from './DefaultSettingService';
import { MessageException } from '../exceptions/MessageException';

export class DefaultProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.DefaultSettingService) public defaultSettingService: DefaultSettingService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * if updating from previous installation (a market wallet already exists),
     *      -> create new Identity (+wallet) for the existing Profile
     *
     * on a new installation:
     *      -> create Profile with new Identity (+wallet)
     */
    public async seedDefaultProfile(): Promise<Profile> {

        // retrieve the default Profile id, if it exists
        const defaultProfileIdSettings: resources.Setting[] = await this.settingService.findAllByKey(SettingValue.DEFAULT_PROFILE_ID)
            .then(value => value.toJSON());
        const defaultProfileIdSetting = defaultProfileIdSettings[0];

        // should be undefined if default profile is not set yet
        if (_.isEmpty(defaultProfileIdSetting)) {

            // if a Profile for some reason already exists, use that one as the default
            // else create a new Profile
            let profile: resources.Profile;
            const profiles = await this.profileService.findAll().then(value => value.toJSON());
            if (profiles.length > 0) {
                profile = profiles[0];
            } else {
                // we are starting the mp for the first time and there's no Profile

                // create default Profile
                profile = await this.profileService.create({
                    name: 'DEFAULT'
                } as ProfileCreateRequest).then(value => value.toJSON());

                // create Identity for default Profile
                const identity: resources.Identity = await this.identityService.createProfileIdentity(profile).then(value => value.toJSON());
            }

            // create or update the default profile Setting
            await this.defaultSettingService.insertOrUpdateDefaultProfileSetting(profile.id);

            return await this.profileService.findOne(profile.id, true);
        } else {
            return await this.profileService.findOne(+defaultProfileIdSetting.value, true);
        }
    }

    /**
     * update old Profile by adding an Identity to it
     *
     * - create new wallet
     * - create new Identity using that wallet, linked to the Profile, IndentityType.PROFILE
     *
     */
    public async upgradeDefaultProfile(): Promise<Profile> {
        const profile: resources.Profile = await this.getDefault().then(value => value.toJSON());
        await this.identityService.createProfileIdentity(profile);
        return await this.getDefault();
    }


    public async getDefault(withRelated: boolean = true): Promise<Profile> {
        return await this.profileService.getDefault(withRelated);
    }


}
