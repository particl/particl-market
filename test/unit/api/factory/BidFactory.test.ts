import { BidFactory } from '../../../../src/api/factories/BidFactory';
import { LogMock } from '../../lib/LogMock';

describe('BidFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let bidFactory;

    beforeEach(() => {
        bidFactory = new BidFactory(LogMock);
    });

    test('Should convert BidMessage in to bid', () => {

        const request = {
            action: 'MPA_BID',
            item: 'f08f3d6e',
            objects: [
                {
                    id: 'colour',
                    value: 'black'
                }
            ]
        };

        const bid = bidFactory.get(request);
        expect(res.action).toBe('ACTIVE');
        expect(res.bidData.length).toBe(1);
        expect(res.bidData[0].dataId).toBe(req.objects[0].id);
        expect(res.bidData[0].dataValue).toBe(req.objects[0].value);
    });

    test('Should return 2 bidData objects for the given bidMessage', () => {
        req.objects.push({id: 'colour', value: 'red'});
        const res = bidFactory.get(req);
        expect(res.action).toBe('ACTIVE');
        expect(res.bidData.length).toBe(2);
        expect(res.bidData[1].dataId).toBe(req.objects[1].id);
        expect(res.bidData[1].dataValue).toBe(req.objects[1].value);
    });

    test('Should return blank bidData', () => {
        req.objects = [];
        const res = bidFactory.get(req);
        expect(res.action).toBe('ACTIVE');
        expect(res.bidData.length).toBe(0);
    });

    // from acceptbidfactory
    test('Should convert the acceptBidMessage to bid', () => {
        const latestBid = {
            Status: 'ACTIVE'
        };

        const req = {
            action: 'MPA_ACCEPT',
            item: 'f08f3d6e'
        };
        const res = bidFactory.get(req, 8, latestBid);
        expect(res.action).toBe('ACCEPTED');
    });

    // cancelbbidfactory
    test('Should convert the cancelBidMessage to bid', () => {
        const latestBid = {
            Status: 'ACTIVE'
        };
        const req = {
            action: 'MPA_CANCEL',
            item: 'f08f3d6e'
        };

        const res = bidFactory.get(req, 8, latestBid);
        expect(res.action).toBe('CANCELLED');
    });

    // rejectbidfactory
    test('Should convert the rejectBidMessage to bid', () => {
        const latestBid = {
            Status: 'ACTIVE'
        };
        const req = {
            action: 'MPA_REJECT',
            item: 'f08f3d6e'
        };
        const res = bidFactory.get(req, 8, latestBid);
        expect(res.action).toBe('REJECTED');
    });
});

