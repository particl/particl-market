// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MarketService } from './model/MarketService';
import { MarketCreateRequest } from '../requests/model/MarketCreateRequest';
import { MarketUpdateRequest } from '../requests/model/MarketUpdateRequest';
import { CoreRpcService } from './CoreRpcService';
import { SmsgService } from './SmsgService';
import { InternalServerException } from '../exceptions/InternalServerException';
import { MarketType } from '../enums/MarketType';
import { ProfileService } from './model/ProfileService';
import { SettingService } from './model/SettingService';
import { IdentityService } from './model/IdentityService';
import { MessageException } from '../exceptions/MessageException';
import { SettingValue } from '../enums/SettingValue';
import { DefaultSettingService } from './DefaultSettingService';

export class DefaultMarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.DefaultSettingService) public defaultSettingService: DefaultSettingService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * "upgrade" the old Market by renaming it
     *
     */
    public async upgradeDefaultMarket(): Promise<resources.Market> {
        const profile: resources.Profile = await this.profileService.getDefault().then(value => value.toJSON());

        // cant use this.defaultMarketService.getDefaultForProfile() because its using SettingValue.DEFAULT_MARKETPLACE_ID, which is not yet in use
        const oldDefaultMarket: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(
            profile.id, process.env[SettingValue.APP_DEFAULT_MARKETPLACE_ADDRESS])
            .then(value => value.toJSON());

        return await this.marketService.update(oldDefaultMarket.id, {
            name: oldDefaultMarket.name + ' (OLD)',
            type: oldDefaultMarket.type,
            receiveKey: oldDefaultMarket.receiveKey,
            receiveAddress: oldDefaultMarket.receiveAddress,
            publishKey: oldDefaultMarket.publishKey,
            publishAddress: oldDefaultMarket.publishAddress
        } as MarketUpdateRequest).then(value => value.toJSON());
    }

    /**
     * create the default Market for the default Profile
     *
     * - get default Market for default Profile (SettingValue.DEFAULT_MARKETPLACE_ID)
     * - if one doesnt exist
     *      - create market wallet
     *      - create market Identity
     *      - create Market
     *      - import keys
     *      - update SettingValue.DEFAULT_MARKETPLACE_ID
     *      - return Market
     * - else
     *      - return Market
     *
     * @param profile
     */
    public async seedDefaultMarketForProfile(profile: resources.Profile): Promise<resources.Market> {

        // check whether the default Market for the Profile exists, throws if not found
        // if we're upgrading, the old market is not set as default, so it wont be found
        const defaultMarket: resources.Market = await this.marketService.getDefaultForProfile(profile.id)
            .then(value => value.toJSON())
            .catch(async reason => {

                this.log.debug('seedDefaultMarketForProfile(), ...catching that and setting it');
                // if theres no default Market yet, create it and set it as default
                // first create the Market Identity
                const marketName = 'particl-market';
                const marketIdentity: resources.Identity = await this.identityService.createMarketIdentityForProfile(profile, marketName)
                    .then(value => value.toJSON());
                this.log.debug('seedDefaultMarketForProfile(), marketIdentity: ', JSON.stringify(marketIdentity, null, 2));

                // then create the Market
                const newMarket = await this.createDefaultMarket(profile, marketIdentity);

                // then set the Market as default for the Profile
                await this.defaultSettingService.insertOrUpdateProfilesDefaultMarketSetting(profile.id, newMarket.id);
                return newMarket;
            });

        return await this.marketService.findOne(defaultMarket.id, true).then(value => value.toJSON());
    }

    public async importMarketPrivateKey(wallet: string, privateKey: string, address: string): Promise<void> {
        if (await this.smsgService.smsgImportPrivKey(wallet, privateKey)) {
            // get market public key
            const publicKey = await this.getPublicKeyForAddress(address);
            // add market address
            if (publicKey) {
                await this.importMarketPublicKey(wallet, publicKey, address);
            } else {
                throw new InternalServerException('Error while adding public key to db.');
            }
        } else {
            this.log.error('Error while importing market private key to db.');
            // todo: throw exception, and do not allow market to run before its properly set up
        }

        this.log.debug('importMarketPrivateKey(), private key imported: ', privateKey);
    }

    public async importMarketPublicKey(wallet: string, publicKey: string, address: string): Promise<void> {
        if (publicKey) {
            await this.smsgService.smsgAddAddress(address, publicKey);
        } else {
            throw new InternalServerException('Error while adding public key to db.');
        }
    }

    /**
     * create a Market
     *
     * @param profile
     * @param marketIdentity
     */
    private async createDefaultMarket(profile: resources.Profile, marketIdentity: resources.Identity): Promise<resources.Market> {

        // get the default Market settings
        const profileSettings: resources.Setting[] = await this.settingService.findAll().then(value => value.toJSON());
        const marketNameSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.APP_DEFAULT_MARKETPLACE_NAME;
        });
        const marketPKSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.APP_DEFAULT_MARKETPLACE_PRIVATE_KEY;
        });
        const marketAddressSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.APP_DEFAULT_MARKETPLACE_ADDRESS;
        });
        if (marketNameSetting === undefined || marketPKSetting === undefined || marketAddressSetting === undefined) {
            throw new MessageException('Default Market settings not found!');
        }

        // then create the market
        const newMarket: resources.Market = await this.marketService.create({
            identity_id: marketIdentity.id,
            profile_id: profile.id,
            name: marketNameSetting.value,
            type: MarketType.MARKETPLACE,
            receiveKey: marketPKSetting.value,
            receiveAddress: marketAddressSetting.value,
            publishKey: marketPKSetting.value,
            publishAddress: marketAddressSetting.value
        } as MarketCreateRequest).then(value => value.toJSON());

        this.log.debug('createMarket(), newMarket: ', JSON.stringify(newMarket, null, 2));

        // load the wallet unless already loaded
        await this.coreRpcService.walletLoaded(newMarket.Identity.wallet)
            .then(async isLoaded => {
                if (!isLoaded) {
                    await this.coreRpcService.loadWallet(newMarket.Identity.wallet)
                        .catch(reason => {
                            this.log.debug('wallet: ' + newMarket.Identity.wallet + ' already loaded.');
                        });
                }
            });

        // type === MARKETPLACE -> receive + publish keys are the same
        // type === STOREFRONT -> receive key is private key, publish key is public key
        //                        when adding a storefront, both keys should be given
        // type === STOREFRONT_ADMIN -> receive + publish keys are different

        // load the market keys, first import the receive key
        await this.importMarketPrivateKey(newMarket.Identity.wallet, newMarket.receiveKey, newMarket.receiveAddress);

        // if publish key exists and is different from receive key (STOREFRONT)
        if (newMarket.publishKey && newMarket.publishAddress && (newMarket.receiveKey !== newMarket.publishKey)) {
            if (MarketType.STOREFRONT === newMarket.type) {
                await this.importMarketPublicKey(newMarket.Identity.wallet, newMarket.publishKey, newMarket.publishAddress);
            } else {
                await this.importMarketPrivateKey(newMarket.Identity.wallet, newMarket.publishKey, newMarket.publishAddress);
            }
        }

        // set smsg to use the default wallet. this is pretty unnecessary, should be set for each smsgsend call
        await this.coreRpcService.smsgSetWallet(newMarket.Identity.wallet);
        this.log.info('createMarket(), CREATE MARKET DONE... ');

        return await this.marketService.findOne(newMarket.id).then(value => value.toJSON());
    }

    private async getPublicKeyForAddress(address: string): Promise<string|null> {
        return await this.smsgService.smsgLocalKeys()
            .then(localKeys => {
                for (const smsgKey of localKeys.smsg_keys) {
                    if (smsgKey.address === address) {
                        return smsgKey.public_key;
                    }
                }
                return null;
            })
            .catch(error => null);
    }


}
