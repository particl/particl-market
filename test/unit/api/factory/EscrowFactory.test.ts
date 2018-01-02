import { EscrowFactory } from '../../../../src/api/factories/EscrowFactory';
import { LogMock } from '../../lib/LogMock';
import { EscrowMessageType } from '../../../../src/api/enums/EscrowMessageType';
import {Country} from "../../../../src/api/enums/Country";
import {EscrowType} from "../../../../src/api/enums/EscrowType";

describe('EscrowFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let escrowFactory;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        escrowFactory = new EscrowFactory(LogMock);
    });

    test('Should get EscrowLockMessage', () => {

        const request = {
            action: EscrowMessageType.MPA_LOCK,
            listing: 'f08f3d6e',
            nonce: 'randomness',
            memo: 'Please deliver by 17 March 2017'
        };

        const escrow = {
            type: EscrowType.MAD,
            ratio: {
                buyer: 50,
                seller: 50
            }
        };

        const address = {
            title: 'Title',
            addressLine1: '20 seventeen street',
            addressLine2: 'march city, 2017',
            city: 'city',
            country: Country.FINLAND
        };

        escrowFactory.getMessage(request).then((response, error) => {
            expect(response.action).toBe(request.action);
            expect(response.listing).toBe(request.listing);
            expect(response.nonce).toBe(request.nonce);
            expect(response.info.address).toBe(request.address.addressLine1 + ', ' + request.address.addressLine2);
            expect(response.info.memo).toBe(request.memo);
            // todo: fix expect
            expect(response.escrow.rawtx).not.toBeNull();
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

