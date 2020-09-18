// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { AuthenticateMiddleware } from '../../../../src/api/middlewares/AuthenticateMiddleware';
import { LogMock } from '../../lib/LogMock';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

describe('AuthenticateMiddleware', () => {

    let authenticate;
    let request;
    let res;
    let req;
    let next;
    let authHeader;

    beforeEach(() => {
        request = jest.fn();
        authenticate = new AuthenticateMiddleware(LogMock, request);
        authHeader = 'Basic ' + Buffer.from([process.env.MARKET_RPC_USER, process.env.MARKET_RPC_PASSWORD].join(':')).toString('base64');
        req = {
            headers: {
                authorization: authHeader
            }
        };
        res = {
            failed: jest.fn()
        };
        next = jest.fn();
    });

    test('Should fail when no authorization header is set', () => {
        req.headers.authorization = undefined;
        authenticate.use(req, res, next);
        expect(res.failed).toHaveBeenCalled();
        // expect(res.failed).toHaveBeenCalledWith(401, 'You are not allowed to request this resource!');
    });

    test('Should fail when wrong authorization header is set', () => {
        req.headers.authorization = 'wrong:auth';
        authenticate.use(req, res, next);
        expect(res.failed).toHaveBeenCalled();
        // expect(res.failed).toHaveBeenCalledWith(401, 'You are not allowed to request this resource!');
    });

    test('Should pass if correct authorization header is set', () => {
        process.env.MARKET_RPC_USER = 'test';
        process.env.MARKET_RPC_PASSWORD = 'test';
        req.headers.authorization = 'Basic ' + Buffer.from([process.env.MARKET_RPC_USER, process.env.MARKET_RPC_PASSWORD].join(':')).toString('base64');
        expect(process.env.MARKET_RPC_USER).toBe('test');
        expect(process.env.MARKET_RPC_PASSWORD).toBe('test');
        authenticate.use(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('Should pass when authorization is disabled', () => {
        process.env.MARKET_RPC_AUTH_DISABLED = true;
        expect(process.env.MARKET_RPC_USER).toBe('test');
        expect(process.env.MARKET_RPC_PASSWORD).toBe('test');
        authenticate.use(req, res, next);
        expect(next).toHaveBeenCalled();
    });

});
