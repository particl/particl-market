import * as dotenv from 'dotenv';
dotenv.config({path: './test/.env.blackbox'});
import * as _ from 'lodash';
import * as request from 'request-promise';
import { Options } from 'request-promise';
import { ApiResponseTest } from './ApiResponseTest';

export interface ApiOptions<T> {
    body?: T;
    headers?: any;
    host?: string;
    port?: number;
}

export const api = async <T> (method: string, path: string, options: ApiOptions<T> = {}) => {

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

    let res;
    let error = null;
    try {
        res = await request(o);
        console.log('res.body:', res.body);
    } catch (e) {
        error = e;
        console.log('error: ', error.error.message);
    }
    return new ApiResponseTest(error, res);

/*
    await request(o)
        .then(res => {
            console.log('res:', res.body);
            return new ApiResponseTest(null, res);
        })
        .catch( error => {
            console.log('error:', error.error.message);
            return new ApiResponseTest(error, null);
        });
*/

};


export const rpc = async (method: string, params: any[] = [] ): any => {
    const body = { method, params, jsonrpc: '2.0' };
    console.log('body:', body);
    return await api('POST', '/api/rpc', { body });
};
