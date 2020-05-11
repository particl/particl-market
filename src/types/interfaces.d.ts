// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as myExpress from './my-express';

declare namespace interfaces {

    interface Middleware {
        use(req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction): void;
    }

    interface Listener {
        act<T>(value?: T): void;
        act(...args: any[]): void;
    }

    interface Configurable {
        configure<T>(instance: T): void;
    }

    interface LoggerAdapter {
        debug(message: string, ...args: any[]): void;
        info(message: string, ...args: any[]): void;
        warn(message: string, ...args: any[]): void;
        error(message: string, ...args: any[]): void;
    }

    interface LoggerAdapterConstructor {
        new (scope: string): LoggerAdapter;
    }

}

export as namespace interfaces;
export = interfaces;
