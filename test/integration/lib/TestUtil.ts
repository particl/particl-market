// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType} from '../../../src/core/Logger';
import { LoggerConfig } from '../../../src/config/LoggerConfig';

export class TestUtil {

    public log: LoggerType = new LoggerType(__filename);

    constructor() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
        new LoggerConfig().configure();
    }

    public async bootstrapAppContainer(app: any): Promise<void> {
        this.log.debug('bootstrapAppContainer(), bootstrap the App...');
        await app.bootstrap();
        this.log.debug('bootstrapAppContainer(), bootstrap the App DONE');

        // todo: this hack needs to be fixed
        this.log.debug('bootstrapAppContainer(), TEST_BOOTSTRAP_WAITFOR:', process.env.TEST_BOOTSTRAP_WAITFOR || 10);
        await this.waitFor(process.env.TEST_BOOTSTRAP_WAITFOR || 10);
    }

    /**
     * wait for given amount of time
     *
     * @param {number} maxSeconds
     * @returns {Promise<boolean>}
     */
    public async waitFor(maxSeconds: number): Promise<boolean> {
        for (let i = 0; i < maxSeconds; i++) {
            this.log.debug('waiting... ' + i + '/' + maxSeconds);
            await this.waitTimeOut(1000);
        }
        return true;
    }

    private waitTimeOut(timeoutMs: number): Promise<void> {

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeoutMs);
        });
    }
}


