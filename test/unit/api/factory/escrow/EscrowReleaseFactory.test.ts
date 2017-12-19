import { EscrowReleaseFactory } from '../../../../../src/api/factories/EscrowReleaseFactory';
import { LogMock } from '../../../lib/LogMock';

describe('escrowReleaseFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let escrowReleaseFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        escrowReleaseFactory = new EscrowReleaseFactory(LogMock);
        req = {
            escrow: {},
            listing: 'f08f3d6e',
            memo: 'Release the funds, greetings buyer'
        };
    });

    test('Should get EscrowReleaseMessage', () => {
        const res = escrowReleaseFactory.get(req);
        expect(res.version).not.toBeNull();
        expect(res.mpaction.action).toBe('MPA_RELEASE');
        expect(res.mpaction.item).toBe(req.listing);
        expect(res.mpaction.memo).toBe(req.memo);
        expect(res.mpaction.escrow.rawtx).not.toBeNull();
        expect(res.mpaction.escrow.type).toBe('release');
    });
});

