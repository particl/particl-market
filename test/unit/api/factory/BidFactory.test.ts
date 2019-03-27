// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BidFactory } from '../../../../src/api/factories/model/BidFactory';
import { LogMock } from '../../lib/LogMock';
import { BidMessage } from '../../../../src/api/messages/BidMessage';
import { MessageException } from '../../../../src/api/exceptions/MessageException';
import { BidDataValue } from '../../../../src/api/enums/BidDataValue';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

describe('BidFactory', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    let bidFactory;
    const bidderAddress = 'bidderAddress';

    beforeEach(() => {
        bidFactory = new BidFactory(LogMock);
    });

    // TODO: these tests do not check all the valid state changes yet.
    // TODO: also they do not take in to account from who the latest
    // bid is from/check if the latestBid was from correct person

    test('Should create BidMessages correctly', async () => {
        const message = await bidFactory.getMessage(MPAction.MPA_ACCEPT, 'itemhash', [{
            id: 'iidee',
            value: 'value'
        }]);

        expect(message.action).toBe(MPAction.MPA_ACCEPT.toString());
        expect(message.item).toBe('itemhash');
        expect(message.objects).toEqual([{
            id: 'iidee',
            value: 'value'
        }]);

    });

    test('Should convert BidMessage, action: MPA_BID to BidCreateRequest', async () => {

        const listingItemId = 1;
        const bidMessage = {
            action: MPAction.MPA_BID,
            item: 'f08f3d6e',
            objects: [
                { id: 'colour', value: 'black' },
                { id: BidDataValue.SHIPPING_ADDRESS_FIRST_NAME, value: 'asdf' },
                { id: BidDataValue.SHIPPING_ADDRESS_LAST_NAME, value: 'asdf' },
                { id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1, value: 'asdf' },
                { id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2, value: '' },
                { id: BidDataValue.SHIPPING_ADDRESS_CITY, value: 'Helsinki' },
                { id: BidDataValue.SHIPPING_ADDRESS_STATE, value: '-' },
                { id: BidDataValue.SHIPPING_ADDRESS_ZIP_CODE, value: '1234' },
                { id: BidDataValue.SHIPPING_ADDRESS_COUNTRY, value: 'FI' }
            ]
        } as BidMessage;

        const bidCreateRequest = await bidFactory.getModel(bidMessage, listingItemId, bidderAddress);

        expect(bidCreateRequest.action).toBe(bidMessage.action);
        expect(bidCreateRequest.bidDatas.length).toBe(bidMessage.objects.length);
        expect(bidCreateRequest.bidDatas[0].dataId).toBe(bidMessage.objects[0].id);
        expect(bidCreateRequest.bidDatas[0].dataValue).toBe(bidMessage.objects[0].value);
    });

    test('Should convert BidMessage, action: MPA_BID to BidCreateRequest with 9 bidData objects', async () => {
        const listingItemId = 1;
        const bidMessage = {
            action: MPAction.MPA_BID,
            item: 'f08f3d6e',
            objects: [{
                id: 'colour',
                value: 'black'
            }, {
                id: 'size',
                value: 'xl'
            },
            { id: BidDataValue.SHIPPING_ADDRESS_FIRST_NAME, value: 'asdf' },
            { id: BidDataValue.SHIPPING_ADDRESS_LAST_NAME, value: 'asdf' },
            { id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1, value: 'asdf' },
            { id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2, value: '' },
            { id: BidDataValue.SHIPPING_ADDRESS_CITY, value: 'Helsinki' },
            { id: BidDataValue.SHIPPING_ADDRESS_STATE, value: '-' },
            { id: BidDataValue.SHIPPING_ADDRESS_ZIP_CODE, value: '1234' },
            { id: BidDataValue.SHIPPING_ADDRESS_COUNTRY, value: 'FI' }
            ]
        } as BidMessage;

        const bidCreateRequest = await bidFactory.getModel(bidMessage, listingItemId, bidderAddress);
        expect(bidCreateRequest.action).toBe(bidMessage.action);
        expect(bidCreateRequest.bidDatas.length).toBe(bidMessage.objects.length);
        expect(bidCreateRequest.bidDatas[0].dataId).toBe(bidMessage.objects[0].id);
        expect(bidCreateRequest.bidDatas[0].dataValue).toBe(bidMessage.objects[0].value);
        expect(bidCreateRequest.bidDatas[1].dataId).toBe(bidMessage.objects[1].id);
        expect(bidCreateRequest.bidDatas[1].dataValue).toBe(bidMessage.objects[1].value);
    });

    test('Should fail converting BidMessage, action: MPA_BID to BidCreateRequest with undefined listingItemId', async () => {

        expect.assertions(1);
        const listingItemId = undefined;
        const bidMessage = {
            action: MPAction.MPA_BID,
            item: 'f08f3d6e'
        } as BidMessage;

        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress).catch(e =>
            expect(e).toEqual(new MessageException('Invalid listingItemId.'))
        );

    });

    test('Should convert the BidMessage, action: MPA_ACCEPT to BidCreateRequest', async () => {
        const latestBid = {
            action: MPAction.MPA_BID
        };
        const listingItemId = 1;
        const bidMessage = {
            action: MPAction.MPA_ACCEPT,
            item: 'f08f3d6e',
            objects: [
                { id: BidDataValue.SHIPPING_ADDRESS_FIRST_NAME, value: 'asdf' },
                { id: BidDataValue.SHIPPING_ADDRESS_LAST_NAME, value: 'asdf' },
                { id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1, value: 'asdf' },
                { id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2, value: '' },
                { id: BidDataValue.SHIPPING_ADDRESS_CITY, value: 'Helsinki' },
                { id: BidDataValue.SHIPPING_ADDRESS_STATE, value: '-' },
                { id: BidDataValue.SHIPPING_ADDRESS_ZIP_CODE, value: '1234' },
                { id: BidDataValue.SHIPPING_ADDRESS_COUNTRY, value: 'FI' }
            ]
        } as BidMessage;

        const bidCreateRequest = await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid);
        expect(bidCreateRequest.action).toBe(bidMessage.action);
        expect(bidCreateRequest.bidder).toBe(bidderAddress);
    });

    test('Should fail converting BidMessage to BidCreateRequest, latestBid has action: MPA_ACCEPT', async () => {

        expect.assertions(3);

        const bidMessage = {
            action: MPAction.MPA_BID,
            item: 'f08f3d6e'
        } as BidMessage;

        const listingItemId = 1;
        const latestBid = {
            action: MPAction.MPA_ACCEPT
        };

        // bidMessage.action: MPAction.MPA_BID
        // latestBid.action: MPAction.MPA_ACCEPT
        // -> latestBid was allready accepted, cannot bid
        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid MPAction.'))
        );

        bidMessage.action = MPAction.MPA_REJECT;
        // bidMessage.action: MPAction.MPA_REJECT
        // latestBid.action: MPAction.MPA_ACCEPT
        // -> latestBid was allready accepted, cannot reject
        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid MPAction.'))
        );

        bidMessage.action = MPAction.MPA_CANCEL;
        // bidMessage.action: MPAction.MPA_CANCEL
        // latestBid.action: MPAction.MPA_ACCEPT
        // -> latestBid was allready accepted, cannot cancel
        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid MPAction.'))
        );
    });

    test('Should fail converting BidMessage to BidCreateRequest, latestBid has action: MPA_CANCEL', async () => {

        expect.assertions(2);

        const bidMessage = {
            action: MPAction.MPA_REJECT,
            item: 'f08f3d6e'
        } as BidMessage;

        const listingItemId = 1;
        const latestBid = {
            action: MPAction.MPA_CANCEL
        };

        // latestBid.action: MPAction.MPA_CANCEL
        // bidMessage.action: MPAction.MPA_REJECT
        // -> latestBid was cancelled, cannot reject
        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid MPAction.'))
        );

        bidMessage.action = MPAction.MPA_ACCEPT;
        // latestBid.action: MPAction.MPA_CANCEL
        // bidMessage.action: MPAction.MPA_ACCEPT
        // -> latestBid was cancelled, cannot accept
        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid MPAction.'))
        );

    });

    test('Should fail converting BidMessage to BidCreateRequest, latestBid has action: MPA_REJECT', async () => {

        expect.assertions(3);

        const bidMessage = {
            action: MPAction.MPA_CANCEL,
            item: 'f08f3d6e'
        } as BidMessage;

        const listingItemId = 1;
        const latestBid = {
            action: MPAction.MPA_REJECT
        };

        // latestBid.action: MPAction.MPA_REJECT
        // bidMessage.action: MPAction.MPA_CANCEL
        // -> latestBid was rejected, cannot cancel
        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid MPAction.'))
        );

        bidMessage.action = MPAction.MPA_ACCEPT;
        // latestBid.action: MPAction.MPA_REJECT
        // bidMessage.action: MPAction.MPA_ACCEPT
        // -> latestBid was rejected, cannot accept
        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid MPAction.'))
        );

        bidMessage.action = MPAction.MPA_REJECT;
        // latestBid.action: MPAction.MPA_REJECT
        // bidMessage.action: MPAction.MPA_REJECT
        // -> latestBid was rejected, cannot reject
        await bidFactory.getModel(bidMessage, listingItemId, bidderAddress, latestBid).catch(e =>
            expect(e).toEqual(new MessageException('Invalid MPAction.'))
        );

    });


});

