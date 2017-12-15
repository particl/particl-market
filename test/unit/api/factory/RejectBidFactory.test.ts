import { RejectBidFactory } from '../../../../src/api/factories/RejectBidFactory';
import { LogMock } from '../../lib/LogMock';
import * as _ from 'lodash';

describe('RejectBidFactory', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let rejectBidFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        rejectBidFactory = new RejectBidFactory(LogMock);
        req = {
            version: '0.1.1.0',
            item: 'f08f3d6e'
        };
    });

    test('Should convert the rejectBidMessage to bid', () => {
        const res = rejectBidFactory.get(req);
        expect(res.hash).toBe(req.item);
        expect(res).toHaveProperty('hash');
        expect(_.size(res)).toBe(1);
    });
});

