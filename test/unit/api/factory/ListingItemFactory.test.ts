import { LogMock } from '../../lib/LogMock';
import { ListingItemFactory } from '../../../../src/api/factories/ListingItemFactory';

describe('ListingItemFactory', () => {

    let req;
    let listingItemFactory;
    let itemCategoryFactory = null;
    let listingItemForModal;
    const rootCategoryWithRelated = {
        id: 1,
        key: 'cat_ROOT',
        name: 'ROOT',
        ChildItemCategories: [
            {
                id: 2,
                key: 'cat_high_value',
                name: 'High Value 2',
                parentItemCategoryId: 1,
                ChildItemCategories: [
                    {
                        id: 5,
                        key: 'cat_high_business_corporate',
                        name: 'Business Corporate',
                        parentItemCategoryId: 2,
                        ChildItemCategories: []
                    }
                ]
            }
        ]
    };
    beforeEach(() => {

        listingItemFactory = new ListingItemFactory(LogMock, itemCategoryFactory);

        req = {
            ItemInformation: {
                title: 'Title of the item',
                shortDescription: 'A short description / summary of item',
                longDescription: 'A longer description of the item or service',
                ItemCategory: {
                    id: 7,
                    key: 'cat_high_business_corporate',
                    name: 'Business Corporate',
                    parentItemCategoryId: 2
                }
            },
            PaymentInformation: {
                type: 'SALE',
                Escrow: {
                    type: 'NOP'
                },
                ItemPrice: { currency: 'BITCOIN', basePrice: 100000000 }
            },
            MessagingInformation: [{ protocol: 'SMSG', publicKey: 'publickey2' }],
            ListingItemObjects: [{
                type: 'DROPDOWN',
                description: 'Test Description',
                order: 1
            }]

        };
    });

    test('Should get the listing-item message from service', () => {
        itemCategoryFactory = {
            getArray: (category, rootCatWithRelated) => {
                return ['cat_Root', 'cat_high_value', 'cat_high_business_corporate'];
            }
        };
        listingItemFactory = new ListingItemFactory(LogMock, itemCategoryFactory);
        listingItemFactory.getMessage(req).then((res, error) => {
            listingItemForModal = res;
            expect(res.hash).not.toBeNull();
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
        });
    });


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

});
