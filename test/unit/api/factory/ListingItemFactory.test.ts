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

                console.log('message: ', JSON.stringify(message, null, 2));
                expect(message.hash).toBe(listingItemTemplateTestData.hash);

                expect(message.id).not.toBeDefined();
                expect(message.profileId).not.toBeDefined();
                expect(message.updatedAt).not.toBeDefined();
                expect(message.createdAt).not.toBeDefined();

                expect(message.ItemInformation).not.toBeDefined();
                expect(message.PaymentInformation).not.toBeDefined();
                expect(message.MessagingInformation).not.toBeDefined();
                expect(message.ListingItemObjects).not.toBeDefined();
                expect(message.Profile).not.toBeDefined();
                expect(message.ListingItem).not.toBeDefined();

                expect(message.information).toBeDefined();
                expect(message.information.id).not.toBeDefined();

                expect(message.information.title).toBe(listingItemTemplateTestData.ItemInformation.title);
                // TODO: test rest of the information fields

                expect(message.information.ItemCategory).not.toBeDefined();
                expect(message.information.ItemLocation).not.toBeDefined();
                expect(message.information.ShippingDestinations).not.toBeDefined();

                expect(message.category).toBeDefined();
                expect(message.category).toBe([
                    'cat_ROOT',
                    'cat_high_value',
                    'cat_high_luxyry_items'
                ]);

                // TODO: test payment fields
                // TODO: test messaging fields
                // TODO: test objects fields


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
