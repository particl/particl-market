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

describe('OrderItemStatusCommand', () => {
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
    const escrowLockSubCommand = Commands.ESCROW_LOCK.commandName;

    const addressCommand = Commands.ADDRESS_ROOT.commandName;
    const addressSubCommand = Commands.ADDRESS_ADD.commandName;
    
    const bidCommand = Commands.BID_ROOT.commandName;
    const bidSubCommand = Commands.BID_SEND.commandName;
    const bidSearchSubCommand = Commands.BID_SEARCH.commandName;
    const bidAcceptSubCommand = Commands.BID_ACCEPT.commandName;

    const orderCommand = Commands.ORDER_ROOT.commandName;
    const orderSearchSubCommand = Commands.ORDER_SEARCH.commandName;
    
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
            await testUtil2.cleanDb();
        } catch (e) {
            //
        }

        const defaultProfile1 = await testUtil1.getDefaultProfile();
        profileId1 = defaultProfile1.id;
        const defaultProfile2 = await testUtil2.getDefaultProfile();
        profileId2 = defaultProfile2.id;
        // throw new MessageException('defaultProfile2 = ' + JSON.stringify(defaultProfile2));
        const defaultMarket1 = await testUtil1.getDefaultMarket();
        marketId1 = defaultProfile1.id;
        const defaultMarket2 = await testUtil2.getDefaultMarket();
        marketId2 = defaultProfile2.id;

        // Get category
        myCategory = await testUtil1.rpc(categoryCommand, [categorySearchSubCommand, 'luxury']);
        myCategory.expectJson();
        expect(myCategory.error).toBe(null);
        myCategory.expectStatusCode(200);
        myCategory = myCategory.getBody()['result'][0];

        // Create template
        // TODO: Gotta generate a listing item template somehow
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

        // add image
        /*{
            const base64Image = await testUtil1.getRandomBase64Image();
            const imageAddRes: any = await testUtil1.rpc(imageCommand, [
                imageAddCommand,
                myTemplate.id,
                'uniqueid',
                ImageDataProtocolType.LOCAL,
                'BASE64',
                base64Image
            ]);
            imageAddRes.expectJson();
            imageAddRes.expectStatusCode(200);
            const imageResult: resources.ListingItemTemplate = imageAddRes.getBody()['result'];
        }*/

        //  throw new MessageException('myTemplate = ' + JSON.stringify(myTemplate, null, 2));

        // Create escrow
        // Not required because data generate creates escrow
        /*escrow = await testUtil1.rpc(escrowCommand, [escrowAddSubCommand, myTemplate.id, EscrowType.MAD, 1.0, 1.0])
        escrow.expectJson();
        expect(escrow.error).toBe(null);
        escrow.expectStatusCode(200);
        escrow = escrow.getBody()['result'];*/

        // Create post template to create listing item
        /*let templatePostRes = await testUtil1.rpc(templateCommand, [templatePostSubCommand, myTemplate.id, marketId1]);
        templatePostRes.expectJson();
        expect(templatePostRes.error).toBe(null);
        templatePostRes.expectStatusCode(200);
        {
            const result: any = templatePostRes.getBody()['result'];
            expect(result.result).toBe('Sent.');
        }*/

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

        // throw new MessageException('createdListingItem = ' + JSON.stringify(createdListingItem, null, 2));

        // Create a bid
        let bidSendRes = await testUtil2.rpc(bidCommand, [bidSubCommand, /*createdListingItem.hash,*/ myTemplate.hash, profileId2, myAddress.id // ,
            // 'rawtx', 'a00000000000020c7333168e97e67bf278e04343178b2c368f4fba0b07cdc213bacc3e3845adb70100000000ffffffff5c70bd29c6a2049781907d7920d20b1e3ffb76f1d44d121eb07e198995bdac910000000000ffffffff0301375c8c610100000017a9143a8b5e616edc983a94a8ecd4b16b17c6180478e28701e36350bf390000001976a9142208a47ce301330b8dd9598880336cecff6a003f88ac01cb1097bdd00100001976a9142740d5e099f5542f64748cf7ef6a138d753aa38188ac0248304502210097acb0245bb135d02d2277ce7182ec2f41cb8830d6681caf288ac47ce3465fd402203122066499ea901673fe0adfcb0ea64e9e33584f864134a7d9cac2b5cc9c3727012103fb1823abc67cd8ed769d03d59fc0c8fc39f7d8455d98e09cc7d8b41a7e0d83a200',
            // 'address', 'pejYH4pzr6WV7VDJ243KQywNsPaqZwDWbv'
        ]);
        bidSendRes.expectJson();
        expect(bidSendRes.error).toBe(null);
        bidSendRes.expectStatusCode(200);
        bidSendRes = bidSendRes.getBody()['result'];
        expect(bidSendRes.result).toBe('Sent.');


        // RPC waitfor again here?

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

        // throw new MessageException('myBid = ' + JSON.stringify(myBid, null, 2));

        // throw new MessageException('myBid = ' + JSON.stringify(myBid.id, null, 2));
        // throw new MessageException('myBid = ' + bidCommand + ' ' + bidAcceptSubCommand + ' ' + createdListingItem.hash);

        // TODO: Figure out why it says not my item

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

        // const generateOrderParams = new GenerateOrderParams([
        //     true,   // generate generateListingItemTemplate, generate a ListingItemTemplate
        //     true,   // generate generateListingItem, generate a ListingItem
        //     true,   // generate generateBid, generate a Bid
        //     createdListingItem.id,   // generate listingItemhash, attach bid to existing ListingItem
        //     bidSendRes.id // true,   // generate bidId, attach Order to existing Bid
        //     // bid.address, // true,   // generate bidder, bidders address
        //     // createdListingItem.seller // true,   // generate listingItemSeller, ListingItem sellers address
        // ]).toParamsArray();

        // const orders = await testUtil2.generateData(
        //     CreatableModel.ORDER,       // what to generate
        //     1,                          // how many to generate
        //     true,                       // return model
        //     generateOrderParams   // what kind of data to generate
        // ) as Order[];
        // order = orders[0];
    });

    test('Should fail Escrow Lock because missing params', async () => {
        const escrowLockRes = await testUtil2.rpc(escrowCommand, [
            escrowLockSubCommand
        ]);

        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(500);
    });

    test('Should fail Escrow Lock because non-existent bid', async () => {
        const escrowLockRes = await testUtil2.rpc(escrowCommand, [
            escrowLockSubCommand,
            'someFakeHash'
        ]);

        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(404);
    });

    test('Should fail Escrow Lock because non-existent bid', async () => {
        const escrowLockRes = await testUtil2.rpc(escrowCommand, [
            escrowLockSubCommand,
            1234
        ]);

        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(404);
    });

    // test('Should fail Escrow Lock', async () => {
       // throw new MessageException('createdListingItem = ' + JSON.stringify(createdListingItem, null, 2));
       /*const escrowLockTestData = {
            itemhash: createdListingItem.hash,
            nonce: 'TEST NONCE',
            memo: 'TEST MEMO'
        };

        const escrowLockRes = await testUtil2.rpc('escrow', [
            'lock',
            // createdListingItem.ItemInformation.id,
            // createdListingItem.hash,
            myOrder.hash,
            escrowLockTestData.nonce,
            escrowLockTestData.memo
        ]);

//        const escrowLockRes = await rpc('escrow', [
//            'lock',
//            createdListingItem.hash,
//            escrowLockTestData.nonce,
//            escrowLockTestData.memo
//        ]);

        escrowLockRes.expectJson();
        // TODO: Proper way of checking error??
        expect(escrowLockRes.getBody().error.message).toBe('No valid information to finalize escrow');

        escrowLockRes.expectStatusCode(404);*/
        // throw new MessageException('myOrder = ' + JSON.stringify(myOrder, null, 2));
    // });

    // TODO: Maybe a test where seller tries to lock escrow?

    test('Should lock Escrow', async () => {
        const escrowLockTestData = {
            itemhash: createdListingItem.hash,
            nonce: 'TEST NONCE',
            memo: 'TEST MEMO'
        };

        // tslint:disable:max-line-length
        // create bid
        /*const bid = await testUtil1.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_ACCEPT,
            bidDatas: [
                // TODO: Move to test data file
                { dataId: 'pubkeys', dataValue: [
                    '02dcd01e1c1bde4d5f8eff82cde60017f81ac1c2888d04f47a31660004fe8d4bb7',
                    '035059134217aec66013c46db3ef62a1e7523fc962d2560858cd16d9c0032b113f'
                ] },
                { dataId: 'rawtx', dataValue: 'a00000000000020c7333168e97e67bf278e04343178b2c368f4fba0b07cdc213bacc3e3845adb70100000000ffffffff5c70bd29c6a2049781907d7920d20b1e3ffb76f1d44d121eb07e198995bdac910000000000ffffffff0301375c8c610100000017a9143a8b5e616edc983a94a8ecd4b16b17c6180478e28701e36350bf390000001976a9142208a47ce301330b8dd9598880336cecff6a003f88ac01cb1097bdd00100001976a9142740d5e099f5542f64748cf7ef6a138d753aa38188ac0248304502210097acb0245bb135d02d2277ce7182ec2f41cb8830d6681caf288ac47ce3465fd402203122066499ea901673fe0adfcb0ea64e9e33584f864134a7d9cac2b5cc9c3727012103fb1823abc67cd8ed769d03d59fc0c8fc39f7d8455d98e09cc7d8b41a7e0d83a200' },
                { dataId: 'address', dataValue: 'pejYH4pzr6WV7VDJ243KQywNsPaqZwDWbv' }
            ],
            bidder: 'Anything',
            address: shippingAddress,
            listing_item_id: createdListingItem.id
        });
        bid.expectJson();
        expect(bid.error).toBe(null);
        bid.expectStatusCode(200);*/
        // tslint:enable:max-line-length

        const escrowLockRes = await testUtil2.rpc(escrowCommand, [
            escrowLockSubCommand,
            // myOrder.OrderItems[0].itemHash
            myOrder.id
            // myOrder.hash
            /*,escrowLockTestData.nonce,
            escrowLockTestData.memo*/
        ]);

        escrowLockRes.expectStatusCode(200);
    });


});
