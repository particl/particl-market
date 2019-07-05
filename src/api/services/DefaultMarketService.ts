// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Market } from '../models/Market';
import { MarketService } from './model/MarketService';
import { MarketCreateRequest } from '../requests/model/MarketCreateRequest';
import { MarketUpdateRequest } from '../requests/model/MarketUpdateRequest';
import { CoreRpcService } from './CoreRpcService';
import { SmsgService } from './SmsgService';
import { InternalServerException } from '../exceptions/InternalServerException';
import { MarketType } from '../enums/MarketType';
import { ProfileService } from './model/ProfileService';

export class DefaultMarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    // TODO: if something goes wrong here and default profile does not get created, the application should stop

    public async seedDefaultMarket(): Promise<void> {

        const MARKETPLACE_NAME          = process.env.DEFAULT_MARKETPLACE_NAME
                                            ? process.env.DEFAULT_MARKETPLACE_NAME
                                            : 'DEFAULT';
        const MARKETPLACE_PRIVATE_KEY   = process.env.DEFAULT_MARKETPLACE_PRIVATE_KEY
                                            ? process.env.DEFAULT_MARKETPLACE_PRIVATE_KEY
                                            : '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek';
        const MARKETPLACE_ADDRESS       = process.env.DEFAULT_MARKETPLACE_ADDRESS
                                            ? process.env.DEFAULT_MARKETPLACE_ADDRESS
                                            : 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA';

        const profile: resources.Profile = await this.profileService.getDefault().then(value => value.toJSON());

        const defaultMarket = {
            profile_id: profile.id,
            name: MARKETPLACE_NAME,
            type: MarketType.MARKETPLACE,
            receiveKey: MARKETPLACE_PRIVATE_KEY,
            receiveAddress: MARKETPLACE_ADDRESS,
            publishKey: MARKETPLACE_PRIVATE_KEY,
            publishAddress: MARKETPLACE_ADDRESS,
            wallet: 'market.dat'
        } as MarketCreateRequest;

        await this.insertOrUpdateMarket(defaultMarket, profile);
        return;
    }

    public async insertOrUpdateMarket(market: MarketCreateRequest, profile: resources.Profile): Promise<Market> {
        const newMarketModel = await this.marketService.findOneByProfileIdAndReceiveAddress(profile.id, market.receiveAddress)
            .then(async (found) => {
                this.log.debug('FOUND!');
                return await this.marketService.update(found.Id, market as MarketUpdateRequest);
            })
            .catch(async (reason) => {
                this.log.debug('NOT FOUND!');
                return await this.marketService.create(market);
            });
        const newMarket: resources.Market = newMarketModel.toJSON();
        this.log.debug('default Market: ', JSON.stringify(newMarket, null, 2));

        await this.importMarketPrivateKey(newMarket.receiveKey, newMarket.receiveAddress);
        if (newMarket.publishKey && newMarket.publishAddress) {
            await this.importMarketPrivateKey(newMarket.publishKey, newMarket.publishAddress);
        }

        return newMarketModel;
    }

    private async importMarketPrivateKey(privateKey: string, address: string): Promise<void> {
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
