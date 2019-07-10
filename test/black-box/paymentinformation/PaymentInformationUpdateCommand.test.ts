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
import { ModelNotModifiableException } from '../../../src/api/exceptions/ModelNotModifiableException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('PaymentInformationUpdateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const paymentInformationCommand =  Commands.PAYMENTINFORMATION_ROOT.commandName;
    const paymentInformationUpdateCommand =  Commands.PAYMENTINFORMATION_UPDATE.commandName;
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;

    const testData = {
        type: SaleType.SALE,
        itemPrice: {
            currency: Cryptocurrency.PART,
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            },
            cryptocurrencyAddress: {
                type: CryptoAddressType.STEALTH,
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
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,  // generateListingItem
            defaultMarket.id   // marketId
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

    test('Should fail to update PaymentInformation because invalid listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            'INVALID',
            testData.type,
            testData.itemPrice.currency,
            testData.itemPrice.basePrice,
            testData.itemPrice.shippingPrice.domestic,
            testData.itemPrice.shippingPrice.international,
            testData.itemPrice.cryptocurrencyAddress.address
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should not update the MessagingInformation because the ListingItemTemplate has been published', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,    // generateListingItemObjects
            false,
            null,
            true,
            defaultMarket.id
        ]).toParamsArray();

        // generate listingItemTemplate
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];

        // post template
        const daysRetention = 4;
        let res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplates[0].id,
            daysRetention,
            defaultMarket.id
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        log.debug('result:', JSON.stringify(result, null, 2));
        const sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        res = await testUtil.rpc(paymentInformationCommand, [paymentInformationUpdateCommand,
            listingItemTemplate.id,
            testData.type,
            testData.itemPrice.currency,
            testData.itemPrice.basePrice,
            testData.itemPrice.shippingPrice.domestic,
            testData.itemPrice.shippingPrice.international,
            testData.itemPrice.cryptocurrencyAddress.address
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new ModelNotModifiableException('ListingItemTemplate').getMessage());
    });

});
