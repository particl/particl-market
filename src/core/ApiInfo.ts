// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as express from 'express';
import { Environment } from './helpers/Environment';
import { ApiMonitor } from './ApiMonitor';


export class ApiInfo {

    public static getRoute(): string {
        return process.env.APP_URL_PREFIX + process.env.API_INFO_ROUTE;
    }

    public setup(app: express.Application): void {
        if (Environment.isTruthy(process.env.API_INFO_ENABLED)) {
            app.get(
                ApiInfo.getRoute(),
                (req: myExpress.Request, res: myExpress.Response) => {
                    const pkg = Environment.getPkg();
                    const links = {
                        links: {}
                    };
                    if (Environment.isTruthy(process.env.MONITOR_ENABLED)) {
                        links.links['monitor'] =
                            `${app.get('host')}:${app.get('port')}${ApiMonitor.getRoute()}`;
                    }
                    // todo: get the pkg data somewhere
                    return res.json({
                        name: pkg.name,
                        version: pkg.version,
                        description: pkg.description,
                        ...links
                    });
                });
        }
    }
}
