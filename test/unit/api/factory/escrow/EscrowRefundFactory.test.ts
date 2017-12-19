import { EscrowRefundFactory } from '../../../../../src/api/factories/EscrowRefundFactory';
import { LogMock } from '../../../lib/LogMock';

describe('escrowRefundFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let escrowRefundFactory;
    let req;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        escrowRefundFactory = new EscrowRefundFactory(LogMock);
        req = {
            escrow: {},
            listing: 'f08f3d6e',
            accepted: true,
            memo: 'Here is a refund, greetings vendor'
        };
    });

    test('Should get EscrowRefundMessage', () => {
        const res = escrowRefundFactory.get(req);
        expect(res.version).not.toBeNull();
        expect(res.mpaction.action).toBe('MPA_REFUND');
        expect(res.mpaction.item).toBe(req.listing);
        expect(res.mpaction.accepted).toBe(true);
        expect(res.mpaction.memo).toBe(req.memo);
        expect(res.mpaction.escrow.rawtx).not.toBeNull();
        expect(res.mpaction.escrow.type).toBe('refund');
    });
});
