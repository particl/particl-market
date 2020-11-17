// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { app } from '../../app';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MarketplaceNotification } from '../messages/MarketplaceNotification';

export class NotifyService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async send(notification: MarketplaceNotification): Promise<void> {
        // TODO: inject SocketIOServer
        if (app.SocketIOServer) {
            app.SocketIOServer.emit(notification.event, JSON.stringify(notification.payload));
        }
    }
}
