import { AuthenticateMiddleware } from '../../../../src/api/middlewares/AuthenticateMiddleware';
import { LogMock } from '../../lib/LogMock';
import * as dotenv from 'dotenv';
dotenv.config({ path: './test/.env.test' });

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
        authHeader = 'Basic ' + new Buffer([process.env.RPCUSER, process.env.RPCPASSWORD].join(':')).toString('base64');
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

    test('Should pass if correct authorization header is set', () => {
        expect(process.env.RPCUSER).toBe('test');
        expect(process.env.RPCPASSWORD).toBe('test');
        authenticate.use(req, res, next);
        expect(next).toHaveBeenCalled();
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

});
