import { EscrowFactory } from '../../../../src/api/factories/EscrowFactory';
import { LogMock } from '../../lib/LogMock';
import { EscrowMessageType } from '../../../../src/api/enums/EscrowMessageType';
import { Country } from '../../../../src/api/enums/Country';
import { EscrowType } from '../../../../src/api/enums/EscrowType';
import { EscrowMessage } from '../../../../src/api/messages/EscrowMessage';

describe('EscrowFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let escrowFactory;

    beforeEach(() => {
        escrowFactory = new EscrowFactory(LogMock);
    });

    test('Should get EscrowLockMessage', async () => {

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

        const escrowMessage: EscrowMessage = await escrowFactory.getMessage(request, escrow, address);

        expect(escrowMessage.action).toBe(request.action);
        expect(escrowMessage.listing).toBe(request.listing);
        expect(escrowMessage.nonce).toBe(request.nonce);
        // todo: fix when zip is added
        expect(escrowMessage.info.address).toBe(address.addressLine1 + ', ' + address.addressLine2 + ', ' + address.city + ', ' + address.country);
        expect(escrowMessage.info.memo).toBe(request.memo);
        expect(escrowMessage.escrow.rawtx).not.toBeNull();

    });

    test('Should get EscrowRefundMessage', async () => {

        const request = {
            action: EscrowMessageType.MPA_REFUND,
            listing: 'f08f3d6e',
            accepted: true,
            memo: 'Here is a refund, greetings vendor'
        };

        const escrow = {
            type: EscrowType.MAD,
            ratio: {
                buyer: 50,
                seller: 50
            }
        };

        const escrowMessage: EscrowMessage = await escrowFactory.getMessage(request, escrow, null);

        expect(escrowMessage.action).toBe(request.action);
        expect(escrowMessage.listing).toBe(request.listing);
        expect(escrowMessage.accepted).toBe(request.accepted);
        expect(escrowMessage.memo).toBe(request.memo);
        expect(escrowMessage.escrow.rawtx).not.toBeNull();
        expect(escrowMessage.escrow.type).toBe('refund');

    });

    test('Should get EscrowReleaseMessage', async () => {

        const request = {
            action: EscrowMessageType.MPA_RELEASE,
            listing: 'f08f3d6e',
            memo: 'Release the funds, greetings buyer'
        };

        const escrow = {
            type: EscrowType.MAD,
            ratio: {
                buyer: 50,
                seller: 50
            }
        };

        const escrowMessage: EscrowMessage = await escrowFactory.getMessage(request, escrow, null);

        expect(escrowMessage.action).toBe(request.action);
        expect(escrowMessage.listing).toBe(request.listing);
        expect(escrowMessage.memo).toBe(request.memo);
        expect(escrowMessage.escrow.rawtx).not.toBeNull();
        expect(escrowMessage.escrow.type).toBe('release');

    });
});

