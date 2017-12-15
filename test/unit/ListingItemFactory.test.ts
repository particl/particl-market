import { LogMock } from './lib/LogMock';
import { ListingItemFactory } from '../../src/api/factories/ListingItemFactory';

describe('ListingItemFactory', () => {

    let req;
    let itemCategoryFactory;
    let mesInfoFactory;
    let itemPriceFactory;
    let listingItemFactory;
    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        listingItemFactory = new ListingItemFactory(itemCategoryFactory, mesInfoFactory, itemPriceFactory, LogMock);
        req = {
            information: {
                title: 'Title of the item',
                short_description: 'A short description / summary of item',
                long_description: 'A longer description of the item or service',
                category: [
                    'Category',
                    'Subcategory',
                    'Subsubcategory'
                ]
            },
            payment: {
                type: 'SALE',
                escrow: {
                    type: 'NOP'
                },
                cryptocurrency: [
                    {
                        currency: 'BITCOIN',
                        base_price: 100000000
                    }
                ]
            },
            messaging: [
                {
                    protocol: 'SMSG',
                    public_key: 'publickey2'
                }
            ]
        };
        itemCategoryFactory = itemCategoryFactory;
        mesInfoFactory = mesInfoFactory;
        itemPriceFactory = itemPriceFactory;
    });

    test('Should get the listing-item data', () => {
        itemCategoryFactory = {
            get: jest.fn().mockImplementation(() => {
                // return 1;
                return new Promise((resolve, reject) => {
                    resolve(1);
                });
            })
        };
        mesInfoFactory = {
            get: jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve({
                        toJSON: () => ([{
                            protocol: req.messaging[0].protocol,
                            publicKey: req.messaging[0].public_key
                        }])
                    });
                });
            })
        };
        itemPriceFactory = {
            get: jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve({
                        toJSON: () => ([{
                            currency: req.payment.cryptocurrency[0].currency,
                            basePrice: req.payment.cryptocurrency[0].base_price
                        }])
                    });
                });
            })
        };
        listingItemFactory = new ListingItemFactory(itemCategoryFactory, mesInfoFactory, itemPriceFactory, LogMock);

        listingItemFactory.get(req).then((res, error) => {
            expect(res.hash).not.toBeNull();
            // itemInformation
            expect(res.itemInformation).not.toBe(undefined);
            expect(res.itemInformation.title).toBe(req.information.title);
            expect(res.itemInformation.shortDescription).toBe(req.information.short_description);
            expect(res.itemInformation.longDescription).toBe(req.information.long_description);

            expect(res.itemInformation.itemCategory).not.toBe(undefined);
            expect(res.itemInformation.itemCategory.id).not.toBe(undefined);
            expect(res.itemInformation.itemCategory.id).not.toBeNaN();

            // paymentInformation
            expect(res.paymentInformation).not.toBe(undefined);
            expect(res.paymentInformation.type).toBe(req.payment.type);
            expect(res.paymentInformation.escrow.type).toBe(req.payment.escrow.type);

            const itemPrice = res.paymentInformation.itemPrice.toJSON()[0];
            expect(itemPrice.currency).toBe(req.payment.cryptocurrency[0].currency);
            expect(itemPrice.basePrice).toBe(req.payment.cryptocurrency[0].base_price);

            // messagingInformation
            expect(res.messagingInformation).not.toBe(undefined);

            const messagingInformation = res.messagingInformation.toJSON()[0];
            expect(messagingInformation.protocol).toBe(req.messaging[0].protocol);
            expect(messagingInformation.publicKey).toBe(req.messaging[0].public_key);
        });
    });
});
