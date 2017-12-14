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

    test('Should fail because data is missing', () => {
        itemCategoryFactory = {
            getCategory: jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve(() => ({ id: 1 }));
                });
            })
        };
        mesInfoFactory = {
            get: jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve({
                        toJSON: () => (req.messaging)
                    });
                });
            })
        };
        itemPriceFactory = {
            get: jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve({
                        toJSON: () => (req.payment.cryptocurrency)
                    });
                });
            })
        };
        listingItemFactory = new ListingItemFactory(itemCategoryFactory, mesInfoFactory, itemPriceFactory, LogMock);

        // delete req.payment;

        listingItemFactory.get(req).then((res, error) => {
            console.log('----listingItem----', res);
            console.log('----listingItem----', res.paymentInformation.itemPrice.toJSON());
        });
    });
});
