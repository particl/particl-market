// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../../constants';
import { Logger as LoggerType } from '../../../core/Logger';
import { DefaultItemCategoryService } from '../DefaultItemCategoryService';
import { DefaultProfileService } from '../DefaultProfileService';
import { DefaultMarketService } from '../DefaultMarketService';
import { EventEmitter } from '../../../core/api/events';
import { WaitingMessageProcessor } from '../../messageprocessors/WaitingMessageProcessor';
import { CoreRpcService } from '../CoreRpcService';
import { ExpiredListingItemProcessor } from '../../messageprocessors/ExpiredListingItemProcessor';
import { CoreMessageProcessor } from '../../messageprocessors/CoreMessageProcessor';
import { ProposalResultProcessor } from '../../messageprocessors/ProposalResultProcessor';
import { DefaultSettingService } from '../DefaultSettingService';
import { SettingService } from '../model/SettingService';
import {CoreCookieService, CoreCookieServiceStatus} from './CoreCookieService';
import { SmsgService } from '../SmsgService';
import pForever from 'pm-forever';
import delay from 'pm-delay';

export enum CoreConnectionStatusServiceStatus {
    ERROR = 'ERROR',
    COOKIESERVICE_BROKEN = 'COOKIESERVICE_BROKEN',
    WALLET_NOT_INITIALIZED = 'WALLET_NOT_INITIALIZED',
    CONNECTED = 'CONNECTED',
    DISCONNECTED =  'DISCONNECTED'
}

export class CoreConnectionStatusService {

    public log: LoggerType;

    public isStarted = false;
    public updated = 0;
    public status: CoreConnectionStatusServiceStatus = CoreConnectionStatusServiceStatus.ERROR;

    private previousState = false;
    private INTERVAL = 1000;
    private STOP = false;

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
        @inject(Types.Service) @named(Targets.Service.observer.CoreCookieService) public coreCookieService: CoreCookieService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.start();
    }
    // tslint:enable:max-line-length

    public async start(): Promise<void> {

        await pForever(async (i) => {
            i++;

            this.isStarted = await this.checkConnection();
            this.updated = Date.now();
            if (this.STOP) {
                return pForever.end;
            }
            await delay(this.INTERVAL);
            this.log.error('CoreConnectionStatusService: ', i);

            return i;
        }, 0).catch(async reason => {
            this.log.error('ERROR: ', reason);
            await delay(this.INTERVAL);
            this.start();
        });

        this.log.error('CoreConnectionStatusService stopped!');
    }

    public async stop(): Promise<void> {
        this.STOP = true;
    }

    private async checkConnection(): Promise<boolean> {
        // coreCookieService needs to be started for the authentication configuration to be correct for coreRpcService
        if (!this.coreCookieService.isStarted) {
            this.log.debug('coreCookieService.isStarted: ' + this.coreCookieService.isStarted);
            this.status = CoreConnectionStatusServiceStatus.COOKIESERVICE_BROKEN;
            return false;
        }

        const isConnected = await this.coreRpcService.isConnected();
        // let hasMarketConfiguration = false;

        if (isConnected) {

            if (this.previousState !== isConnected) {
                this.log.info('connection with particld established.');

/*
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
                    this.status = CoreConnectionStatusServiceStatus.CONNECTED;

                } else {
                    isConnected = false;
                    this.status = CoreConnectionStatusServiceStatus.WALLET_NOT_INITIALIZED;

                    this.log.error('wallet not initialized yet, retrying in ' + this.INTERVAL + 'ms.');
                }
*/

                this.status = CoreConnectionStatusServiceStatus.CONNECTED;

                this.INTERVAL = 10000;
            }

            // this.log.info('connected to particld, checking again in ' + this.INTERVAL + 'ms.');
        } else {

            if (this.previousState !== isConnected /*&& hasMarketConfiguration*/) {
                this.log.info('connection with particld disconnected.');
                this.status = CoreConnectionStatusServiceStatus.DISCONNECTED;

                // stop message polling
                // await this.waitingMessageProcessor.stop();
                this.INTERVAL = 1000;
            }

            if (process.env.NODE_ENV !== 'test') {
                this.log.error('failed to connect to particld, retrying in ' + this.INTERVAL + 'ms.');
            }
        }

        this.previousState = isConnected;

        return isConnected;
    }
/*
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
*/
}
