import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import * as rpc from 'particl-rpc-service';


export class CoreRpcService {

    public log: LoggerType;

    private timeout: any;
    private interval = 3000;

    // TODO: get these from config
    private MAINNET_PORT = 51735;
    private TESTNET_PORT = 51935;
    private HOSTNAME = 'localhost';
    private USER = 'test';
    private PASSWORD = 'test';

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        rpc.init({
            rpcuser: this.USER,
            rpcpassword: this.PASSWORD,
            rpcbind: this.HOSTNAME,
            port: this.TESTNET_PORT
        });
    }

    public async call(method: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            rpc.call(method, params, (error, response) => {
                if (error) {
                    reject(error);
                } else if (response) {
                    resolve(response);
                }
            });
        });
    }
}
