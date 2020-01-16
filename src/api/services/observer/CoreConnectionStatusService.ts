// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../../constants';
import { Logger as LoggerType } from '../../../core/Logger';
import { EventEmitter } from '../../../core/api/events';
import { CoreRpcService } from '../CoreRpcService';
import { CoreCookieService } from './CoreCookieService';
import { CoreConnectionStatusServiceStatus } from '../../enums/CoreConnectionStatusServiceStatus';
import { BaseObserverService } from './BaseObserverService';
import { ObserverStatus } from '../../enums/ObserverStatus';

export class CoreConnectionStatusService extends BaseObserverService {

    public connectionStatus: CoreConnectionStatusServiceStatus = CoreConnectionStatusServiceStatus.DISCONNECTED;
    private previousStatus: CoreConnectionStatusServiceStatus;

    constructor(
        @inject(Types.Service) @named(Targets.Service.observer.CoreCookieService) public coreCookieService: CoreCookieService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(__filename, 1000, Logger);
        // this.log = new Logger(__filename);
    }

    public async observerLoop(currentStatus: ObserverStatus): Promise<ObserverStatus> {
        this.previousStatus = this.connectionStatus;

        this.connectionStatus = await this.checkConnection();

        if (this.connectionStatus === CoreConnectionStatusServiceStatus.COOKIESERVICE_DISCONNECTED) {
            return ObserverStatus.ERROR;
        }
        return ObserverStatus.RUNNING;
    }

    private async checkConnection(): Promise<CoreConnectionStatusServiceStatus> {

        // coreCookieService needs to be started for the authentication configuration to be correct for coreRpcService
        if (this.coreCookieService.status !== ObserverStatus.RUNNING) {
            this.log.debug('coreCookieService.status: ' + this.coreCookieService.status);
            return CoreConnectionStatusServiceStatus.COOKIESERVICE_DISCONNECTED;
        }

        // rpc connection working?
        const isConnected = await this.coreRpcService.isConnected();

        if (isConnected) {
            if (this.previousStatus !== CoreConnectionStatusServiceStatus.CONNECTED) {
                this.log.info('connection with particld established.');
                this.INTERVAL = 10000;
            }
            return CoreConnectionStatusServiceStatus.CONNECTED;

        } else {
            if (this.previousStatus !== CoreConnectionStatusServiceStatus.DISCONNECTED) {
                this.log.info('connection with particld disconnected.');
                this.INTERVAL = 1000;
            }

            if (process.env.NODE_ENV !== 'test') {
                this.log.error('failed to connect to particld, retrying in ' + this.INTERVAL + 'ms.');
            }
            return CoreConnectionStatusServiceStatus.DISCONNECTED;
        }
    }
}
