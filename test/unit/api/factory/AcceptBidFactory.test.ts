import { AcceptBidFactory } from '../../../../src/api/factories/AcceptBidFactory';
import { LogMock } from '../../lib/LogMock';
import * as _ from 'lodash';

describe('AcceptBidFactory', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let acceptBidFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        acceptBidFactory = new AcceptBidFactory(LogMock);
        req = {
            version: '0.1.1.0',
            item: 'f08f3d6e'
        };
    });

    test('Should convert the acceptBidMessage to bid', () => {
        const res = acceptBidFactory.get(req);
        expect(res.hash).toBe(req.item);
        expect(res).toHaveProperty('hash');
        expect(_.size(res)).toBe(1);
    });
});

