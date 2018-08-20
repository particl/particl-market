// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { GenerateBidParams } from '../../../src/api/requests/params/GenerateBidParams';
import { GenerateOrderParams } from '../../../src/api/requests/params/GenerateOrderParams';
import { TestDataGenerateRequest } from '../../../src/api/requests/TestDataGenerateRequest';
import * as resources from 'resources';

// Ryno
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { AddressType } from '../../../src/api/enums/AddressType';
import { OrderStatus } from '../../../src/api/enums/OrderStatus';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

import { SearchOrder } from '../../../src/api/enums/SearchOrder';

describe('OrderItemStatus', () => {
    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil1 = new BlackBoxTestUtil(randomBoolean ? 1 : 2);  // SELLER
    const testUtil2 = new BlackBoxTestUtil(randomBoolean ? 2 : 1);

    const lockCommand = Commands.ESCROW_LOCK.commandName;

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categorySearchSubCommand = Commands.CATEGORY_SEARCH.commandName;

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateAddCommand = Commands.TEMPLATE_ADD.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const addressAddCommand = Commands.ADDRESS_ADD.commandName;

    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSendCommand = Commands.BID_SEND.commandName;
    const bidSearchCommand = Commands.BID_SEARCH.commandName;
    const bidAcceptCommand = Commands.BID_ACCEPT.commandName;

    const orderCommand = Commands.ORDER_ROOT.commandName;
    const orderSearchCommand = Commands.ORDER_SEARCH.commandName;

    const orderItemCommand = Commands.ORDERITEM_ROOT.commandName;
    const orderItemStatusCommand = Commands.ORDERITEM_STATUS.commandName;

    let profileId1;
    let profileId2;
    let marketId1;
    let marketId2;
    // let createdAddress;
    let myCategory;
    // let listingItemTemplates;
    let createdListingItem;
    let myTemplate;
    // let escrow;
    let myBid;
    let myOrder;
    let myAddress;

    let defaultProfile1;
    let defaultProfile2;
    let defaultMarket1;
    let defaultMarket2;

    const shippingAddress = {
        firstName: 'Johnny',
        lastName: 'Depp',
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001',
        type: AddressType.SHIPPING_OWN
    };

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDERING = SearchOrder.ASC;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

        await testUtil1.cleanDb();
        await testUtil2.cleanDb();

        defaultProfile1 = await testUtil1.getDefaultProfile();
        profileId1 = defaultProfile1.id;
        defaultProfile2 = await testUtil2.getDefaultProfile();
        profileId2 = defaultProfile2.id;
        // throw new MessageException('defaultProfile2 = ' + JSON.stringify(defaultProfile2));
        defaultMarket1 = await testUtil1.getDefaultMarket();
        marketId1 = defaultProfile1.id;
        defaultMarket2 = await testUtil2.getDefaultMarket();
        marketId2 = defaultProfile2.id;

        // Get category
        myCategory = await testUtil1.rpc(categoryCommand, [categorySearchSubCommand, 'luxury']);
        myCategory.expectJson();
        myCategory.expectStatusCode(200);
        myCategory = myCategory.getBody()['result'][0];

        // Create template
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            true,       // generateMessagingInformation
            false,       // generateListingItemObjects
            false,       // generateObjectDatas
            profileId1, // profileId
            false,      // generateListingItem
            marketId1   // marketId
        ]).toParamsArray();

        // generate listingItemTemplate
        myTemplate = await testUtil1.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        expect(myTemplate).toBeDefined();
        expect(myTemplate[0]).toBeDefined();
        myTemplate = myTemplate[0];
        expect(myTemplate.id).toBeDefined();

        // we should be also able to get the template
        const templateGetRes: any = await testUtil1.rpc(templateCommand, [templateGetCommand, myTemplate.id]);
        templateGetRes.expectJson();
        templateGetRes.expectStatusCode(200);
        const result: resources.ListingItemTemplate = templateGetRes.getBody()['result'];

        // Post template to create listing item [copied/modified from buy flow]
        const templatePostRes: any = await testUtil1.rpc(templateCommand, [templatePostCommand, myTemplate.id, marketId1]);
        templatePostRes.expectJson();
        templatePostRes.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        const postResult: any = templatePostRes.getBody()['result'];
        expect(postResult.result).toBe('Sent.');

        // Search for item since it's not returned by the template post command
        createdListingItem = await testUtil2.rpcWaitFor(
            itemCommand,
            [itemGetCommand, myTemplate.hash],
            60 * 60,
            200,
            'hash',
            myTemplate.hash
        );
        // throw new MessageException(JSON.stringify(createdListingItem, null, 2));
        createdListingItem.expectJson();
        createdListingItem.expectStatusCode(200);
        createdListingItem = createdListingItem.getBody()['result'];

        // throw new MessageException('createdListingItem = ' + JSON.stringify(createdListingItem, null, 2));

        // Create an address for the bid
        myAddress = await testUtil2.rpc(addressCommand, [addressAddCommand, profileId2, shippingAddress.firstName,
            shippingAddress.lastName, shippingAddress.title, shippingAddress.addressLine1, shippingAddress.addressLine2,
            shippingAddress.city, shippingAddress.state, shippingAddress.country, shippingAddress.zipCode]);
        myAddress.expectJson();
        myAddress.expectStatusCode(200);
        myAddress = myAddress.getBody()['result'];
    });

    test('Should return an empty list', async () => {
        const orderItemStatusRes = await testUtil2.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // throw new MessageException('myOrderItems = ' + JSON.stringify(myOrderItems, null, 2));

        // Check we receive nothing
        expect(myOrderItems.length).toBe(0);
    });

    // todo: split into separate tests
    test('Should show order that has been bidded upon', async () => {
        // Create a bid
        let bidSendRes = await testUtil2.rpc(bidCommand, [
            bidSendCommand,
            myTemplate.hash,
            profileId2,
            myAddress.id
        ]);
        bidSendRes.expectJson();
        bidSendRes.expectStatusCode(200);
        bidSendRes = bidSendRes.getBody()['result'];
        expect(bidSendRes.result).toBe('Sent.');

        // Check for bid locally
        myBid = await testUtil2.rpc(bidCommand, [
            bidSearchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            myTemplate.hash,
            BidMessageType.MPA_BID,
            '*',
            defaultProfile2.address
        ]);
        myBid.expectJson();
        myBid.expectStatusCode(200);


        // Check for bid on seller
        myBid = await testUtil1.rpcWaitFor(bidCommand, [
                bidSearchCommand,
                PAGE, PAGE_LIMIT, ORDERING,
                myTemplate.hash,
                BidMessageType.MPA_BID,
                '*',
                defaultProfile2.address
            ],
            60 * 60,
            200,
            '[0].action',
            BidMessageType.MPA_BID.toString()
        );
        myBid.expectJson();
        myBid.expectStatusCode(200);

        myBid = myBid.getBody()['result'][0];
        expect(myBid.ListingItem.hash).toBe(myTemplate.hash);

        const orderItemStatusRes = await testUtil2.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);

        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(myTemplate.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_BID);
    });

    test('Should show order that has been accepted', async () => {
        // Create an order from the bid
        const myOrderSend = await testUtil1.rpc(bidCommand, [
            bidAcceptCommand,
            myTemplate.hash,
            myBid.id
        ]);
        myOrderSend.expectJson();
        myOrderSend.expectStatusCode(200);

        myOrder = await testUtil2.rpcWaitFor(orderCommand, [
                orderSearchCommand,
                myTemplate.hash,
                OrderStatus.AWAITING_ESCROW,
                defaultProfile2.address,
                defaultProfile1.address,
                SearchOrder.ASC
            ],
            60 * 60,
            200,
            // '[0].hash',
            // OrderStatus.AWAITING_ESCROW.toString()
            '[0].OrderItems[0].itemHash',
             myTemplate.hash
        );

        myOrder.expectJson();
        myOrder.expectStatusCode(200);
        myOrder = myOrder.getBody()['result'][0];

        const orderItemStatusRes = await testUtil2.rpc(orderItemCommand, [
            orderItemStatusCommand
        ]);

        orderItemStatusRes.expectJson();
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was accepted
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(myTemplate.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_ACCEPT);
    });
});
