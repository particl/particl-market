// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as interfaces from '../../types/interfaces';
import { inject, named } from 'inversify';
import { Core, Targets, Types } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { DefaultItemCategoryService } from '../services/DefaultItemCategoryService';
import { DefaultProfileService } from '../services/DefaultProfileService';
import { DefaultMarketService } from '../services/DefaultMarketService';
import { EventEmitter } from '../../core/api/events';
import { WaitingMessageProcessor } from '../messageprocessors/WaitingMessageProcessor';
import { CoreRpcService } from '../services/CoreRpcService';
import { ExpiredListingItemProcessor } from '../messageprocessors/ExpiredListingItemProcessor';
import { CoreMessageProcessor } from '../messageprocessors/CoreMessageProcessor';
import { ProposalResultProcessor } from '../messageprocessors/ProposalResultProcessor';
import { DefaultSettingService } from '../services/DefaultSettingService';
import { SettingValue } from '../enums/SettingValue';
import { SettingService } from '../services/model/SettingService';
import { CoreCookieService, CoreCookieServiceStatus } from '../services/observer/CoreCookieService';
import { SmsgService } from '../services/SmsgService';
import { CoreConnectionStatusService, CoreConnectionStatusServiceStatus } from '../services/observer/CoreConnectionStatusService';
import pForever from 'pm-forever';
import delay from 'pm-delay';
import { IdentityType } from '../enums/IdentityType';
import { MarketService } from '../services/model/MarketService';
import { MessageException } from '../exceptions/MessageException';
import { ProfileService } from '../services/model/ProfileService';

export class ServerStartedListener implements interfaces.Listener {

    public static Event = Symbol('ServerStartedListenerEvent');

    public log: LoggerType;

    public updated = 0;
    public isStarted = false;
    private previousState = false;

    private timeout: any;

    private INTERVAL = 1000;
    private STOP = false;
    private BOOTSTRAPPING = false;

    // tslint:disable:max-line-length
    constructor(
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.WaitingMessageProcessor) public waitingMessageProcessor: WaitingMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.CoreMessageProcessor) public coreMessageProcessor: CoreMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.ExpiredListingItemProcessor) public expiredListingItemProcessor: ExpiredListingItemProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.ProposalResultProcessor) public proposalResultProcessor: ProposalResultProcessor,
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) public defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.DefaultSettingService) public defaultSettingService: DefaultSettingService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.observer.CoreCookieService) public coreCookieService: CoreCookieService,
        @inject(Types.Service) @named(Targets.Service.observer.CoreConnectionStatusService) public coreConnectionStatusService: CoreConnectionStatusService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length

    /**
     *
     * @param payload
     * @returns {Promise<void>}
     */
    public async act(payload: any): Promise<any> {
        this.log.info('Received event ServerStartedListenerEvent', payload);
        this.start();
    }

    public async start(): Promise<void> {
        this.log.debug('start(): ');

        await pForever(async (i) => {
            i++;

            this.log.debug('this.coreCookieService.status: ' + this.coreCookieService.status);
            this.log.debug('this.coreConnectionStatusService.status: ' + this.coreConnectionStatusService.status);
            this.log.debug('this.BOOTSTRAPPING: ' + this.BOOTSTRAPPING);

            // keep checking whether we are connected to the core and when we are, call this.bootstrap()
            // then STOP the polling if bootstrap was successful
            if (this.coreConnectionStatusService.status === CoreConnectionStatusServiceStatus.CONNECTED
                && this.BOOTSTRAPPING) {
                this.BOOTSTRAPPING = true;
                this.STOP = await this.bootstrap()
                    .catch(reason => {
                        this.log.error('ERROR: marketplace bootstrap failed: ', reason);
                        return false;
                    });
                this.BOOTSTRAPPING = false;
            }

            this.updated = Date.now();
            if (this.STOP) {
                return pForever.end;
            }
            await delay(this.INTERVAL);
            this.log.error('ServerStartedListener: ', i);

            return i;
        }, 0).catch(async reason => {
            this.log.error('ERROR: ', reason);
            await delay(this.INTERVAL);
            this.start();
        });
    }
