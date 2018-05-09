import { Logger as LoggerType} from '../../../src/core/Logger';
import { LoggerConfig } from '../../../src/config/LoggerConfig';

export class TestUtil {

    public log: LoggerType = new LoggerType(__filename);

    constructor() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
        new LoggerConfig().configure();
    }

    public async bootstrapAppContainer(app: any): Promise<void> {

        // await app.bootstrap();
        await this.waitFor(10);
    }

    /**
     * wait for given amount of time
     *
     * @param {number} maxSeconds
     * @returns {Promise<boolean>}
     */
    public async waitFor(maxSeconds: number): Promise<boolean> {
        for (let i = 0; i < maxSeconds; i++) {
            this.log.debug('waiting... ');
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


