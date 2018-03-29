import { ActionMessageFactory } from '../../../../src/api/factories/ActionMessageFactory';
import { EscrowMessageType } from '../../../../src/api/enums/EscrowMessageType';
import { BidMessageType } from '../../../../src/api/enums/BidMessageType';
import { SmsgMessage } from '../../../../src/api/messages/SmsgMessage';
import { EscrowMessage } from '../../../../src/api/messages/EscrowMessage';
import { BidMessage } from '../../../../src/api/messages/BidMessage';
import { ActionMessageInterface } from '../../../../src/api/messages/ActionMessageInterface';
import { ActionMessageCreateRequest } from '../../../../src/api/requests/ActionMessageCreateRequest';
import { LogMock } from '../../lib/LogMock';

describe('EscrowFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let actionMessageFactory;

    beforeEach(() => {
        actionMessageFactory = new ActionMessageFactory(LogMock);
    });

    test('Should get EscrowLockMessage', async () => {
        const messages: ActionMessageInterface[] = [
            {
                action: BidMessageType.MPA_BID,
                item: 'Some item 1',
                objects: []
            } as ActionMessageInterface,
            {
                action: EscrowMessageType.MPA_LOCK,
                item: 'Some item 2',
                escrow: {},
                nonce: 'Nonce 1',
                memo: 'Memo 1',
                info: 'Info 1',
                accepted: true
            } as ActionMessageInterface
        ];

        const listingItemIds: number[] = [
            0,
            0
        ];

        const smsgMessages: SmsgMessage [] = [
            {
                msgid: 'a1',
                version: 'b1',
                received: 'c1',
                sent: 'd1',
                from: 'e1',
                to: 'f1',
                text: 'g1'
            },
            {
                msgid: 'a2',
                version: 'b2',
                received: 'c2',
                sent: 'd2',
                from: 'e2',
                to: 'f2',
                text: 'g2'
            }
        ];

        expect.assertions(messages.length * 7);

        for ( const i in messages ) {
            if ( i ) {
                const returnedModel: ActionMessageCreateRequest = await actionMessageFactory.getModel(messages[i], listingItemIds[i], smsgMessages[i]);
                expect(returnedModel.action).toBe(messages[i].action);
                expect(returnedModel.listing_item_id).toBe(listingItemIds[i]);
                const smsgMessageData = actionMessageFactory.getModelMessageData(smsgMessages[i]);
                expect(returnedModel.data).toBe(smsgMessageData);

                switch (messages[i].action) {
                    case BidMessageType.MPA_BID:
                    case BidMessageType.MPA_ACCEPT:
                    case BidMessageType.MPA_REJECT:
                    case BidMessageType.MPA_CANCEL:
                    {
                        const message = messages[i] as BidMessage;
                        const smsgMessageObjects = actionMessageFactory.getModelMessageObjects(message);
                        expect(returnedModel.objects).toBe(smsgMessageObjects);
                        expect(true).toBe(true); // Padding expects so we have a constant number of assertions pre iteration.
                        expect(true).toBe(true);
                        expect(true).toBe(true);
                        break;
                    }
                    case EscrowMessageType.MPA_LOCK:
                    case EscrowMessageType.MPA_REQUEST_REFUND:
                    case EscrowMessageType.MPA_REFUND:
                    case EscrowMessageType.MPA_RELEASE:
                    {
                        const message = messages[i] as EscrowMessage;
                        expect(returnedModel.nonce).toBe(message.nonce);
                        expect(returnedModel.accepted).toBe(message.accepted);
                        expect(returnedModel.info).toBe(message.info);
                        expect(returnedModel.escrow).toBe(message.escrow);
                        break;
                    }
                }
            }
        }
    });
});
