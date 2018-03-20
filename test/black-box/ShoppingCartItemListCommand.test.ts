import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';

describe('ShoppingCartItemListCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.SHOPPINGCARTITEM_ROOT.commandName;
    const subCommand = Commands.SHOPPINGCARTITEM_LIST.commandName;

    let defaultShoppingCart;
    let listingItems;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultShoppingCart = defaultProfile.ShoppingCart[0];
        // listing-item
        listingItems = await testUtil.generateData(CreatableModel.LISTINGITEM, 2);
    });

    test('Should get blank shopping cart items', async () => {
        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should get one shopping cart item', async () => {
        // add lisgingItem to shoppingCart
        const resAdd = await rpc(method, [Commands.SHOPPINGCARTITEM_ADD.commandName, defaultShoppingCart.id, listingItems[0].id]);
        resAdd.expectJson();
        resAdd.expectStatusCode(200);

        // get list of shoppingCartItems
        const res = await rpc(method, [subCommand, defaultShoppingCart.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        // expect(result[0]).toBe(123);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemCategory).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemLocation).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemLocation.LocationMarker).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemImages).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemImages[0].ItemImageDatas).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.Escrow).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.Escrow.Ratio).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.ItemPrice).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.ItemPrice.ShippingPrice).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
    });


    test('Should get two shopping cart item', async () => {
        // add lisgingItem to shoppingCart
        const resAdd2 = await rpc(method, [Commands.SHOPPINGCARTITEM_ADD.commandName, defaultShoppingCart.id, listingItems[1].id]);
        resAdd2.expectJson();
        resAdd2.expectStatusCode(200);

        // get list of shoppingCartItems
        const res = await rpc(method, [subCommand, defaultShoppingCart.id, true]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemCategory).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemLocation).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemLocation.LocationMarker).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemImages).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ItemImages[0].ItemImageDatas).toBeDefined();
        expect(result[0].ListingItem.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.Escrow).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.Escrow.Ratio).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.ItemPrice).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.ItemPrice.ShippingPrice).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();


        expect(result[1].ListingItem).toBeDefined();
        expect(result[1].ListingItem.ItemInformation).toBeDefined();
        expect(result[1].ListingItem.ItemInformation.ItemCategory).toBeDefined();
        expect(result[1].ListingItem.ItemInformation.ItemLocation).toBeDefined();
        expect(result[1].ListingItem.ItemInformation.ItemLocation.LocationMarker).toBeDefined();
        expect(result[1].ListingItem.ItemInformation.ItemImages).toBeDefined();
        expect(result[1].ListingItem.ItemInformation.ItemImages[0].ItemImageDatas).toBeDefined();
        expect(result[1].ListingItem.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation.Escrow).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation.Escrow.Ratio).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation.ItemPrice).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation.ItemPrice.ShippingPrice).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress).toBeDefined();
        expect(result[1].ListingItem.MessagingInformation).toBeDefined();
        expect(result[1].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[1].ListingItem.Bids).toBeDefined();
        expect(result[1].ListingItem.Market).toBeDefined();
        expect(result[1].ListingItem.FlaggedItem).toBeDefined();
    });
});
