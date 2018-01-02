import { BidFactory } from '../../../../src/api/factories/BidFactory';
import { LogMock } from '../../lib/LogMock';
import * as _ from 'lodash';

describe('AcceptBidFactory', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let bidFactory;
    let req;

    const latestBid = {
        Status: 'ACTIVE'
    };

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        bidFactory = new BidFactory(LogMock);
        req = {
            action: 'MPA_ACCEPT',
            item: 'f08f3d6e'
        };
    });

    test('Should convert the acceptBidMessage to bid', () => {
        const res = bidFactory.get(req, 8, latestBid);
        expect(res.status).toBe('ACCEPTED');
    });
});