/*
    // DEPRECATED
    public pollForConnection(): void {
        this.timeout = setTimeout(
            async () => {
                this.isStarted = await this.checkConnection();
                this.pollForConnection();
            },
            this.INTERVAL
        );
    }

    // DEPRECATED
    public stop(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
*/

    /**
     *  - Default Profile, Market and Identity creation on app startup.
     *    - if updating from previous installation (a market wallet already exists),
     *      - create new Identity (+wallet) for the Profile (Identity for the Market should already exist)
     *      - rename the existing Market to "old market" or something
     *    - on new installation:
     *      - create Profile with new Identity (+wallet)
     *    - create Market with new Identity (+wallet)
     *    - set the new Market as the default one
     */
    private async bootstrap(): Promise<boolean> {
        // all is now ready for bootstrapping the app

        // todo: first load all profile and market wallets

        // are we updating from previous installation (a market wallet already exists+no profile identity)
        const isUpgradingFromSingleMarketWallet = await this.isUpdatingFromSingleMarketWallet();

        let defaultProfile: resources.Profile;

        if (isUpgradingFromSingleMarketWallet) {

            // create new Identity (+wallet) for the default Profile
            defaultProfile = await this.defaultProfileService.upgradeDefaultProfile().then(value => value.toJSON());
            this.log.debug('bootstrap(), updated old default Profile: ', defaultProfile !== undefined);

            // renames the existing default Market to oldname + " (OLD)"
            await this.defaultMarketService.upgradeDefaultMarket();

        } else { // not upgrading...
            // create Profile with new Identity (+wallet)
            defaultProfile = await this.defaultProfileService.seedDefaultProfile().then(value => value.toJSON());
        }

        // save/update the default env vars as Settings
        await this.defaultSettingService.saveDefaultSettings(defaultProfile);

        // check whether we have the required default marketplace configuration to continue
        const hasMarketConfiguration = await this.hasMarketConfiguration(defaultProfile);

        if (hasMarketConfiguration) {
            // marketplace will create the wallets it needs (each Market will have its own Identity linked to it)

            // seed the default market
            const defaultMarket: resources.Market = await this.defaultMarketService.seedDefaultMarket(defaultProfile).then(value => value.toJSON());

            // seed the default categories to default market
            await this.defaultItemCategoryService.seedDefaultCategories(defaultMarket.receiveAddress);

            // start message polling and other stuff, unless we're running integration tests
            if (process.env.NODE_ENV !== 'test') {

                // TODO: these should start automatically
                this.expiredListingItemProcessor.scheduleProcess();
                this.proposalResultProcessor.scheduleProcess();

                // poll for waiting smsgmessages to be processed
                // this.waitingMessageProcessor.schedulePoll();

                // request new messages to be pushed through zmq
                await this.smsgService.pushUnreadCoreSmsgMessages();
            }

        } else {
            throw new MessageException('Missing default Market configuration.');
        }

        return true;
    }

    private async hasMarketConfiguration(profile: resources.Profile): Promise<boolean> {

        const allSettings: resources.Setting[] = await this.settingService.findAllByProfileId(profile.id).then(value => value.toJSON());
        const foundSettings: resources.Setting[] = _.filter(allSettings, (value) => {
            return value.key === SettingValue.DEFAULT_MARKETPLACE_NAME
                || value.key === SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY
                || value.key === SettingValue.DEFAULT_MARKETPLACE_ADDRESS;
        });

        if ((!_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_NAME])
            && !_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY])
            && !_.isEmpty(process.env[SettingValue.DEFAULT_MARKETPLACE_ADDRESS]))
            || foundSettings.length === 3) {
            return true;
        }
        return false;
    }

    /**
     * are we updating from single market wallet?
     * ->   a wallet called market exists
     *      && Identity with type PROFILE belonging to default Profile doesnt exist
     */
    private async isUpdatingFromSingleMarketWallet(): Promise<boolean> {

        const hasMarketWallet = await this.coreRpcService.walletExists('market');
        const defaultProfile: resources.Profile = await this.defaultProfileService.getDefault(true).then(value => value.toJSON());

        const profileIdentity: resources.Identity | undefined = _.find(defaultProfile.Identities, identity => {
            return identity.type === IdentityType.PROFILE;
        });

        // there is old market wallet but no profile Identity -> need to update
        if (hasMarketWallet && _.isEmpty(profileIdentity)) {
            return true;
        }

        return false;
    }








    /*
        private async checkConnection(): Promise<boolean> {
            let isConnected = await this.coreRpcService.isConnected();
            let hasMarketConfiguration = false;

            if (isConnected) {

                if (this.previousState !== isConnected) {
                    this.log.info('connection with particld established.');

                    const hasWallet = await this.coreRpcService.hasWallet();
                    this.log.debug('hasWallet: ' + hasWallet);

                    if (hasWallet) {
                        this.log.info('wallet is ready.');

                        // seed the default Profile
                        const defaultProfile: resources.Profile = await this.defaultProfileService.seedDefaultProfile()
                            .then(value => value.toJSON());

                        // save the default env vars as settings
                        await this.defaultSettingService.saveDefaultProfileSettings(defaultProfile);

                        // check whether we have the required default marketplace configuration to continue
                        hasMarketConfiguration = await this.hasMarketConfiguration(defaultProfile);

                        // currently, we have the requirement for the particl-desktop user to create the market wallet manually
                        // we'll skip this nonsense if process.env.STANDALONE=true
                        if (!Environment.isTruthy(process.env.STANDALONE)) {
                            const hasRequiredMarketWallet = await this.coreRpcService.walletExists('market');
                            this.log.warn('Not running in standalone mode, wallet created: ', hasRequiredMarketWallet);
                            hasMarketConfiguration = hasRequiredMarketWallet && hasMarketConfiguration;
                            this.INTERVAL = 10000;
                        }

                        // if there's no configuration for the market, set the isConnected back to false
                        isConnected = hasMarketConfiguration;

                        if (hasMarketConfiguration) {

                            // seed the default market
                            const defaultMarket: resources.Market = await this.defaultMarketService.seedDefaultMarket(defaultProfile)
                                .then(value => value.toJSON());

                            // seed the default categories
                            await this.defaultItemCategoryService.seedDefaultCategories(defaultMarket.receiveAddress);

                            // start message polling and other stuff, unless we're running integration tests
                            if (process.env.NODE_ENV !== 'test') {
                                this.expiredListingItemProcessor.scheduleProcess();
                                this.proposalResultProcessor.scheduleProcess();

                                // poll for waiting smsgmessages to be processed
                                // this.waitingMessageProcessor.schedulePoll();

                                // request new messages to be pushed through zmq
                                await this.smsgService.pushUnreadCoreSmsgMessages();

                            }
                            this.INTERVAL = 10000;
                        } else {
                            isConnected = false;
                            this.log.error('market not initialized yet, retrying in ' + this.INTERVAL + 'ms.');
                        }

                    } else {
                        isConnected = false;
                        this.log.error('wallet not initialized yet, retrying in ' + this.INTERVAL + 'ms.');
                    }
                }

                // this.log.info('connected to particld, checking again in ' + this.INTERVAL + 'ms.');
            } else {

                if (this.previousState !== isConnected && hasMarketConfiguration) {
                    this.log.info('connection with particld disconnected.');

                    // stop message polling
                    // await this.coreCookieService.stop();
                    this.INTERVAL = 1000;
                }

                if (process.env.NODE_ENV !== 'test') {
                    this.log.error('failed to connect to particld, retrying in ' + this.INTERVAL + 'ms.');
                }
            }

            this.previousState = isConnected;

            return isConnected;
        }
    */
}
