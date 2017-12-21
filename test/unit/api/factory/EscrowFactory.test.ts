import { EscrowFactory } from '../../../../src/api/factories/EscrowFactory';
import { LogMock } from '../../lib/LogMock';

describe('EscrowFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let escrowFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        escrowFactory = new EscrowFactory(LogMock);
    });

    test('Should get EscrowLockMessage', () => {
        req = {
            escrow: {},
            address: {
                addressLine1: '20 seventeen street,',
                addressLine2: 'march city, 2017'
            },
            listing: 'f08f3d6e',
            nonce: 'randomness',
            memo: 'Please deliver by 17 March 2017'
        };
        const res = escrowFactory.getLockMessage(req);
        expect(res.version).not.toBeNull();
        expect(res.mpaction.length).toBe(1);
        expect(res.mpaction[0].action).toBe('MPA_LOCK');
        expect(res.mpaction[0].listing).toBe(req.listing);
        expect(res.mpaction[0].nonce).toBe(req.nonce);
        expect(res.mpaction[0].info.address).toBe(req.address.addressLine1 + req.address.addressLine2);
        expect(res.mpaction[0].info.memo).toBe(req.memo);
        expect(res.mpaction[0].escrow.rawtx).not.toBeNull();
    });

    test('Should get EscrowRefundMessage', () => {
        req = {
            escrow: {},
            listing: 'f08f3d6e',
            accepted: true,
            memo: 'Here is a refund, greetings vendor'
        };
        const res = escrowFactory.getRefundMessage(req);
        expect(res.version).not.toBeNull();
        expect(res.mpaction.action).toBe('MPA_REFUND');
        expect(res.mpaction.item).toBe(req.listing);
        expect(res.mpaction.accepted).toBe(true);
        expect(res.mpaction.memo).toBe(req.memo);
        expect(res.mpaction.escrow.rawtx).not.toBeNull();
        expect(res.mpaction.escrow.type).toBe('refund');
    });

    test('Should get EscrowReleaseMessage', () => {
        req = {
            escrow: {},
            listing: 'f08f3d6e',
            memo: 'Release the funds, greetings buyer'
        };
        const res = escrowFactory.getReleaseMessage(req);
        expect(res.version).not.toBeNull();
        expect(res.mpaction.action).toBe('MPA_RELEASE');
        expect(res.mpaction.item).toBe(req.listing);
        expect(res.mpaction.memo).toBe(req.memo);
        expect(res.mpaction.escrow.rawtx).not.toBeNull();
        expect(res.mpaction.escrow.type).toBe('release');
    });
});

