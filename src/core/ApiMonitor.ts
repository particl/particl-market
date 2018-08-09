// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as express from 'express';
import * as monitor from 'express-status-monitor';
import { Environment } from './helpers/Environment';


export class ApiMonitor {

    public static getRoute(): string {
        return process.env.MONITOR_ROUTE;
    }

    public setup(app: express.Application): void {
        if (Environment.isTruthy(process.env.MONITOR_ENABLED)) {
            app.use(monitor());
            app.get(ApiMonitor.getRoute(), monitor().pageRoute);
        }
    }
}
