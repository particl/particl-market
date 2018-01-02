import { BidFactory } from '../../../../src/api/factories/BidFactory';
import { LogMock } from '../../lib/LogMock';

describe('BidFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let bidFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        bidFactory = new BidFactory(LogMock);
        req = {
            action: 'MPA_BID',
            item: 'f08f3d6e',
            objects: [
              {
                id: 'colour',
                value: 'black'
              }
            ]
        };
    });

    test('Should convert bidMessage in to bid', () => {
        const res = bidFactory.get(req);
        expect(res.status).toBe('ACTIVE');
        expect(res.bidData.length).toBe(1);
        expect(res.bidData[0].dataId).toBe(req.objects[0].id);
        expect(res.bidData[0].dataValue).toBe(req.objects[0].value);
    });

    test('Should return 2 bidData objects for the given bidMessage', () => {
        req.objects.push({id: 'colour', value: 'red'});
        const res = bidFactory.get(req);
        expect(res.status).toBe('ACTIVE');
        expect(res.bidData.length).toBe(2);
        expect(res.bidData[1].dataId).toBe(req.objects[1].id);
        expect(res.bidData[1].dataValue).toBe(req.objects[1].value);
    });

    test('Should return blank bidData', () => {
        req.objects = [];
        const res = bidFactory.get(req);
        expect(res.status).toBe('ACTIVE');
        expect(res.bidData.length).toBe(0);
    });
});

