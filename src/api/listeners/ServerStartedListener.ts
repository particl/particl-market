// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as interfaces from '../../types/interfaces';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { DefaultItemCategoryService } from '../services/DefaultItemCategoryService';
import { DefaultProfileService } from '../services/DefaultProfileService';
import { DefaultMarketService } from '../services/DefaultMarketService';
import { EventEmitter } from '../../core/api/events';
import { MessageProcessor } from '../messageprocessors/MessageProcessor';
import { CoreRpcService } from '../services/CoreRpcService';
import { ExpiredListingItemProcessor } from '../messageprocessors/ExpiredListingItemProcessor';
import { CoreMessageProcessor } from '../messageprocessors/CoreMessageProcessor';
import { ProposalResultProcessor } from '../messageprocessors/ProposalResultProcessor';
import { DefaultSettingService } from '../services/DefaultSettingService';
import { SettingValue } from '../enums/SettingValue';
import { SettingService } from '../services/model/SettingService';
import { CoreCookieService } from '../services/CoreCookieService';
import { Environment } from '../../core/helpers/Environment';
import { SmsgService } from '../services/SmsgService';

export class ServerStartedListener implements interfaces.Listener {

    public static Event = Symbol('ServerStartedListenerEvent');

    public log: LoggerType;
    public isStarted = false;
    private previousState = false;

    private timeout: any;
    private interval = 1000;

    // tslint:disable:max-line-length
    constructor(
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.MessageProcessor) public messageProcessor: MessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.CoreMessageProcessor) public coreMessageProcessor: CoreMessageProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.ExpiredListingItemProcessor) public expiredListingItemProcessor: ExpiredListingItemProcessor,
        @inject(Types.MessageProcessor) @named(Targets.MessageProcessor.ProposalResultProcessor) public proposalResultProcessor: ProposalResultProcessor,
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) public defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.DefaultSettingService) public defaultSettingService: DefaultSettingService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.CoreCookieService) public coreCookieService: CoreCookieService,
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
        await this.coreCookieService.scheduleCookieLoop();
        this.log.debug('this.coreCookieService.scheduleCookieLoop() DONE');
        this.pollForConnection();
    }

    public pollForConnection(): void {
        this.timeout = setTimeout(
            async () => {
                this.isStarted = await this.checkConnection();
                this.pollForConnection();
            },
            this.interval
        );
    }

    public stop(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

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
                        this.interval = 10000;
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

                            // fetch all unread messages
                            // this.coreMessageProcessor.schedulePoll();        // smsg's are pushed through zmq

                            // poll for new messages to be processed
                            // this.messageProcessor.schedulePoll();

                            // request new messages to be pushed through zmq
                            await this.smsgService.pushUnreadCoreSmsgMessages();

                        }
                        this.interval = 10000;
                    } else {
                        isConnected = false;
                        this.log.error('market not initialized yet, retrying in ' + this.interval + 'ms.');
                    }

                } else {
                    isConnected = false;
                    this.log.error('wallet not initialized yet, retrying in ' + this.interval + 'ms.');
                }
            }

            // this.log.info('connected to particld, checking again in ' + this.interval + 'ms.');
        } else {

            if (this.previousState !== isConnected && hasMarketConfiguration) {
                this.log.info('connection with particld disconnected.');

                // stop message polling
                this.messageProcessor.stop();
                this.interval = 1000;
            }

            if (process.env.NODE_ENV !== 'test') {
                this.log.error('failed to connect to particld, retrying in ' + this.interval + 'ms.');
            }
        }

        this.previousState = isConnected;

        return isConnected;
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
}
