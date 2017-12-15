import { CancelBidFactory } from '../../../../src/api/factories/CancelBidFactory';
import { LogMock } from '../../lib/LogMock';
import * as _ from 'lodash';

describe('CancelBidFactory', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let cancelBidFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        cancelBidFactory = new CancelBidFactory(LogMock);
        req = {
            version: '0.1.1.0',
            item: 'f08f3d6e'
        };
    });

    test('Should convert the cancelBidMessage to bid', () => {
        const res = cancelBidFactory.get(req);
        expect(res.hash).toBe(req.item);
        expect(res).toHaveProperty('hash');
        expect(_.size(res)).toBe(1);
    });
});

