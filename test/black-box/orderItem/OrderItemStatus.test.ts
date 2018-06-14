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
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { OrderStatus } from '../../../src/api/enums/OrderStatus';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';

import { MessageException } from '../../../src/api/exceptions/MessageException';
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
    const templateSubCommand = Commands.TEMPLATE_ADD.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    const imageCommand = Commands.ITEMIMAGE_ROOT.commandName;
    const imageAddCommand = Commands.ITEMIMAGE_ADD.commandName;

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemGetSubCommand = Commands.ITEM_GET.commandName;
    
    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowAddSubCommand = Commands.ESCROW_ADD.commandName;

    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const addressSubCommand = Commands.ADDRESS_ADD.commandName;
    
    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSubCommand = Commands.BID_SEND.commandName;
    const bidSearchSubCommand = Commands.BID_SEARCH.commandName;
    const bidAcceptSubCommand = Commands.BID_ACCEPT.commandName;

    const orderCommand = Commands.ORDER_ROOT.commandName;
    const orderSearchSubCommand = Commands.ORDER_SEARCH.commandName;

    const orderItemCommand = Commands.ORDERITEM_ROOT.commandName;
    const orderItemStatusSubCommand = Commands.ORDERITEM_STATUS.commandName;
    
    let profileId1;
    let profileId2;
    let marketId1;
    let marketId2;
    // let createdAddress;
    let myCategory;
    let listingItemTemplates;
    let createdListingItem;
    let myTemplate;
    let escrow;
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

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

        // IDK Why this is crashing here...
        try {
            await testUtil1.cleanDb();
            await testUtil2.cleanDb();
        } catch (e) {
            //
        }

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
        expect(myCategory.error).toBe(null);
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
        {
            const templateGetRes: any = await testUtil1.rpc(templateCommand, [templateGetCommand, myTemplate.id]);
            templateGetRes.expectJson();
            templateGetRes.expectStatusCode(200);
            const result: resources.ListingItemTemplate = templateGetRes.getBody()['result'];
        }

        // Post template to create listing item [copied/modified from buy flow]
        const templatePostRes: any = await testUtil1.rpc(templateCommand, [templatePostCommand, myTemplate.id, marketId1]);
        templatePostRes.expectJson();
        templatePostRes.expectStatusCode(200);
        // make sure we got the expected result from posting the template
        {
            const result: any = templatePostRes.getBody()['result'];
            expect(result.result).toBe('Sent.');
        }

        // Search for item since it's not returned by the template post command
        createdListingItem = await testUtil2.rpcWaitFor(
            itemCommand,
            [itemGetSubCommand, myTemplate.hash],
            60 * 60,
            200,
            'hash',
            myTemplate.hash
        );
        // throw new MessageException(JSON.stringify(createdListingItem, null, 2));
        createdListingItem.expectJson();
        expect(createdListingItem.error).toBe(null);
        createdListingItem.expectStatusCode(200);
        createdListingItem = createdListingItem.getBody()['result'];

        // throw new MessageException('createdListingItem = ' + JSON.stringify(createdListingItem, null, 2));

        // Create an address for the bid
        myAddress = await testUtil2.rpc(addressCommand, [addressSubCommand, profileId2, shippingAddress.firstName, shippingAddress.lastName, shippingAddress.title,
                              shippingAddress.addressLine1, shippingAddress.addressLine2, shippingAddress.city,
                              shippingAddress.state, shippingAddress.country, shippingAddress.zipCode]);
        myAddress.expectJson();
        expect(myAddress.error).toBe(null);
        myAddress.expectStatusCode(200);
        myAddress = myAddress.getBody()['result'];
    });

    test('Should return an empty list', async () => {
        const orderItemStatusRes = await testUtil2.rpc(orderItemCommand, [
            orderItemStatusSubCommand
        ]);

        orderItemStatusRes.expectJson();
        expect(orderItemStatusRes.error).toBe(null);
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // throw new MessageException('myOrderItems = ' + JSON.stringify(myOrderItems, null, 2));

        // Check we receive nothing
        expect(myOrderItems.length).toBe(0);
    });

    test('Should show order that has been bidded upon', async () => {
        // Create a bid
        let bidSendRes = await testUtil2.rpc(bidCommand, [bidSubCommand, /*createdListingItem.hash,*/ myTemplate.hash, profileId2, myAddress.id]);
        bidSendRes.expectJson();
        expect(bidSendRes.error).toBe(null);
        bidSendRes.expectStatusCode(200);
        bidSendRes = bidSendRes.getBody()['result'];
        expect(bidSendRes.result).toBe('Sent.');

        // Check for bid locally
        myBid = await testUtil2.rpc(bidCommand, [bidSearchSubCommand, /*createdListingItem.hash,*/ myTemplate.hash, BidMessageType.MPA_BID, SearchOrder.ASC, defaultProfile2.address]);
        myBid.expectJson();
        expect(myBid.error).toBe(null);
        myBid.expectStatusCode(200);
        // myBid = myBid.getBody()['result'][0];

        // Check for bid on seller
        myBid = await testUtil1.rpcWaitFor(
            bidCommand,
            [bidSearchSubCommand, myTemplate.hash, BidMessageType.MPA_BID, SearchOrder.ASC, defaultProfile2.address],
            60 * 60,
            200,
            '[0].action',
            BidMessageType.MPA_BID.toString()
        );
        myBid.expectJson();
        expect(myBid.error).toBe(null);
        myBid.expectStatusCode(200);
        myBid = myBid.getBody()['result'][0];
        expect(myBid.ListingItem.hash).toBe(myTemplate.hash);

        const orderItemStatusRes = await testUtil2.rpc(orderItemCommand, [
            orderItemStatusSubCommand
        ]);

        orderItemStatusRes.expectJson();
        expect(orderItemStatusRes.error).toBe(null);
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was bid upon
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(myTemplate.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_BID);
    });

    test('Should show order that has been accepted', async () => {
        // Create an order from the bid
        const myOrderSend = await testUtil1.rpc(bidCommand, [bidAcceptSubCommand, /*createdListingItem.hash,*/ myTemplate.hash, myBid.id]);
        myOrderSend.expectJson();
        expect(myOrderSend.error).toBe(null);
        myOrderSend.expectStatusCode(200);

        myOrder = await testUtil2.rpcWaitFor(
            orderCommand,
            [orderSearchSubCommand, /*createdListingItem.hash,*/ myTemplate.hash, OrderStatus.AWAITING_ESCROW, defaultProfile2.address, defaultProfile1.address, SearchOrder.ASC],
            60 * 60,
            200,
            // '[0].hash',
            // OrderStatus.AWAITING_ESCROW.toString()
            '[0].OrderItems[0].itemHash',
             myTemplate.hash
        );
        // myOrder = await testUtil1.rpc(orderCommand, [orderSearchSubCommand, /*createdListingItem.hash,*/ myTemplate.hash, OrderStatus.AWAITING_ESCROW, profileId2, SearchOrder.ASC]);
        myOrder.expectJson();
        expect(myOrder.error).toBe(null);
        myOrder.expectStatusCode(200);
        myOrder = myOrder.getBody()['result'][0];

        // throw new MessageException('myOrder = ' + JSON.stringify(myOrder, null, 2));

        const orderItemStatusRes = await testUtil2.rpc(orderItemCommand, [
            orderItemStatusSubCommand
        ]);

        orderItemStatusRes.expectJson();
        expect(orderItemStatusRes.error).toBe(null);
        orderItemStatusRes.expectStatusCode(200);
        const myOrderItems = orderItemStatusRes.getBody()['result'];

        // Check we receive order that was accepted
        expect(myOrderItems.length).toBe(1);
        expect(myOrderItems[0].listingItemHash).toBe(myTemplate.hash);
        expect(myOrderItems[0].bidType).toBe(BidMessageType.MPA_ACCEPT);
    });
});
