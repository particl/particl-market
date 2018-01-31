import * as dotenv from 'dotenv';
dotenv.config({path: './test/.env.test'});
import * as _ from 'lodash';
import * as request from 'request-promise';
import { Options } from 'request-promise';
import { ApiResponseTest } from './ApiResponseTest';
import { Logger as LoggerType } from '../../../src/core/Logger';


export interface ApiOptions<T> {
    body?: T;
    headers?: any;
    host?: string;
    port?: number;
}


export const api = async <T> (method: string, path: string, options: ApiOptions<T> = {}) => {

    const log: LoggerType = new LoggerType(__filename);
    const HOST = options.host ? options.host : process.env.APP_HOST;
    const PORT = options.port ? options.port : process.env.APP_PORT;
    const uri = `${HOST}:${PORT}${path}`;

    if (!_.has(options, 'headers')) {
        options.headers = {};
        if (!_.has(options, 'Accept')) {
            options.headers['Accept'] = 'application/json';
        }
        if (!_.has(options, 'Content-Type')) {
            options.headers['Content-Type'] = 'application/json';
        }
    }

    const o: Options = {
        method,
        uri,
        resolveWithFullResponse: true,
        headers: options.headers,
        json: true,
        body: options.body
    };

    log.error('res:', o);

    console.log('o: ', o);

    let res;
    let error = null;
    try {
        res = await request(o);
    } catch (e) {
        error = e;
        // console.log('error: ', error.error.message);
    }

    return new ApiResponseTest(error, res);
};


export const rpc = async (method: string, params: any[] = [] ): any => {
    const body = { method, params, jsonrpc: '2.0' };
    return await api('POST', '/api/rpc', { body });
};
