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

                // create Identity for default Profile, using the default wallet
                const identity: resources.Identity = await this.createNewIdentityForProfile(profile).then(value => value.toJSON());
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
        await this.createNewIdentityForProfile(profile);
        return await this.getDefault();
    }

    /**
     * create an Identity for Profile:
     * - create and load a new blank wallet
     * - create a new mnemonic
     * - import master key from bip44 mnemonic root key and derive default account
     *
     * @param profile
     */
    // TODO: move to WalletService?
    public async createNewIdentityForProfile(profile: resources.Profile): Promise<Identity> {

        // create and load a new blank wallet
        const walletName = 'profiles/' + profile.name;  // ./profiles/DEFAULT, the updated wont be under it ... :(
        const wallet: RpcWallet = await this.coreRpcService.createAndLoadWallet(walletName, false, true);

        // create a new mnemonic
        const passphrase = this.createRandom();
        const mnemonic: RpcMnemonic = await this.coreRpcService.mnemonic(['new', passphrase, 'english', 32, true]);

        // import master key from bip44 mnemonic root key and derive default account
        await this.coreRpcService.extKeyGenesisImport(wallet.name, [mnemonic.mnemonic, passphrase]);

        const extKeys: RpcExtKey[] = await this.coreRpcService.extKeyList(wallet.name, true);
        const masterKey: RpcExtKey | undefined = _.find(extKeys, key => {
            return key.type === 'Loose' && key.key_type === 'Master' && key.label === 'Master Key - bip44 derived.' && key.current_master === 'true';
        });
        if (!masterKey) {
            throw new MessageException('Could not find Profile wallets Master key.');
        }
        // const keyInfo: RpcExtKeyResult = await this.coreRpcService.extKeyInfo(wallet.name, masterKey.evkey, "4444446'/0'");

        const address = await this.coreRpcService.getNewAddress(wallet.name);
        const walletInfo: RpcWalletInfo = await this.coreRpcService.getWalletInfo(walletName);

        // create Identity for Profile, using the created wallet
        return await this.identityService.create({
            profile_id: profile.id,
            wallet: wallet.name,
            address,
            hdseedid: walletInfo.hdseedid,
            path: masterKey.path,
            mnemonic: mnemonic.mnemonic,
            passphrase,
            type: IdentityType.PROFILE
        } as IdentityCreateRequest);
    }

    public async getDefault(withRelated: boolean = true): Promise<Profile> {
        return await this.profileService.getDefault(withRelated);
    }

    /**
     * todo: move to some util
     */
    private createRandom(length: number = 24, caps: boolean = true, lower: boolean = true, numbers: boolean = true, unique: boolean = true): string {
        const capsChars = caps ? [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'] : [];
        const lowerChars = lower ? [...'abcdefghijklmnopqrstuvwxyz'] : [];
        const numChars = numbers ? [...'0123456789'] : [];
        const uniqueChars = unique ? [...'~!@#$%^&*()_+-=[]{};:,.<>?'] : [];
        const selectedChars = [...capsChars, ...lowerChars, ...numChars, ...uniqueChars];

        return [...Array(length)]
            .map(i => selectedChars[Math.random() * selectedChars.length | 0])
            .join('');
    }
}
