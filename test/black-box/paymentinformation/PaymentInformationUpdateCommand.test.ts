// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { SaleType} from 'omp-lib/dist/interfaces/omp-enums';
import { CryptoAddressType, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';

describe('PaymentInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const paymentInformationCommand =  Commands.PAYMENTINFORMATION_ROOT.commandName;
    const paymentInformationUpdateCommand =  Commands.PAYMENTINFORMATION_UPDATE.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;

    const testData = {
        type: SaleType.FREE,
        itemPrice: {
            currency: Cryptocurrency.PART,
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            },
            cryptocurrencyAddress: {
                type: CryptoAddressType.NORMAL,
                address: 'This is NEW address.'
            }
        }
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // generate listingItemTemplate
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];
    });

    test('Should update PaymentInformation', async () => {

        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.itemPrice.currency,
            testData.itemPrice.basePrice,
            testData.itemPrice.shippingPrice.domestic,
            testData.itemPrice.shippingPrice.international,
            testData.itemPrice.cryptocurrencyAddress.address
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.listingItemTemplateId).toBe(listingItemTemplate.id);
        expect(result.type).toBe(testData.type);

        expect(result.ItemPrice.currency).toBe(testData.itemPrice.currency);
        expect(result.ItemPrice.basePrice).toBe(testData.itemPrice.basePrice);

        expect(result.ItemPrice.ShippingPrice.domestic).toBe(testData.itemPrice.shippingPrice.domestic);
        expect(result.ItemPrice.ShippingPrice.international).toBe(testData.itemPrice.shippingPrice.international);
        expect(result.ItemPrice.CryptocurrencyAddress.address).toBe(testData.itemPrice.cryptocurrencyAddress.address);
    });

    test('Should fail to update PaymentInformation using invalid id', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            0,
            testData.type,
            testData.itemPrice.currency,
            testData.itemPrice.basePrice,
            testData.itemPrice.shippingPrice.domestic,
            testData.itemPrice.shippingPrice.international,
            testData.itemPrice.cryptocurrencyAddress.address
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Entity with identifier 0 does not exist');

    });
});
