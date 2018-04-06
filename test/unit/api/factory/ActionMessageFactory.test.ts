import { ActionMessageFactory } from '../../../../src/api/factories/ActionMessageFactory';
import { EscrowMessageType } from '../../../../src/api/enums/EscrowMessageType';
import { BidMessageType } from '../../../../src/api/enums/BidMessageType';
import { SmsgMessage } from '../../../../src/api/messages/SmsgMessage';
import { EscrowMessage } from '../../../../src/api/messages/EscrowMessage';
import { BidMessage } from '../../../../src/api/messages/BidMessage';
import { ActionMessageInterface } from '../../../../src/api/messages/ActionMessageInterface';
import { ActionMessageCreateRequest } from '../../../../src/api/requests/ActionMessageCreateRequest';
import { EscrowType } from '../../../../src/api/enums/EscrowType';
import { LogMock } from '../../lib/LogMock';

describe('EscrowFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let actionMessageFactory;

    beforeEach(() => {
        actionMessageFactory = new ActionMessageFactory(LogMock);
    });

    test('Test ActionMessageFactory.getModel()', async () => {
        // TODO: Currently BidMessageType's and EscrowMessageType's have no real difference amongst themselves,
        //     but later we might want to check each individual type
        /*
            Ergonomic Frozen Shoes
            Gorgeous Fresh Bike
            Incredible Steel Chair
            Incredible Concrete Towels
            Generic Soft Car
            Awesome Cotton Keyboard
            Handmade Concrete Shirt
            Awesome Steel Gloves
            Ergonomic Wooden Chair
            Sleek Steel Towels
            Incredible Metal Tuna
        */
        const testData: any[] = [
            { // Standard BidMessageType.MPA_BID
                listingItemId: 0,
                message: {
                    action: BidMessageType.MPA_BID,
                    item: 'Ergonomic Frozen Shoes',
                    objects: []
                } as BidMessage,
                smsgMessage: {
                    msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d',
                    version: '0300',
                    received: '2018-03-12T01:08:18+0200',
                    sent: '2018-03-13T01:08:18+0200',
                    from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3',
                    to: 'PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM',
                    text: 'A.g1'
                } as SmsgMessage
            },
            { // Standard EscrowMessageType.MPA_LOCK
                listingItemId: 0,
                message: {
                    action: EscrowMessageType.MPA_LOCK,
                    item: 'Gorgeous Fresh Bike',
                    escrow: {
                        type: EscrowType.MAD,
                        ratio: {
                            buyer: 50,
                            seller: 50
                        }
                    },
                    nonce: 'Nonce B.1',
                    memo: 'Memo B.1',
                    info: {
                        memo: 'Memo B.1'
                    },
                    accepted: true
                } as EscrowMessage,
                smsgMessage: {
                    msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d',
                    version: '0300',
                    received: '2018-03-12T01:08:18+0200',
                    sent: '2018-03-13T01:08:18+0200',
                    from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3',
                    to: 'PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM',
                    text: 'B.g1'
                } as SmsgMessage
            },
            { // Standard EscrowMessageType.MPA_REFUND with no info
                listingItemId: 0,
                message: {
                    action: EscrowMessageType.MPA_REFUND,
                    item: 'Incredible Steel Chair',
                    escrow: {
                        type: EscrowType.MAD,
                        ratio: {
                            buyer: 50,
                            seller: 50
                        }
                    },
                    nonce: 'Nonce B.2',
                    memo: 'Memo B.2',
                    accepted: true
                } as EscrowMessage,
                smsgMessage: {
                    msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d',
                    version: '0300',
                    received: '2018-03-12T01:08:18+0200',
                    sent: '2018-03-13T01:08:18+0200',
                    from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3',
                    to: 'PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM',
                    text: 'B.g2'
                } as SmsgMessage
            }
        ];

        expect.assertions(testData.length * (11 + 12));

        for ( const i in testData ) {
            if ( i ) {
                const listingItemId: number = testData[i].listingItemId;
                const messageRaw: ActionMessageInterface = testData[i].message;
                const smsgMessage: SmsgMessage = testData[i].smsgMessage;


                const returnedModel: ActionMessageCreateRequest = await actionMessageFactory.getModel(
                    messageRaw, listingItemId, smsgMessage);
                const smsgMessageData = actionMessageFactory.getModelMessageData(smsgMessage);

                expect(returnedModel).toBeDefined();
                expect(returnedModel).not.toBeNull();

                expect(returnedModel.action).toBeDefined();
                expect(returnedModel.action).not.toBeNull();
                expect(returnedModel.action).toBe(messageRaw.action);

                expect(returnedModel.listing_item_id).toBeDefined();
                expect(returnedModel.listing_item_id).not.toBeNull();
                expect(returnedModel.listing_item_id).toBe(listingItemId);

                expect(returnedModel.data).toBeDefined();
                expect(returnedModel.data).not.toBeNull();
                expect(returnedModel.data).toMatchObject(smsgMessageData);

                switch (testData[i].message.action) {
                    case BidMessageType.MPA_BID:
                    case BidMessageType.MPA_ACCEPT:
                    case BidMessageType.MPA_REJECT:
                    case BidMessageType.MPA_CANCEL:
                    {
                        const message = messageRaw as BidMessage;
                        const smsgMessageObjects = actionMessageFactory.getModelMessageObjects(message);

                        expect(returnedModel.objects).toBeDefined();
                        expect(returnedModel.objects).not.toBeNull();
                        expect(returnedModel.objects).toMatchObject(smsgMessageObjects);

                        expect(true).toBe(true); // Padding expects so we have a constant number of assertions pre iteration.
                        expect(true).toBe(true);
                        expect(true).toBe(true);

                        expect(true).toBe(true);
                        expect(true).toBe(true);
                        expect(true).toBe(true);

                        expect(true).toBe(true);
                        expect(true).toBe(true);
                        expect(true).toBe(true);
                        break;
                    }
                    case EscrowMessageType.MPA_LOCK:
                    case EscrowMessageType.MPA_REQUEST_REFUND:
                    case EscrowMessageType.MPA_REFUND:
                    case EscrowMessageType.MPA_RELEASE:
                    {
                        const message = messageRaw as EscrowMessage;

                        expect(returnedModel.nonce).toBeDefined();
                        expect(returnedModel.nonce).not.toBeNull();
                        expect(returnedModel.nonce).toBe(message.nonce);

                        expect(returnedModel.accepted).toBeDefined();
                        expect(returnedModel.accepted).not.toBeNull();
                        expect(returnedModel.accepted).toBe(message.accepted);

                        expect(returnedModel.info).toBeDefined();
                        expect(returnedModel.info).not.toBeNull();
                        expect(returnedModel.info).toBe(message.info);

                        expect(returnedModel.escrow).toBeDefined();
                        expect(returnedModel.escrow).not.toBeNull();
                        expect(returnedModel.escrow).toBe(message.escrow);
                        break;
                    }
                }
            }
        }
    });

    test('Negative test ActionMessageFactory.getModel()', async () => {
        const testData: any[] = [
            { // Standard BidMessageType.MPA_BID, missing message
                listingItemId: 0,
                smsgMessage: {
                    msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d',
                    version: '0300',
                    received: '2018-03-12T01:08:18+0200',
                    sent: '2018-03-13T01:08:18+0200',
                    from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3',
                    to: 'PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM',
                    text: 'A.g1'
                } as SmsgMessage
            },
            { // Standard BidMessageType.MPA_BID, missing smsgMessage
                listingItemId: 0,
                message: {
                    action: BidMessageType.MPA_BID,
                    item: 'Ergonomic Frozen Shoes',
                    objects: []
                } as BidMessage
            },
            { // Standard EscrowMessageType.MPA_LOCK, missing message
                listingItemId: 0,
                smsgMessage: {
                    msgid: 'fdd0b25a000000007188f0fc4cd57a37aa5a9ab26463510568e99d7d',
                    version: '0300',
                    received: '2018-03-12T01:08:18+0200',
                    sent: '2018-03-13T01:08:18+0200',
                    from: 'piyLdJcTzR72DsYh2j5wPWUUmwURfczTR3',
                    to: 'PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM',
                    text: 'B.g1'
                } as SmsgMessage
            },
            { // Standard EscrowMessageType.MPA_LOCK, missing smsgMessage
                listingItemId: 0,
                message: {
                    action: EscrowMessageType.MPA_LOCK,
                    item: 'Gorgeous Fresh Bike',
                    escrow: {
                        type: EscrowType.MAD,
                        ratio: {
                            buyer: 50,
                            seller: 50
                        }
                    },
                    nonce: 'Nonce B.1',
                    memo: 'Memo B.1',
                    info: {
                        memo: 'Memo B.1'
                    },
                    accepted: true
                } as EscrowMessage
            }
        ];

        expect.assertions(testData.length * (1 + 1));

        for ( const i in testData ) {
            if ( i ) {
                const listingItemId: number = testData[i].listingItemId;
                const messageRaw: ActionMessageInterface = testData[i].message;
                const smsgMessage: SmsgMessage = testData[i].smsgMessage;

                let returnedModel: ActionMessageCreateRequest;
                try {
                    returnedModel = await actionMessageFactory.getModel(
                        messageRaw, listingItemId, smsgMessage);
                } catch (ex) {
                    expect(true).toBe(true);
                }

                expect(returnedModel).not.toBeDefined();
            }
        }
    });
});
