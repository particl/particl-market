import { BidFactory } from '../../../../src/api/factories/BidFactory';
import { LogMock } from '../../lib/LogMock';
import { BidMessageType } from '../../../../src/api/enums/BidMessageType';
import { BidMessage } from '../../../../src/api/messages/BidMessage';
import { MessageException } from '../../../../src/api/exceptions/MessageException';

describe('BidFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let bidFactory;

    beforeEach(() => {
        bidFactory = new BidFactory(LogMock);
    });

    // TODO: these tests do not check all the valid state changes yet.
    // TODO: also they do not take in to account from who the latest bid is from/check if the latestBid was
    // from correct person

    test('Should create BidMessages correctly', async () => {
        const message = await bidFactory.getMessage(BidMessageType.MPA_ACCEPT, 'itemhash', [{
            id: 'iidee',
            value: 'value'
        }]);

        expect(message.action).toBe(BidMessageType.MPA_ACCEPT.toString());
        expect(message.item).toBe('itemhash');
        expect(message.objects).toEqual([{
            id: 'iidee',
            value: 'value'
        }]);

    });

    test('Should convert BidMessage, action: MPA_BID to BidCreateRequest', async () => {

        const listingItemId = 1;
        const bidMessage = {
            action: BidMessageType.MPA_BID,
            item: 'f08f3d6e',
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

        const bidCreateRequest = await bidFactory.getModel(bidMessage, listingItemId);

        expect(bidCreateRequest.action).toBe(bidMessage.action);
        expect(bidCreateRequest.bidData.length).toBe(1);
        expect(bidCreateRequest.bidData[0].dataId).toBe(bidMessage.objects[0].id);
        expect(bidCreateRequest.bidData[0].dataValue).toBe(bidMessage.objects[0].value);
    });

    test('Should convert BidMessage, action: MPA_BID to BidCreateRequest with 2 bidData objects', async () => {
        const listingItemId = 1;
        const bidMessage = {
            action: BidMessageType.MPA_BID,
            item: 'f08f3d6e',
            objects: [{
                id: 'colour',
                value: 'black'
            }, {
                id: 'size',
                value: 'xl'
            }]
        } as BidMessage;

        const bidCreateRequest = await bidFactory.getModel(bidMessage, listingItemId);
        expect(bidCreateRequest.action).toBe(bidMessage.action);
        expect(bidCreateRequest.bidData.length).toBe(2);
        expect(bidCreateRequest.bidData[0].dataId).toBe(bidMessage.objects[0].id);
        expect(bidCreateRequest.bidData[0].dataValue).toBe(bidMessage.objects[0].value);
        expect(bidCreateRequest.bidData[1].dataId).toBe(bidMessage.objects[1].id);
        expect(bidCreateRequest.bidData[1].dataValue).toBe(bidMessage.objects[1].value);
    });

    test('Should fail converting BidMessage, action: MPA_BID to BidCreateRequest with undefined listingItemId', async () => {

        expect.assertions(1);
        const listingItemId: number = undefined;
        const bidMessage = {
            action: BidMessageType.MPA_BID,
            item: 'f08f3d6e'
        } as BidMessage;

        await bidFactory.getModel(bidMessage, listingItemId).catch(e =>
            expect(e).toEqual(new MessageException('Invalid listingItemId.'))
        );

    });

    test('Should convert the BidMessage, action: MPA_ACCEPT to BidCreateRequest', async () => {
        const latestBid = {
            listing_item_id: 1,
            action: BidMessageType.MPA_BID,
            bidData: [{
                dataId: 'colour',
                dataValue: 'black'
            }, {
                dataId: 'size',
                dataValue: 'xl'
            }]
        };
        const listingItemId = 1;
        const bidMessage = {
            action: BidMessageType.MPA_ACCEPT,
            item: 'f08f3d6e'
        } as BidMessage;

        const bidCreateRequest = await bidFactory.getModel(bidMessage, listingItemId, latestBid);
        expect(bidCreateRequest.action).toBe(bidMessage.action);
    });

    test('Should fail converting BidMessage to BidCreateRequest, latestBid has action: MPA_ACCEPT', async () => {

        expect.assertions(3);

        const bidMessage = {
            action: BidMessageType.MPA_BID,
            item: 'f08f3d6e'
        } as BidMessage;

        const listingItemId = 1;
        const latestBid = {
            action: BidMessageType.MPA_ACCEPT
        };

        // bidMessage.action: BidMessageType.MPA_BID
        // latestBid.action: BidMessageType.MPA_ACCEPT
        // -> latestBid was allready accepted, cannot bid
        await bidFactory.getModel(bidMessage, listingItemId, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );

        bidMessage.action = BidMessageType.MPA_REJECT;
        // bidMessage.action: BidMessageType.MPA_REJECT
        // latestBid.action: BidMessageType.MPA_ACCEPT
        // -> latestBid was allready accepted, cannot reject
        await bidFactory.getModel(bidMessage, listingItemId, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );

        bidMessage.action = BidMessageType.MPA_CANCEL;
        // bidMessage.action: BidMessageType.MPA_CANCEL
        // latestBid.action: BidMessageType.MPA_ACCEPT
        // -> latestBid was allready accepted, cannot cancel
        await bidFactory.getModel(bidMessage, listingItemId, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );
    });

    test('Should fail converting BidMessage to BidCreateRequest, latestBid has action: MPA_CANCEL', async () => {

        expect.assertions(2);

        const bidMessage = {
            action: BidMessageType.MPA_REJECT,
            item: 'f08f3d6e'
        } as BidMessage;

        const listingItemId = 1;
        const latestBid = {
            action: BidMessageType.MPA_CANCEL
        };

        // latestBid.action: BidMessageType.MPA_CANCEL
        // bidMessage.action: BidMessageType.MPA_REJECT
        // -> latestBid was cancelled, cannot reject
        await bidFactory.getModel(bidMessage, listingItemId, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );

        bidMessage.action = BidMessageType.MPA_ACCEPT;
        // latestBid.action: BidMessageType.MPA_CANCEL
        // bidMessage.action: BidMessageType.MPA_ACCEPT
        // -> latestBid was cancelled, cannot accept
        await bidFactory.getModel(bidMessage, listingItemId, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );

    });

    test('Should fail converting BidMessage to BidCreateRequest, latestBid has action: MPA_REJECT', async () => {

        expect.assertions(3);

        const bidMessage = {
            action: BidMessageType.MPA_CANCEL,
            item: 'f08f3d6e'
        } as BidMessage;

        const listingItemId = 1;
        const latestBid = {
            action: BidMessageType.MPA_REJECT
        };

        // latestBid.action: BidMessageType.MPA_REJECT
        // bidMessage.action: BidMessageType.MPA_CANCEL
        // -> latestBid was rejected, cannot cancel
        await bidFactory.getModel(bidMessage, listingItemId, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );

        bidMessage.action = BidMessageType.MPA_ACCEPT;
        // latestBid.action: BidMessageType.MPA_REJECT
        // bidMessage.action: BidMessageType.MPA_ACCEPT
        // -> latestBid was rejected, cannot accept
        await bidFactory.getModel(bidMessage, listingItemId, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );

        bidMessage.action = BidMessageType.MPA_REJECT;
        // latestBid.action: BidMessageType.MPA_REJECT
        // bidMessage.action: BidMessageType.MPA_REJECT
        // -> latestBid was rejected, cannot reject
        await bidFactory.getModel(bidMessage, listingItemId, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );

    });


});

