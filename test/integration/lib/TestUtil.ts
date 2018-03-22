
import { Logger as LoggerType} from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { EventEmitter } from '../../../src/core/api/events';
import { ServerStartedListener } from '../../../src/api/listeners/ServerStartedListener';

export class TestUtil {

    public log: LoggerType;
    private serverStartedListener: ServerStartedListener;
    private timeout: any;
    private interval = 1000;
    private MAX_RETRIES = 5;

    constructor() {
        this.log = new LoggerType(__filename);
    }

    public async bootstrapAppContainer(app: any): boolean {

        // const emitter =
        await app.bootstrap();
        this.serverStartedListener = app.IoC.getNamed<ServerStartedListener>(Types.Listener, Targets.Listener.ServerStartedListener);

        // emitter.on(ServerStartedListener.ServerReadyEvent, () => {
        //    this.serverStarted = true;
        // });
        await this.waitForServerStarted();
    }

    private async isServerStarted(): boolean {
        if (this.serverStartedListener.isStarted === false) {
            throw Error('Not started.');
        } else {
            this.log.debug('SERVER READY!');
        }
        return true;
    }

    private waitFor(timeout: number): Promise<void> {
        this.log.debug('waiting for ' + timeout + 'ms');
        return new Promise((resolve) => {
            this.timeout = setTimeout(() => {
                resolve();
            }, timeout);
        });
    }

    private async waitForServerStarted(): Promise<boolean> {

        for (let i = 0; i <= this.MAX_RETRIES; i++) {
            try {
                return await this.isServerStarted();
            } catch (err) {
                await this.waitFor(this.interval);
                this.log.debug('error: ' + err.message);
            }
        }

        this.serverStartedListener.stop();
    }
}


