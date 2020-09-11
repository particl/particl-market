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
import { MarketType } from '../enums/MarketType';
import { ProfileService } from './model/ProfileService';
import { SettingService } from './model/SettingService';
import { IdentityService } from './model/IdentityService';
import { MessageException } from '../exceptions/MessageException';
import { SettingValue } from '../enums/SettingValue';
import { DefaultSettingService } from './DefaultSettingService';
import { Market } from '../models/Market';
import { MarketFactory } from '../factories/model/MarketFactory';
import { MarketCreateParams } from '../factories/model/ModelCreateParams';
import { MarketAddMessage } from '../messages/action/MarketAddMessage';
import { ContentReference, DSN, ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageProcessing } from '../../core/helpers/ImageProcessing';


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
        @inject(Types.Factory) @named(Targets.Factory.model.MarketFactory) public marketFactory: MarketFactory,
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
        // const oldDefaultMarket: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(
        //    profile.id, process.env[SettingValue.APP_DEFAULT_MARKETPLACE_ADDRESS])
        //    .then(value => value.toJSON());

        // there is only one market if we're upgrading
        const oldDefaultMarket: resources.Market = await this.marketService.findAllByProfileId(profile.id).then(values => {
            const markets: resources.Market[] = values.toJSON();
            return markets[0];
        });

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
     * get the default Market for Profile, if it exists
     *
     * @param profileId
     * @param shouldCreateIfNotSet
     * @param withRelated
     */
    public async getDefaultForProfile(profileId: number, shouldCreateIfNotSet: boolean = true, withRelated: boolean = true): Promise<Market> {
        this.log.debug('getDefaultForProfile(): ', profileId);
        const profileSettings: resources.Setting[] = await this.settingService.findAllByProfileId(profileId).then(value => value.toJSON());
        const marketIdSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.PROFILE_DEFAULT_MARKETPLACE_ID;
        });

        if (_.isEmpty(marketIdSetting) && shouldCreateIfNotSet) {
            this.log.warn(new MessageException(SettingValue.PROFILE_DEFAULT_MARKETPLACE_ID + ' not set.').getMessage());
            // Profile has no default Market, so create it
            const profile: resources.Profile = await this.profileService.findOne(profileId).then(value => value.toJSON());
            const market: resources.Market = await this.seedDefaultMarketForProfile(profile);
            return await this.marketService.findOne(market.id, withRelated);

        } else if (_.isEmpty(marketIdSetting) && !shouldCreateIfNotSet) {
            this.log.error(new MessageException(SettingValue.PROFILE_DEFAULT_MARKETPLACE_ID + ' not set.').getMessage());
            throw new MessageException(SettingValue.PROFILE_DEFAULT_MARKETPLACE_ID + ' not set.');

        } else {
            return await this.marketService.findOne(parseInt(marketIdSetting!.value, 10), withRelated);
        }
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

        // this.log.debug('seedDefaultMarketForProfile(), profile: ', JSON.stringify(profile, null, 2));
        this.log.debug('seedDefaultMarketForProfile(), profile: ', profile.name);

        // check whether the default Market for the Profile exists, throws if not found
        // if we're upgrading, the old market is not set as default, so it wont be found
        const defaultMarket: resources.Market = await this.getDefaultForProfile(profile.id, false)
            .catch(async reason => {

                this.log.debug('seedDefaultMarketForProfile(), ...catching that and setting it');
                // if theres no default Market yet, create it and set it as default
                // first create the Market Identity
                const marketName = 'particl-market';
                const marketIdentity: resources.Identity = await this.identityService.createMarketIdentityForProfile(profile, marketName)
                    .then(value => value.toJSON());

                // this.log.debug('seedDefaultMarketForProfile(), marketIdentity: ', JSON.stringify(marketIdentity, null, 2));

                // then create the Market
                const newMarket = await this.createDefaultMarket(marketIdentity);

                // then set the Market as default for the Profile
                await this.defaultSettingService.insertOrUpdateProfilesDefaultMarketSetting(profile.id, newMarket.id);

                return await this.marketService.findOne(newMarket.id);
            })
            .then(value => value.toJSON());

        // this.log.debug('seedDefaultMarketForProfile(), defaultMarket: ', JSON.stringify(defaultMarket, null, 2));

        return await this.marketService.findOne(defaultMarket.id, true).then(value => value.toJSON());
    }



    /**
     * create a default Market for Identity
     *
     * @param defaultMarketIdentity
     */
    private async createDefaultMarket(defaultMarketIdentity: resources.Identity): Promise<resources.Market> {

        // get the default Market settings
        const profileSettings: resources.Setting[] = await this.settingService.findAll().then(value => value.toJSON());
        const marketNameSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.APP_DEFAULT_MARKETPLACE_NAME;
        });
        const marketPKSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.APP_DEFAULT_MARKETPLACE_PRIVATE_KEY;
        });

        if (marketNameSetting === undefined || marketPKSetting === undefined) {
            throw new MessageException('Default Market settings not found!');
        }

        // todo: factory
        const createRequest: MarketCreateRequest = await this.marketFactory.get({
            actionMessage: {
                name: marketNameSetting.value,
                description: 'Particl Market',
                marketType: MarketType.MARKETPLACE,
                receiveKey: marketPKSetting.value,
                publishKey: marketPKSetting.value,
                image: {
                    data: [{
                        protocol: ProtocolDSN.REQUEST,  // using REQUEST to generate hash
                        encoding: 'BASE64',
                        data: ImageProcessing.particlLogo
                    }] as DSN[],
                    featured: false
                } as ContentReference,
                generated: Date.now()
            } as MarketAddMessage,
            identity: defaultMarketIdentity,
            skipJoin: false
        } as MarketCreateParams);

        const newMarket: resources.Market = await this.marketService.create(createRequest).then(value => value.toJSON());
        await this.marketService.joinMarket(newMarket);

        this.log.info('createMarket(), created: ' + newMarket.name + ', for: ' + defaultMarketIdentity.Profile.name);

        return await this.marketService.findOne(newMarket.id).then(value => value.toJSON());
    }

}
