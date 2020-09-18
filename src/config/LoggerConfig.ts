// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * config.Logger
 * ------------------------------------
 *
 * Define all log adapters for this application and chose one.
 */

import { Logger } from '../core/Logger';
import { WinstonAdapter } from './logger/WinstonAdapter';
import { Configurable } from '../core/App';


export class LoggerConfig implements Configurable {
    public configure(): void {
        Logger.addAdapter('winston', WinstonAdapter);
        Logger.setAdapter(process.env.LOG_ADAPTER);
    }
}
