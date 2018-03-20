import * as dotenv from 'dotenv';
dotenv.config({ path: './test/.env.blackbox' });
import * as _ from 'lodash';
import * as request from 'request-promise';
import { Options } from 'request-promise';
import { ApiResponseTest } from './ApiResponseTest';
import { HttpException } from '../../../src/api/exceptions/HttpException';
import { RequestError, StatusCodeError, TransformError } from 'request-promise/errors';
import * as FormData from 'form-data';

export interface ApiOptions<T, T2> {
    body?: T;
    formData?: T2;
    headers?: any;
    host?: string;
    port?: number;
}

export const api = async <T> ( method: string, path: string, options: ApiOptions<T> = {}) => {

    const HOST = options.host ? options.host : process.env.APP_HOST;
    const PORT = options.port ? options.port : process.env.APP_PORT;
    const uri = `${HOST}:${PORT}${path}`;
    const auth = 'Basic ' + new Buffer(process.env.RPCUSER + ':' + process.env.RPCPASSWORD).toString('base64');

    if (!_.has(options, 'headers')) {
        options.headers = {};
        if (!_.has(options, 'Accept')) {
            options.headers['Accept'] = 'application/json';
        }
        if (!_.has(options, 'Content-Type')) {
            options.headers['Content-Type'] = 'application/json';
        }
        if (auth) {
            options.headers['Authorization'] = auth;
        }
    }

    const o: Options = {
        method,
        uri,
        resolveWithFullResponse: true,
        headers: options.headers,
        json: true
    };
    if ( options.formData ) {
        o.formData = options.formData;
    } else {
        o.body = (options.body || {});
    }

    let res;
    let error = null;
    try {
        res = await request(o);
    } catch (e) {
        error = e;
        if (error.error) {
            if (error.error.code) {
                throw new HttpException(500, error.error.message);
            } else {
                throw new HttpException(500, error.error + ', ' + JSON.stringify(error.error));
            }
        } else {
            throw new HttpException(500, error);
        }
    }
    return new ApiResponseTest(error, res);

    /*
        await request(o)
            .then(res => {
                console.log('res:', res.body);
                return new ApiResponseTest(null, res);
            })
            .catch(StatusCodeError, reason => {
                console.log('error:', reason.error.statusCode + ': ' + reason.error.message);
                return new ApiResponseTest(reason.error, null);
            })
            .catch(TransformError, reason => {
                console.log(reason.cause.message); // => Transform failed!
                return new ApiResponseTest(reason.error, null);
            })
            .catch(RequestError, reason => {
                // The request failed due to technical reasons.
                // reason.cause is the Error object Request would pass into a callback.
                throw new HttpException(500, reason.error.message);
            });
    */

};

export const rpc = async (method: string, params: any[] = []): any => {
    const body = { method, params, jsonrpc: '2.0' };
    return await api('POST', '/api/rpc', { body });
};
