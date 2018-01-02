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
            action: 'MPA_LOCK',
            escrow: {},
            address: {
                addressLine1: '20 seventeen street,',
                addressLine2: 'march city, 2017'
            },
            listing: 'f08f3d6e',
            nonce: 'randomness',
            memo: 'Please deliver by 17 March 2017'
        };

        escrowFactory.get(req).then((response, error) => {
            expect(response.version).not.toBeNull();
            expect(response.mpaction.length).toBe(1);
            expect(response.mpaction[0].action).toBe('MPA_LOCK');
            expect(response.mpaction[0].listing).toBe(req.listing);
            expect(response.mpaction[0].nonce).toBe(req.nonce);
            expect(response.mpaction[0].info.address).toBe(req.address.addressLine1 + req.address.addressLine2);
            expect(response.mpaction[0].info.memo).toBe(req.memo);
            expect(response.mpaction[0].escrow.rawtx).not.toBeNull();
        });
    });

    test('Should get EscrowRefundMessage', () => {
        req = {
            action: 'MPA_REFUND',
            escrow: {},
            listing: 'f08f3d6e',
            accepted: true,
            memo: 'Here is a refund, greetings vendor'
        };
        const res = escrowFactory.get(req).then((response, error) => {
            expect(response.version).not.toBeNull();
            expect(response.mpaction.action).toBe('MPA_REFUND');
            expect(response.mpaction.item).toBe(req.listing);
            expect(response.mpaction.accepted).toBe(true);
            expect(response.mpaction.memo).toBe(req.memo);
            expect(response.mpaction.escrow.rawtx).not.toBeNull();
            expect(response.mpaction.escrow.type).toBe('refund');
        });
    });

    test('Should get EscrowReleaseMessage', () => {
        req = {
            action: 'MPA_RELEASE',
            escrow: {},
            listing: 'f08f3d6e',
            memo: 'Release the funds, greetings buyer'
        };
        const res = escrowFactory.get(req).then((response, error) => {
            expect(response.version).not.toBeNull();
            expect(response.mpaction.action).toBe('MPA_RELEASE');
            expect(response.mpaction.item).toBe(req.listing);
            expect(response.mpaction.memo).toBe(req.memo);
            expect(response.mpaction.escrow.rawtx).not.toBeNull();
            expect(response.mpaction.escrow.type).toBe('release');
        });
    });
});

