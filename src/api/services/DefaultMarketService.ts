// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Market } from '../models/Market';
import { MarketService } from './model/MarketService';
import { MarketCreateRequest } from '../requests/model/MarketCreateRequest';
import { MarketUpdateRequest } from '../requests/model/MarketUpdateRequest';
import { CoreRpcService, RpcExtKeyGenesisImport, RpcMnemonic } from './CoreRpcService';
import { SmsgService } from './SmsgService';
import { InternalServerException } from '../exceptions/InternalServerException';
import { MarketType } from '../enums/MarketType';
import { ProfileService } from './model/ProfileService';
import { SettingService } from './model/SettingService';
import { SettingValue } from '../enums/SettingValue';
import { MessageException } from '../exceptions/MessageException';
import { IdentityCreateRequest } from '../requests/model/IdentityCreateRequest';
import { IdentityService } from './model/IdentityService';

export class DefaultMarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    // TODO: if something goes wrong here and default profile does not get created, the application should stop

    public async seedDefaultMarket(profile: resources.Profile): Promise<Market> {

        const profileSettings: resources.Setting[] = await this.settingService.findAllByProfileId(profile.id).then(value => value.toJSON());

        const marketNameSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.DEFAULT_MARKETPLACE_NAME;
        });

        const marketPKSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY;
        });

        const marketAddressSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.DEFAULT_MARKETPLACE_ADDRESS;
        });

        if (marketNameSetting === undefined || marketPKSetting === undefined || marketAddressSetting === undefined) {
            throw new MessageException('Default Market settings not found!');
        }

        // The initial default marketplace should use whatever wallet is set as the default wallet currently.
        // @TODO (zaSmilingIdiot - 2019-07-26):
        //      Is the wallet creation appropriate here? DefaultMarketService.seedDefaultMarket() is only called from
        //          ServerStartedListener currently, and only after a check to determine whether the wallet exists and is initialized..
        //          Makes sense then that this code wouldn't be executed if the wallet is supposed to already exist.
        //          Unless its correct to start the service against another wallet, and then always create a particular wallet afterwards.
        //
        //      Either way, the default wallet on first load should have already been set by the time we get to this point..
        //          services have already fallen over if its not set. So kindof pointless. Either way, whether this is set, this probably
        //          needs to be set it to the requested default wallet, not a hard-coded value.
        //
        //      I'd imagine the call to walletService.create() would be included in ServerStartedListener.checkConnection() if the wallet is not initialized

        const currentWallet = this.coreRpcService.currentWallet;
        const defaultMarketWallet: resources.Identity = await this.identityService.findOneByWalletName(currentWallet)
            .then(value => value.toJSON())
            .catch(async reason => {
                return await this.identityService.create({
                    profile_id: profile.id,
                    wallet: currentWallet
                } as IdentityCreateRequest).then(value => value.toJSON());
            });

        const defaultMarket = {
            wallet_id: defaultMarketWallet.id,
            profile_id: profile.id,
            name: marketNameSetting.value,
            type: MarketType.MARKETPLACE,
            receiveKey: marketPKSetting.value,
            receiveAddress: marketAddressSetting.value,
            publishKey: marketPKSetting.value,
            publishAddress: marketAddressSetting.value
        } as MarketCreateRequest;

        const market = await this.insertOrUpdateMarket(defaultMarket, profile);
        this.log.debug('seedDefaultMarket(), market: ', JSON.stringify(market.toJSON(), null, 2));
        return market;
    }

    public async insertOrUpdateMarket(marketRequest: MarketCreateRequest, profile: resources.Profile): Promise<Market> {

        // create or update the default marketplace
        const newMarket: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(profile.id, marketRequest.receiveAddress)
            .then(async (found) => {
                this.log.debug('found market, update... ');
                return await this.marketService.update(found.Id, marketRequest as MarketUpdateRequest).then(value => value.toJSON());
            })
            .catch(async (reason) => {
                this.log.debug('did NOT find market, create... ');
                return await this.marketService.create(marketRequest).then(value => value.toJSON());
            });

        // if wallet with the name doesnt exists, then create one
        const exists = await this.coreRpcService.walletExists(newMarket.Identity.wallet);
        this.log.debug('wallet exists: ', exists);

        if (!exists) {
            await this.coreRpcService.createAndLoadWallet(newMarket.Identity.wallet)
                .then(async result => {
                    this.log.debug('created wallet: ', result.name);
                    const mnemonic: RpcMnemonic = await this.coreRpcService.mnemonic(['new']);
                    this.log.debug('mnemonic: ', JSON.stringify(mnemonic, null, 2));
                    const extkey: RpcExtKeyGenesisImport = await this.coreRpcService.extKeyGenesisImport([mnemonic.mnemonic]);
                    this.log.debug('extkey: ', JSON.stringify(extkey, null, 2));
                    // todo: store the data
                })
                .catch(reason => {
                    this.log.debug('wallet: ' + marketRequest.name + ' already exists.');
                });
        } else {
            // load the wallet unless already loaded
            await this.coreRpcService.walletLoaded(newMarket.Identity.wallet)
                .then(async isLoaded => {
                    if (!isLoaded) {
                        await this.coreRpcService.loadWallet(newMarket.Identity.wallet)
                            .catch(reason => {
                                this.log.debug('wallet: ' + marketRequest.name + ' already loaded.');
                            });
                    }
                });
        }
        await this.coreRpcService.setActiveWallet(newMarket.Identity.wallet);

        await this.importMarketPrivateKey(newMarket.receiveKey, newMarket.receiveAddress);
        if (newMarket.publishKey && newMarket.publishAddress && (newMarket.receiveKey !== newMarket.publishKey)) {
            await this.importMarketPrivateKey(newMarket.publishKey, newMarket.publishAddress);
        }

        // set secure messaging to use the default wallet
        await this.coreRpcService.smsgSetWallet(newMarket.Identity.wallet);

        return await this.marketService.findOne(newMarket.id);
    }

    public async importMarketPrivateKey(privateKey: string, address: string): Promise<void> {
        if ( await this.smsgService.smsgImportPrivKey(privateKey) ) {
            // get market public key
            const publicKey = await this.getPublicKeyForAddress(address);
            this.log.debug('default Market publicKey: ', publicKey);
            // add market address
            if (publicKey) {
                await this.smsgService.smsgAddAddress(address, publicKey);
            } else {
                throw new InternalServerException('Error while adding public key to db.');
            }
        } else {
            this.log.error('Error while importing market private key to db.');
            // todo: throw exception, and do not allow market to run before its properly set up
        }
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
