// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketService } from '../../services/model/MarketService';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ProfileService } from '../../services/model/ProfileService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { DefaultMarketService } from '../../services/DefaultMarketService';
import { SettingService } from '../../services/model/SettingService';
import { SettingUpdateRequest } from '../../requests/model/SettingUpdateRequest';
import { SettingValue } from '../../enums/SettingValue';
import { CoreRpcService } from '../../services/CoreRpcService';
import { SettingCreateRequest } from '../../requests/model/SettingCreateRequest';

export class MarketSetDefaultCommand extends BaseCommand implements RpcCommandInterface<Market> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) private defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.MARKET_SETDEFAULT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: market: resources.Market
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Market>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Market> {
        const profile: resources.Profile = data.params[0];
        const market: resources.Market = data.params[1];

        await this.createOrUpdateSetting(SettingValue.DEFAULT_MARKETPLACE_NAME, market.name, profile);
        await this.createOrUpdateSetting(SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY, market.receiveKey, profile);
        await this.createOrUpdateSetting(SettingValue.DEFAULT_MARKETPLACE_ADDRESS, market.receiveAddress, profile);

        // load the wallet unless already loaded
        await this.coreRpcService.walletLoaded(market.Identity.wallet).
        then(async isLoaded => {
            if (!isLoaded) {
                await this.coreRpcService.loadWallet(market.Identity.wallet)
                    .catch(reason => {
                        this.log.debug('wallet: ' + market.name + ' already loaded.');
                    });
            }
        });

        // import the pk's
        await this.defaultMarketService.importMarketPrivateKey(market.Identity.wallet, market.receiveKey, market.receiveAddress);
        if (market.publishKey && market.publishAddress && (market.receiveKey !== market.publishKey)) {
            await this.defaultMarketService.importMarketPrivateKey(market.Identity.wallet, market.publishKey, market.publishAddress);
        }

        // set secure messaging to use the default wallet
        await this.coreRpcService.smsgSetWallet(market.Identity.wallet);

        return await this.marketService.getDefaultForProfile(profile.id);
    }


    public async createOrUpdateSetting(key: string, newValue: string, profile: resources.Profile): Promise<resources.Setting | undefined> {


        // if set already, update, if not set, create,
        const foundSettings: resources.Setting[] = await this.settingService.findAllByKeyAndProfileId(key, profile.id)
            .then(value => value.toJSON());

        this.log.debug('foundSettings: ', JSON.stringify(foundSettings, null, 2));

        if (!_.isEmpty(foundSettings)) {
            const foundSettingWithTheKey = foundSettings[0];
            const settingRequest = {
                key,
                value: newValue
            } as SettingUpdateRequest;

            return await this.settingService.update(foundSettingWithTheKey.id, settingRequest).then(value => value.toJSON());
        } else {
            const settingRequest = {
                profile_id: profile.id,
                key,
                value: newValue
            } as SettingCreateRequest;

            return await this.settingService.create(settingRequest).then(value => value.toJSON());
        }

    }


    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: marketId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('marketId');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (data.params[1] && typeof data.params[1] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        // make sure Profile with the id exists
        data.params[0] = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        // make sure Market with the id exists
        data.params[1] = await this.marketService.findOne(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <marketId>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - Number - The ID of the Profile. \n'
            + '    <marketId>               - Number - The ID of the Market. \n';
    }

    public description(): string {
        return 'Set the default Market for Profile.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' 1 1';
    }
}
