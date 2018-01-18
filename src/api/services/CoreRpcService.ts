import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Environment } from '../../core/helpers/Environment';
import * as WebRequest from 'web-request';
import { HttpException } from '../exceptions/HttpException';
import { JsonRpc2Response } from '../../core/api/jsonrpc';
import { InternalServerException } from '../exceptions/InternalServerException';

let RPC_REQUEST_ID = 1;

export class CoreRpcService {

    public log: LoggerType;

    private DEFAULT_MAINNET_PORT = 51735;
    private DEFAULT_TESTNET_PORT = 51935;
    private DEFAULT_HOSTNAME = 'localhost';
    private DEFAULT_USER = 'test';
    private DEFAULT_PASSWORD = 'test';

    constructor(@inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);

    }

    public async getNetworkInfo(): Promise<any> {
        return this.call('getnetworkinfo');
    }

    public async call(method: string, params: any[] = []): Promise<any> {

        const id = RPC_REQUEST_ID++;
        const postData = JSON.stringify({
            method,
            params,
            id
        });

        const url = this.getUrl();
        const options = this.getOptions();

        this.log.debug('CALL: ' + method + ' ' + params);
        // this.log.debug('call url:', url);
        // this.log.debug('call postData:', postData);

        return await WebRequest.post(url, options, postData)
            .then( response => {

                // this.log.debug('response.headers: ', response.headers);
                // this.log.debug('response.statusCode: ', response.statusCode);
                // this.log.debug('response.statusMessage: ', response.statusMessage);
                // this.log.debug('response.content: ', response.content);

                if (response.statusCode !== 200) {
                    throw new HttpException(response.statusCode, response.statusMessage);
                }

                const jsonRpcResponse = JSON.parse(response.content) as JsonRpc2Response;
                if (jsonRpcResponse.error) {
                    throw new InternalServerException([jsonRpcResponse.error.code, jsonRpcResponse.error.message]);
                }

                this.log.debug('RESULT:', jsonRpcResponse.result);
                return jsonRpcResponse.result;
            })
            .catch(error => {
                this.log.error('ERROR: ' + error.name + ': ' + error.message);
                if (error instanceof HttpException || error instanceof InternalServerException) {
                    throw error;
                } else {
                    throw new InternalServerException([error.name, error.message]);
                }
            });

    }

    private getOptions(): any {

        const auth = {
            user: (process.env.RPCUSER ? process.env.RPCUSER : this.DEFAULT_USER),
            pass: (process.env.RPCPASSWORD ? process.env.RPCPASSWORD : this.DEFAULT_PASSWORD),
            sendImmediately: false
        };

        const headers = {
            'User-Agent': 'Marketplace RPC client',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        const rpcOpts = {
            auth,
            headers
        };

        this.log.info('initializing rpc with opts:', rpcOpts);
        return rpcOpts;
    }

    private getUrl(): string {
        const host = (process.env.RPCHOSTNAME ? process.env.RPCHOSTNAME : this.DEFAULT_HOSTNAME);
        const port = (Environment.isDevelopment() ?
            (process.env.TESTNET_PORT ? process.env.TESTNET_PORT : this.DEFAULT_TESTNET_PORT) :
            (process.env.MAINNET_PORT ? process.env.MAINNET_PORT : this.DEFAULT_MAINNET_PORT));
        return 'http://' + host + ':' + port;
    }
}
