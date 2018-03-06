import { LogMock } from '../../lib/LogMock';
import { ListingItemFactory } from '../../../../src/api/factories/ListingItemFactory';
import * as listingItemTemplateTestData from '../../data/listingItemTemplate.json';
import { ItemCategory, default as resources } from 'resources';
import { ItemCategoryFactory } from '../../../../src/api/factories/ItemCategoryFactory';

describe('ListingItemFactory', () => {

    const itemCategoryFactory = new ItemCategoryFactory(LogMock);
    const listingItemFactory = new ListingItemFactory(LogMock, itemCategoryFactory);

    const rootCategoryWithChildren = {
        id: 321,
        key: 'cat_ROOT',
        name: 'ROOT',
        description: 'root item category',
        parentItemCategoryId: null,
        updatedAt: 1520294530628,
        createdAt: 1520294530628,
        ChildItemCategories: [
            {
                id: 322,
                key: 'cat_high_value',
                name: 'High Value (10,000$+)',
                description: '',
                parentItemCategoryId: 321,
                updatedAt: 1520294530628,
                createdAt: 1520294530628,
                ChildItemCategories: [
                    {
                        id: 326,
                        key: 'cat_high_luxyry_items',
                        name: 'Luxury Items',
                        description: '',
                        parentItemCategoryId: 322,
                        updatedAt: 1520294530628,
                        createdAt: 1520294530628
                    }
                ]
            }
        ]
    } as ItemCategory;


    beforeEach(() => {
        //
    });

    test('Should get ListingItemMessage', () => {

        listingItemFactory
            .getMessage(listingItemTemplateTestData, rootCategoryWithChildren)
            .then((message) => {

                expect(message.hash).toBe(listingItemTemplateTestData.hash);

/*
                // itemInformation
                expect(res.information).not.toBe(undefined);
                expect(res.information.title).toBe(req.ItemInformation.title);
                expect(res.information.shortDescription).toBe(req.ItemInformation.shortDescription);
                expect(res.information.longDescription).toBe(req.ItemInformation.longDescription);

                expect(res.information.category).not.toBe(undefined);
                expect(res.information.category).toHaveLength(3);

                // paymentInformation
                expect(res.payment).not.toBe(undefined);
                expect(res.payment.type).toBe(req.PaymentInformation.type);
                expect(res.payment.Escrow.type).toBe(req.PaymentInformation.Escrow.type);
                const itemPrice = res.payment.ItemPrice;
                expect(itemPrice.currency).toBe(req.PaymentInformation.ItemPrice.currency);
                expect(itemPrice.basePrice).toBe(req.PaymentInformation.ItemPrice.basePrice);

                // messagingInformation
                expect(res.messaging).not.toBe(undefined);
                const messagingInformation = res.messaging[0];
                expect(messagingInformation.protocol).toBe(req.MessagingInformation[0].protocol);
                expect(messagingInformation.publicKey).toBe(req.MessagingInformation[0].publicKey);

                // listingObjects
                expect(res.objects).not.toBe(undefined);
                const listingItemObjects = res.objects[0];
                expect(listingItemObjects.type).toBe(req.ListingItemObjects[0].type);
                expect(listingItemObjects.description).toBe(req.ListingItemObjects[0].description);
                expect(listingItemObjects.order).toBe(req.ListingItemObjects[0].order);
*/
            });
    });

/*
    test('Should get the listing-item message from message-processor', () => {
        const marketId = 1;
        const result = listingItemFactory.getModel(listingItemForModal, marketId);
        // check ListingItemCreateRequest
        expect(result.hash).not.toBeNull();
        expect(result.market_id).toBe(marketId);
        expect(result.itemInformation).not.toBe(undefined);
        expect(result.listingItemObjects).not.toBe(undefined);
        expect(result.paymentInformation).not.toBe(undefined);
        expect(result.messagingInformation).not.toBe(undefined);
    });
*/
});
