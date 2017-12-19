import { BidFactory } from '../../../../src/api/factories/BidFactory';
import { LogMock } from '../../lib/LogMock';
import * as _ from 'lodash';

describe('RejectBidFactory', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let bidFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        bidFactory = new BidFactory(LogMock);
        req = {
            action: 'MPA_REJECT',
            item: 'f08f3d6e'
        };
    });

    test('Should convert the rejectBidMessage to bid', () => {
        const res = bidFactory.get(req);
        expect(res.status).toBe('REJECTED');
    });
});
