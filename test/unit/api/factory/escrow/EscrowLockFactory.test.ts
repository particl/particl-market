import { EscrowLockFactory } from '../../../../../src/api/factories/EscrowLockFactory';
import { LogMock } from '../../../lib/LogMock';

describe('EscrowlockFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let escrowLockFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        escrowLockFactory = new EscrowLockFactory(LogMock);
        req = {
            escrow: {},
            address: {
                AddressLine1: '20 seventeen street,',
                AddressLine2: 'march city, 2017'
            },
            listing: 'f08f3d6e',
            nonce: 'randomness',
            memo: 'Please deliver by 17 March 2017'
        };
    });

    test('Should get EscrowLockMessage', () => {
        const res = escrowLockFactory.get(req);
        expect(res.version).not.toBeNull();
        expect(res.mpaction.length).toBe(1);
        expect(res.mpaction[0].action).toBe('MPA_LOCK');
        expect(res.mpaction[0].listing).toBe(req.listing);
        expect(res.mpaction[0].nonce).toBe(req.nonce);
        expect(res.mpaction[0].info.address).toBe(req.address.AddressLine1 + req.address.AddressLine2);
        expect(res.mpaction[0].info.memo).toBe(req.memo);
        expect(res.mpaction[0].escrow.rawtx).not.toBeNull();
    });
});

