"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const Environment_1 = require("../../core/helpers/Environment");
const AddressRootCommand_1 = require("../commands/address/AddressRootCommand");
const AddressListCommand_1 = require("../commands/address/AddressListCommand");
const AddressAddCommand_1 = require("../commands/address/AddressAddCommand");
const AddressUpdateCommand_1 = require("../commands/address/AddressUpdateCommand");
const AddressRemoveCommand_1 = require("../commands/address/AddressRemoveCommand");
const BidRootCommand_1 = require("../commands/bid/BidRootCommand");
const BidSearchCommand_1 = require("../commands/bid/BidSearchCommand");
const BidAcceptCommand_1 = require("../commands/bid/BidAcceptCommand");
const BidCancelCommand_1 = require("../commands/bid/BidCancelCommand");
const BidRejectCommand_1 = require("../commands/bid/BidRejectCommand");
const BidSendCommand_1 = require("../commands/bid/BidSendCommand");
const CurrencyPriceRootCommand_1 = require("../commands/currencyprice/CurrencyPriceRootCommand");
const DaemonRootCommand_1 = require("../commands/daemon/DaemonRootCommand");
const DataAddCommand_1 = require("../commands/data/DataAddCommand");
const DataCleanCommand_1 = require("../commands/data/DataCleanCommand");
const DataGenerateCommand_1 = require("../commands/data/DataGenerateCommand");
const DataRootCommand_1 = require("../commands/data/DataRootCommand");
const EscrowRootCommand_1 = require("../commands/escrow/EscrowRootCommand");
const EscrowAddCommand_1 = require("../commands/escrow/EscrowAddCommand");
const EscrowRemoveCommand_1 = require("../commands/escrow/EscrowRemoveCommand");
const EscrowUpdateCommand_1 = require("../commands/escrow/EscrowUpdateCommand");
const EscrowLockCommand_1 = require("../commands/escrow/EscrowLockCommand");
const EscrowRefundCommand_1 = require("../commands/escrow/EscrowRefundCommand");
const EscrowReleaseCommand_1 = require("../commands/escrow/EscrowReleaseCommand");
const FavoriteRootCommand_1 = require("../commands/favorite/FavoriteRootCommand");
const FavoriteListCommand_1 = require("../commands/favorite/FavoriteListCommand");
const FavoriteAddCommand_1 = require("../commands/favorite/FavoriteAddCommand");
const FavoriteRemoveCommand_1 = require("../commands/favorite/FavoriteRemoveCommand");
const ItemCategoryListCommand_1 = require("../commands/itemcategory/ItemCategoryListCommand");
const ItemCategoryAddCommand_1 = require("../commands/itemcategory/ItemCategoryAddCommand");
const ItemCategorySearchCommand_1 = require("../commands/itemcategory/ItemCategorySearchCommand");
const ItemCategoryGetCommand_1 = require("../commands/itemcategory/ItemCategoryGetCommand");
const ItemCategoryRemoveCommand_1 = require("../commands/itemcategory/ItemCategoryRemoveCommand");
const ItemCategoryUpdateCommand_1 = require("../commands/itemcategory/ItemCategoryUpdateCommand");
const ItemCategoryRootCommand_1 = require("../commands/itemcategory/ItemCategoryRootCommand");
const ItemImageRootCommand_1 = require("../commands/itemimage/ItemImageRootCommand");
const ItemImageListCommand_1 = require("../commands/itemimage/ItemImageListCommand");
const ItemImageAddCommand_1 = require("../commands/itemimage/ItemImageAddCommand");
const ItemImageRemoveCommand_1 = require("../commands/itemimage/ItemImageRemoveCommand");
const ItemInformationAddCommand_1 = require("../commands/iteminformation/ItemInformationAddCommand");
const ItemInformationGetCommand_1 = require("../commands/iteminformation/ItemInformationGetCommand");
const ItemInformationUpdateCommand_1 = require("../commands/iteminformation/ItemInformationUpdateCommand");
const ItemInformationRootCommand_1 = require("../commands/iteminformation/ItemInformationRootCommand");
const ItemLocationRemoveCommand_1 = require("../commands/itemlocation/ItemLocationRemoveCommand");
const ItemLocationAddCommand_1 = require("../commands/itemlocation/ItemLocationAddCommand");
const ItemLocationUpdateCommand_1 = require("../commands/itemlocation/ItemLocationUpdateCommand");
const ItemLocationRootCommand_1 = require("../commands/itemlocation/ItemLocationRootCommand");
const HelpCommand_1 = require("../commands/HelpCommand");
const ListingItemGetCommand_1 = require("../commands/listingitem/ListingItemGetCommand");
const ListingItemSearchCommand_1 = require("../commands/listingitem/ListingItemSearchCommand");
const ListingItemFlagCommand_1 = require("../commands/listingitem/ListingItemFlagCommand");
const ListingItemUpdateCommand_1 = require("../commands/listingitem/ListingItemUpdateCommand");
const ListingItemRootCommand_1 = require("../commands/listingitem/ListingItemRootCommand");
const ListingItemTemplateAddCommand_1 = require("../commands/listingitemtemplate/ListingItemTemplateAddCommand");
const ListingItemTemplateRemoveCommand_1 = require("../commands/listingitemtemplate/ListingItemTemplateRemoveCommand");
const ListingItemTemplateGetCommand_1 = require("../commands/listingitemtemplate/ListingItemTemplateGetCommand");
const ListingItemTemplateSearchCommand_1 = require("../commands/listingitemtemplate/ListingItemTemplateSearchCommand");
const ListingItemTemplatePostCommand_1 = require("../commands/listingitemtemplate/ListingItemTemplatePostCommand");
const ListingItemTemplateRootCommand_1 = require("../commands/listingitemtemplate/ListingItemTemplateRootCommand");
const MarketAddCommand_1 = require("../commands/market/MarketAddCommand");
const MarketRootCommand_1 = require("../commands/market/MarketRootCommand");
const MarketListCommand_1 = require("../commands/market/MarketListCommand");
const MessagingInformationUpdateCommand_1 = require("../commands/messaginginformation/MessagingInformationUpdateCommand");
const MessagingInformationRootCommand_1 = require("../commands/messaginginformation/MessagingInformationRootCommand");
const OrderRootCommand_1 = require("../commands/order/OrderRootCommand");
const OrderSearchCommand_1 = require("../commands/order/OrderSearchCommand");
const PaymentInformationUpdateCommand_1 = require("../commands/paymentinformation/PaymentInformationUpdateCommand");
const PaymentInformationRootCommand_1 = require("../commands/paymentinformation/PaymentInformationRootCommand");
const PriceTickerRootCommand_1 = require("../commands/priceticker/PriceTickerRootCommand");
const ProfileAddCommand_1 = require("../commands/profile/ProfileAddCommand");
const ProfileRemoveCommand_1 = require("../commands/profile/ProfileRemoveCommand");
const ProfileUpdateCommand_1 = require("../commands/profile/ProfileUpdateCommand");
const ProfileGetCommand_1 = require("../commands/profile/ProfileGetCommand");
const ProfileListCommand_1 = require("../commands/profile/ProfileListCommand");
const ProfileRootCommand_1 = require("../commands/profile/ProfileRootCommand");
const ShippingDestinationRootCommand_1 = require("../commands/shippingdestination/ShippingDestinationRootCommand");
const ShippingDestinationListCommand_1 = require("../commands/shippingdestination/ShippingDestinationListCommand");
const ShippingDestinationAddCommand_1 = require("../commands/shippingdestination/ShippingDestinationAddCommand");
const ShippingDestinationRemoveCommand_1 = require("../commands/shippingdestination/ShippingDestinationRemoveCommand");
const ListingItemObjectRootCommand_1 = require("../commands/listingitemobject/ListingItemObjectRootCommand");
const ListingItemObjectSearchCommand_1 = require("../commands/listingitemobject/ListingItemObjectSearchCommand");
const ShoppingCartAddCommand_1 = require("../commands/shoppingcart/ShoppingCartAddCommand");
const ShoppingCartUpdateCommand_1 = require("../commands/shoppingcart/ShoppingCartUpdateCommand");
const ShoppingCartRemoveCommand_1 = require("../commands/shoppingcart/ShoppingCartRemoveCommand");
const ShoppingCartListCommand_1 = require("../commands/shoppingcart/ShoppingCartListCommand");
const ShoppingCartGetCommand_1 = require("../commands/shoppingcart/ShoppingCartGetCommand");
const ShoppingCartClearCommand_1 = require("../commands/shoppingcart/ShoppingCartClearCommand");
const ShoppingCartRootCommand_1 = require("../commands/shoppingcart/ShoppingCartRootCommand");
const ShoppingCartItemAddCommand_1 = require("../commands/shoppingcartitem/ShoppingCartItemAddCommand");
const ShoppingCartItemRemoveCommand_1 = require("../commands/shoppingcartitem/ShoppingCartItemRemoveCommand");
const ShoppingCartItemListCommand_1 = require("../commands/shoppingcartitem/ShoppingCartItemListCommand");
const ShoppingCartItemRootCommand_1 = require("../commands/shoppingcartitem/ShoppingCartItemRootCommand");
// tslint:disable:array-type
// tslint:disable:max-line-length
let RpcCommandFactory = class RpcCommandFactory {
    constructor(daemonRootCommand, bidRootCommand, bidSearchCommand, bidAcceptCommand, bidCancelCommand, bidRejectCommand, bidSendCommand, escrowRootCommand, escrowAddCommand, escrowRemoveCommand, escrowUpdateCommand, escrowLockCommand, escrowRefundCommand, escrowReleaseCommand, favoriteRootCommand, favoriteListCommand, favoriteAddCommand, favoriteRemoveCommand, itemCategoryListCommand, itemCategoryAddCommand, itemCategorySearchCommand, itemCategoryGetCommand, itemCategoryRemoveCommand, itemCategoryUpdateCommand, itemCategoryRootCommand, itemImageRootCommand, itemImageListCommand, itemImageAddCommand, itemImageRemoveCommand, itemInformationAddCommand, itemInformationGetCommand, itemInformationUpdateCommand, itemInformationRootCommand, itemLocationAddCommand, itemLocationRemoveCommand, itemLocationUpdateCommand, itemLocationRootCommand, listingItemGetCommand, listingItemFlagCommand, listingItemSearchCommand, listingItemUpdateCommand, listingItemRootCommand, listingItemTemplateAddCommand, listingItemTemplateRemoveCommand, listingItemTemplateGetCommand, listingItemTemplateSearchCommand, listingItemTemplatePostCommand, listingItemTemplateRootCommand, marketAddCommand, marketRootCommand, marketListCommand, messagingInformationUpdateCommand, messagingInformationRootCommand, orderRootCommand, orderSearchCommand, paymentInformationUpdateCommand, paymentInformationRootCommand, addressRootCommand, addressListCommand, addressAddCommand, addressUpdateCommand, addressRemoveCommand, profileAddCommand, profileRemoveCommand, profileGetCommand, profileUpdateCommand, profileListCommand, profileRootCommand, shippingDestinationRootCommand, shippingDestinationListCommand, shippingDestinationAddCommand, shippingDestinationRemoveCommand, dataAddCommand, dataCleanCommand, dataGenerateCommand, dataRootCommand, listingItemObjectRootCommand, listingItemObjectSearchCommand, shoppingCartAddCommand, shoppingCartUpdateCommand, shoppingCartRemoveCommand, shoppingCartListCommand, shoppingCartGetCommand, shoppingCartClearCommand, shoppingCartRootCommand, shoppingCartItemAddCommand, shoppingCartItemRemoveCommand, shoppingCartItemListCommand, shoppingCartItemRootCommand, priceTickerRootCommand, currencyPriceRootCommand, helpCommand, 
        //  ---
        // @multiInject(Types.Command) public commands: RpcCommand<any>[],
        // @multiInject(Types.Command) @named(Targets.AllCommands) private commands: Array<RpcCommand<any>>,
        // @multiInject(Types.Command) @named('Command') private commands: Command[],
        Logger) {
        this.daemonRootCommand = daemonRootCommand;
        this.bidRootCommand = bidRootCommand;
        this.bidSearchCommand = bidSearchCommand;
        this.bidAcceptCommand = bidAcceptCommand;
        this.bidCancelCommand = bidCancelCommand;
        this.bidRejectCommand = bidRejectCommand;
        this.bidSendCommand = bidSendCommand;
        this.escrowRootCommand = escrowRootCommand;
        this.escrowAddCommand = escrowAddCommand;
        this.escrowRemoveCommand = escrowRemoveCommand;
        this.escrowUpdateCommand = escrowUpdateCommand;
        this.escrowLockCommand = escrowLockCommand;
        this.escrowRefundCommand = escrowRefundCommand;
        this.escrowReleaseCommand = escrowReleaseCommand;
        this.favoriteRootCommand = favoriteRootCommand;
        this.favoriteListCommand = favoriteListCommand;
        this.favoriteAddCommand = favoriteAddCommand;
        this.favoriteRemoveCommand = favoriteRemoveCommand;
        this.itemCategoryListCommand = itemCategoryListCommand;
        this.itemCategoryAddCommand = itemCategoryAddCommand;
        this.itemCategorySearchCommand = itemCategorySearchCommand;
        this.itemCategoryGetCommand = itemCategoryGetCommand;
        this.itemCategoryRemoveCommand = itemCategoryRemoveCommand;
        this.itemCategoryUpdateCommand = itemCategoryUpdateCommand;
        this.itemCategoryRootCommand = itemCategoryRootCommand;
        this.itemImageRootCommand = itemImageRootCommand;
        this.itemImageListCommand = itemImageListCommand;
        this.itemImageAddCommand = itemImageAddCommand;
        this.itemImageRemoveCommand = itemImageRemoveCommand;
        this.itemInformationAddCommand = itemInformationAddCommand;
        this.itemInformationGetCommand = itemInformationGetCommand;
        this.itemInformationUpdateCommand = itemInformationUpdateCommand;
        this.itemInformationRootCommand = itemInformationRootCommand;
        this.itemLocationAddCommand = itemLocationAddCommand;
        this.itemLocationRemoveCommand = itemLocationRemoveCommand;
        this.itemLocationUpdateCommand = itemLocationUpdateCommand;
        this.itemLocationRootCommand = itemLocationRootCommand;
        this.listingItemGetCommand = listingItemGetCommand;
        this.listingItemFlagCommand = listingItemFlagCommand;
        this.listingItemSearchCommand = listingItemSearchCommand;
        this.listingItemUpdateCommand = listingItemUpdateCommand;
        this.listingItemRootCommand = listingItemRootCommand;
        this.listingItemTemplateAddCommand = listingItemTemplateAddCommand;
        this.listingItemTemplateRemoveCommand = listingItemTemplateRemoveCommand;
        this.listingItemTemplateGetCommand = listingItemTemplateGetCommand;
        this.listingItemTemplateSearchCommand = listingItemTemplateSearchCommand;
        this.listingItemTemplatePostCommand = listingItemTemplatePostCommand;
        this.listingItemTemplateRootCommand = listingItemTemplateRootCommand;
        this.marketAddCommand = marketAddCommand;
        this.marketRootCommand = marketRootCommand;
        this.marketListCommand = marketListCommand;
        this.messagingInformationUpdateCommand = messagingInformationUpdateCommand;
        this.messagingInformationRootCommand = messagingInformationRootCommand;
        this.orderRootCommand = orderRootCommand;
        this.orderSearchCommand = orderSearchCommand;
        this.paymentInformationUpdateCommand = paymentInformationUpdateCommand;
        this.paymentInformationRootCommand = paymentInformationRootCommand;
        this.addressRootCommand = addressRootCommand;
        this.addressListCommand = addressListCommand;
        this.addressAddCommand = addressAddCommand;
        this.addressUpdateCommand = addressUpdateCommand;
        this.addressRemoveCommand = addressRemoveCommand;
        this.profileAddCommand = profileAddCommand;
        this.profileRemoveCommand = profileRemoveCommand;
        this.profileGetCommand = profileGetCommand;
        this.profileUpdateCommand = profileUpdateCommand;
        this.profileListCommand = profileListCommand;
        this.profileRootCommand = profileRootCommand;
        this.shippingDestinationRootCommand = shippingDestinationRootCommand;
        this.shippingDestinationListCommand = shippingDestinationListCommand;
        this.shippingDestinationAddCommand = shippingDestinationAddCommand;
        this.shippingDestinationRemoveCommand = shippingDestinationRemoveCommand;
        this.dataAddCommand = dataAddCommand;
        this.dataCleanCommand = dataCleanCommand;
        this.dataGenerateCommand = dataGenerateCommand;
        this.dataRootCommand = dataRootCommand;
        this.listingItemObjectRootCommand = listingItemObjectRootCommand;
        this.listingItemObjectSearchCommand = listingItemObjectSearchCommand;
        this.shoppingCartAddCommand = shoppingCartAddCommand;
        this.shoppingCartUpdateCommand = shoppingCartUpdateCommand;
        this.shoppingCartRemoveCommand = shoppingCartRemoveCommand;
        this.shoppingCartListCommand = shoppingCartListCommand;
        this.shoppingCartGetCommand = shoppingCartGetCommand;
        this.shoppingCartClearCommand = shoppingCartClearCommand;
        this.shoppingCartRootCommand = shoppingCartRootCommand;
        this.shoppingCartItemAddCommand = shoppingCartItemAddCommand;
        this.shoppingCartItemRemoveCommand = shoppingCartItemRemoveCommand;
        this.shoppingCartItemListCommand = shoppingCartItemListCommand;
        this.shoppingCartItemRootCommand = shoppingCartItemRootCommand;
        this.priceTickerRootCommand = priceTickerRootCommand;
        this.currencyPriceRootCommand = currencyPriceRootCommand;
        this.helpCommand = helpCommand;
        this.Logger = Logger;
        this.commands = [];
        this.log = new Logger(__filename);
        this.commands.push(daemonRootCommand);
        this.commands.push(bidRootCommand);
        this.commands.push(bidSearchCommand);
        this.commands.push(bidAcceptCommand);
        this.commands.push(bidCancelCommand);
        this.commands.push(bidRejectCommand);
        this.commands.push(bidSendCommand);
        this.commands.push(escrowRootCommand);
        this.commands.push(escrowAddCommand);
        this.commands.push(escrowRemoveCommand);
        this.commands.push(escrowUpdateCommand);
        this.commands.push(escrowLockCommand);
        this.commands.push(escrowRefundCommand);
        this.commands.push(escrowReleaseCommand);
        this.commands.push(favoriteRootCommand);
        this.commands.push(favoriteListCommand);
        this.commands.push(favoriteAddCommand);
        this.commands.push(favoriteRemoveCommand);
        this.commands.push(itemCategoryListCommand);
        this.commands.push(itemCategoryAddCommand);
        this.commands.push(itemCategorySearchCommand);
        this.commands.push(itemCategoryGetCommand);
        this.commands.push(itemCategoryRemoveCommand);
        this.commands.push(itemCategoryUpdateCommand);
        this.commands.push(itemCategoryRootCommand);
        this.commands.push(itemImageRootCommand);
        this.commands.push(itemImageListCommand);
        this.commands.push(itemImageAddCommand);
        this.commands.push(itemImageRemoveCommand);
        this.commands.push(itemInformationAddCommand);
        this.commands.push(itemInformationGetCommand);
        this.commands.push(itemInformationUpdateCommand);
        this.commands.push(itemInformationRootCommand);
        this.commands.push(itemLocationAddCommand);
        this.commands.push(itemLocationRemoveCommand);
        this.commands.push(itemLocationUpdateCommand);
        this.commands.push(itemLocationRootCommand);
        this.commands.push(listingItemGetCommand);
        this.commands.push(listingItemFlagCommand);
        this.commands.push(listingItemSearchCommand);
        this.commands.push(listingItemUpdateCommand);
        this.commands.push(listingItemRootCommand);
        this.commands.push(listingItemTemplatePostCommand);
        this.commands.push(listingItemTemplateAddCommand);
        this.commands.push(listingItemTemplateRemoveCommand);
        this.commands.push(listingItemTemplateGetCommand);
        this.commands.push(listingItemTemplateSearchCommand);
        this.commands.push(listingItemTemplateRootCommand);
        this.commands.push(marketAddCommand);
        this.commands.push(marketRootCommand);
        this.commands.push(marketListCommand);
        this.commands.push(messagingInformationUpdateCommand);
        this.commands.push(messagingInformationRootCommand);
        this.commands.push(orderRootCommand);
        this.commands.push(orderSearchCommand);
        this.commands.push(paymentInformationUpdateCommand);
        this.commands.push(paymentInformationRootCommand);
        this.commands.push(addressRootCommand);
        this.commands.push(addressListCommand);
        this.commands.push(addressAddCommand);
        this.commands.push(addressUpdateCommand);
        this.commands.push(addressRemoveCommand);
        this.commands.push(profileAddCommand);
        this.commands.push(profileRemoveCommand);
        this.commands.push(profileGetCommand);
        this.commands.push(profileUpdateCommand);
        this.commands.push(profileListCommand);
        this.commands.push(profileRootCommand);
        this.commands.push(shippingDestinationRootCommand);
        this.commands.push(shippingDestinationListCommand);
        this.commands.push(shippingDestinationAddCommand);
        this.commands.push(shippingDestinationRemoveCommand);
        this.commands.push(dataAddCommand);
        this.commands.push(dataCleanCommand);
        this.commands.push(dataGenerateCommand);
        this.commands.push(dataRootCommand);
        this.commands.push(listingItemObjectRootCommand);
        this.commands.push(listingItemObjectSearchCommand);
        this.commands.push(shoppingCartAddCommand);
        this.commands.push(shoppingCartUpdateCommand);
        this.commands.push(shoppingCartRemoveCommand);
        this.commands.push(shoppingCartListCommand);
        this.commands.push(shoppingCartGetCommand);
        this.commands.push(shoppingCartClearCommand);
        this.commands.push(shoppingCartRootCommand);
        this.commands.push(shoppingCartItemAddCommand);
        this.commands.push(shoppingCartItemRemoveCommand);
        this.commands.push(shoppingCartItemListCommand);
        this.commands.push(shoppingCartItemRootCommand);
        this.commands.push(priceTickerRootCommand);
        this.commands.push(currencyPriceRootCommand);
        this.commands.push(helpCommand);
        this.log.debug(this.commands.length + ' commands initialized.');
    }
    /**
     * todo: if requested commandType is rootCommand, the loop through the rootCommands and match using name.
     * this should allow 'links' from subcommands back to root commadns
     *
     * @param commandType
     * @returns {RpcCommandInterface<any>}
     */
    get(commandType) {
        // this.log.debug('Looking for command <' + commandType.toString() + '>');
        for (const commandInstance of this.commands) {
            if (commandInstance.getCommand().toString() === commandType.toString()) {
                // this.log.debug('Found ' + commandInstance.getCommand().toString());
                if (commandType.commandType === Environment_1.EnvironmentType.ALL || Environment_1.Environment.isDevelopment() || Environment_1.Environment.isTest()) {
                    return commandInstance;
                }
                else {
                    // this.log.debug('Environment not correct to get ' + commandInstance.getCommand().toString());
                }
            }
        }
        throw new NotFoundException_1.NotFoundException('Couldn\'t find command <' + commandType.toString() + '>\n');
    }
};
RpcCommandFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Command.daemon.DaemonRootCommand)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Command.bid.BidRootCommand)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Command.bid.BidSearchCommand)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Command.bid.BidAcceptCommand)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Command.bid.BidCancelCommand)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Command.bid.BidRejectCommand)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Command.bid.BidSendCommand)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Command.escrow.EscrowRootCommand)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Command.escrow.EscrowAddCommand)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Command.escrow.EscrowRemoveCommand)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Command.escrow.EscrowUpdateCommand)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(11, inversify_1.named(constants_1.Targets.Command.escrow.EscrowLockCommand)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(12, inversify_1.named(constants_1.Targets.Command.escrow.EscrowRefundCommand)),
    tslib_1.__param(13, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(13, inversify_1.named(constants_1.Targets.Command.escrow.EscrowReleaseCommand)),
    tslib_1.__param(14, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(14, inversify_1.named(constants_1.Targets.Command.favorite.FavoriteRootCommand)),
    tslib_1.__param(15, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(15, inversify_1.named(constants_1.Targets.Command.favorite.FavoriteListCommand)),
    tslib_1.__param(16, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(16, inversify_1.named(constants_1.Targets.Command.favorite.FavoriteAddCommand)),
    tslib_1.__param(17, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(17, inversify_1.named(constants_1.Targets.Command.favorite.FavoriteRemoveCommand)),
    tslib_1.__param(18, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(18, inversify_1.named(constants_1.Targets.Command.itemcategory.ItemCategoryListCommand)),
    tslib_1.__param(19, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(19, inversify_1.named(constants_1.Targets.Command.itemcategory.ItemCategoryAddCommand)),
    tslib_1.__param(20, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(20, inversify_1.named(constants_1.Targets.Command.itemcategory.ItemCategorySearchCommand)),
    tslib_1.__param(21, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(21, inversify_1.named(constants_1.Targets.Command.itemcategory.ItemCategoryGetCommand)),
    tslib_1.__param(22, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(22, inversify_1.named(constants_1.Targets.Command.itemcategory.ItemCategoryRemoveCommand)),
    tslib_1.__param(23, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(23, inversify_1.named(constants_1.Targets.Command.itemcategory.ItemCategoryUpdateCommand)),
    tslib_1.__param(24, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(24, inversify_1.named(constants_1.Targets.Command.itemcategory.ItemCategoryRootCommand)),
    tslib_1.__param(25, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(25, inversify_1.named(constants_1.Targets.Command.itemimage.ItemImageRootCommand)),
    tslib_1.__param(26, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(26, inversify_1.named(constants_1.Targets.Command.itemimage.ItemImageListCommand)),
    tslib_1.__param(27, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(27, inversify_1.named(constants_1.Targets.Command.itemimage.ItemImageAddCommand)),
    tslib_1.__param(28, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(28, inversify_1.named(constants_1.Targets.Command.itemimage.ItemImageRemoveCommand)),
    tslib_1.__param(29, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(29, inversify_1.named(constants_1.Targets.Command.iteminformation.ItemInformationAddCommand)),
    tslib_1.__param(30, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(30, inversify_1.named(constants_1.Targets.Command.iteminformation.ItemInformationGetCommand)),
    tslib_1.__param(31, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(31, inversify_1.named(constants_1.Targets.Command.iteminformation.ItemInformationUpdateCommand)),
    tslib_1.__param(32, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(32, inversify_1.named(constants_1.Targets.Command.iteminformation.ItemInformationRootCommand)),
    tslib_1.__param(33, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(33, inversify_1.named(constants_1.Targets.Command.itemlocation.ItemLocationAddCommand)),
    tslib_1.__param(34, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(34, inversify_1.named(constants_1.Targets.Command.itemlocation.ItemLocationRemoveCommand)),
    tslib_1.__param(35, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(35, inversify_1.named(constants_1.Targets.Command.itemlocation.ItemLocationUpdateCommand)),
    tslib_1.__param(36, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(36, inversify_1.named(constants_1.Targets.Command.itemlocation.ItemLocationRootCommand)),
    tslib_1.__param(37, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(37, inversify_1.named(constants_1.Targets.Command.listingitem.ListingItemGetCommand)),
    tslib_1.__param(38, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(38, inversify_1.named(constants_1.Targets.Command.listingitem.ListingItemFlagCommand)),
    tslib_1.__param(39, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(39, inversify_1.named(constants_1.Targets.Command.listingitem.ListingItemSearchCommand)),
    tslib_1.__param(40, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(40, inversify_1.named(constants_1.Targets.Command.listingitem.ListingItemUpdateCommand)),
    tslib_1.__param(41, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(41, inversify_1.named(constants_1.Targets.Command.listingitem.ListingItemRootCommand)),
    tslib_1.__param(42, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(42, inversify_1.named(constants_1.Targets.Command.listingitemtemplate.ListingItemTemplateAddCommand)),
    tslib_1.__param(43, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(43, inversify_1.named(constants_1.Targets.Command.listingitemtemplate.ListingItemTemplateRemoveCommand)),
    tslib_1.__param(44, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(44, inversify_1.named(constants_1.Targets.Command.listingitemtemplate.ListingItemTemplateGetCommand)),
    tslib_1.__param(45, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(45, inversify_1.named(constants_1.Targets.Command.listingitemtemplate.ListingItemTemplateSearchCommand)),
    tslib_1.__param(46, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(46, inversify_1.named(constants_1.Targets.Command.listingitemtemplate.ListingItemTemplatePostCommand)),
    tslib_1.__param(47, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(47, inversify_1.named(constants_1.Targets.Command.listingitemtemplate.ListingItemTemplateRootCommand)),
    tslib_1.__param(48, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(48, inversify_1.named(constants_1.Targets.Command.market.MarketAddCommand)),
    tslib_1.__param(49, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(49, inversify_1.named(constants_1.Targets.Command.market.MarketRootCommand)),
    tslib_1.__param(50, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(50, inversify_1.named(constants_1.Targets.Command.market.MarketListCommand)),
    tslib_1.__param(51, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(51, inversify_1.named(constants_1.Targets.Command.messaginginformation.MessagingInformationUpdateCommand)),
    tslib_1.__param(52, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(52, inversify_1.named(constants_1.Targets.Command.messaginginformation.MessagingInformationRootCommand)),
    tslib_1.__param(53, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(53, inversify_1.named(constants_1.Targets.Command.order.OrderRootCommand)),
    tslib_1.__param(54, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(54, inversify_1.named(constants_1.Targets.Command.order.OrderSearchCommand)),
    tslib_1.__param(55, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(55, inversify_1.named(constants_1.Targets.Command.paymentinformation.PaymentInformationUpdateCommand)),
    tslib_1.__param(56, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(56, inversify_1.named(constants_1.Targets.Command.paymentinformation.PaymentInformationRootCommand)),
    tslib_1.__param(57, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(57, inversify_1.named(constants_1.Targets.Command.address.AddressRootCommand)),
    tslib_1.__param(58, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(58, inversify_1.named(constants_1.Targets.Command.address.AddressListCommand)),
    tslib_1.__param(59, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(59, inversify_1.named(constants_1.Targets.Command.address.AddressAddCommand)),
    tslib_1.__param(60, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(60, inversify_1.named(constants_1.Targets.Command.address.AddressUpdateCommand)),
    tslib_1.__param(61, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(61, inversify_1.named(constants_1.Targets.Command.address.AddressRemoveCommand)),
    tslib_1.__param(62, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(62, inversify_1.named(constants_1.Targets.Command.profile.ProfileAddCommand)),
    tslib_1.__param(63, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(63, inversify_1.named(constants_1.Targets.Command.profile.ProfileRemoveCommand)),
    tslib_1.__param(64, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(64, inversify_1.named(constants_1.Targets.Command.profile.ProfileGetCommand)),
    tslib_1.__param(65, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(65, inversify_1.named(constants_1.Targets.Command.profile.ProfileUpdateCommand)),
    tslib_1.__param(66, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(66, inversify_1.named(constants_1.Targets.Command.profile.ProfileListCommand)),
    tslib_1.__param(67, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(67, inversify_1.named(constants_1.Targets.Command.profile.ProfileRootCommand)),
    tslib_1.__param(68, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(68, inversify_1.named(constants_1.Targets.Command.shippingdestination.ShippingDestinationRootCommand)),
    tslib_1.__param(69, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(69, inversify_1.named(constants_1.Targets.Command.shippingdestination.ShippingDestinationListCommand)),
    tslib_1.__param(70, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(70, inversify_1.named(constants_1.Targets.Command.shippingdestination.ShippingDestinationAddCommand)),
    tslib_1.__param(71, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(71, inversify_1.named(constants_1.Targets.Command.shippingdestination.ShippingDestinationRemoveCommand)),
    tslib_1.__param(72, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(72, inversify_1.named(constants_1.Targets.Command.data.DataAddCommand)),
    tslib_1.__param(73, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(73, inversify_1.named(constants_1.Targets.Command.data.DataCleanCommand)),
    tslib_1.__param(74, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(74, inversify_1.named(constants_1.Targets.Command.data.DataGenerateCommand)),
    tslib_1.__param(75, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(75, inversify_1.named(constants_1.Targets.Command.data.DataRootCommand)),
    tslib_1.__param(76, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(76, inversify_1.named(constants_1.Targets.Command.listingitemobject.ListingItemObjectRootCommand)),
    tslib_1.__param(77, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(77, inversify_1.named(constants_1.Targets.Command.listingitemobject.ListingItemObjectSearchCommand)),
    tslib_1.__param(78, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(78, inversify_1.named(constants_1.Targets.Command.shoppingcart.ShoppingCartAddCommand)),
    tslib_1.__param(79, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(79, inversify_1.named(constants_1.Targets.Command.shoppingcart.ShoppingCartUpdateCommand)),
    tslib_1.__param(80, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(80, inversify_1.named(constants_1.Targets.Command.shoppingcart.ShoppingCartRemoveCommand)),
    tslib_1.__param(81, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(81, inversify_1.named(constants_1.Targets.Command.shoppingcart.ShoppingCartListCommand)),
    tslib_1.__param(82, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(82, inversify_1.named(constants_1.Targets.Command.shoppingcart.ShoppingCartGetCommand)),
    tslib_1.__param(83, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(83, inversify_1.named(constants_1.Targets.Command.shoppingcart.ShoppingCartClearCommand)),
    tslib_1.__param(84, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(84, inversify_1.named(constants_1.Targets.Command.shoppingcart.ShoppingCartRootCommand)),
    tslib_1.__param(85, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(85, inversify_1.named(constants_1.Targets.Command.shoppingcartitem.ShoppingCartItemAddCommand)),
    tslib_1.__param(86, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(86, inversify_1.named(constants_1.Targets.Command.shoppingcartitem.ShoppingCartItemRemoveCommand)),
    tslib_1.__param(87, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(87, inversify_1.named(constants_1.Targets.Command.shoppingcartitem.ShoppingCartItemListCommand)),
    tslib_1.__param(88, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(88, inversify_1.named(constants_1.Targets.Command.shoppingcartitem.ShoppingCartItemRootCommand)),
    tslib_1.__param(89, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(89, inversify_1.named(constants_1.Targets.Command.priceticker.PriceTickerRootCommand)),
    tslib_1.__param(90, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(90, inversify_1.named(constants_1.Targets.Command.currencyprice.CurrencyPriceRootCommand)),
    tslib_1.__param(91, inversify_1.inject(constants_1.Types.Command)), tslib_1.__param(91, inversify_1.named(constants_1.Targets.Command.HelpCommand)),
    tslib_1.__param(92, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(92, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [DaemonRootCommand_1.DaemonRootCommand,
        BidRootCommand_1.BidRootCommand,
        BidSearchCommand_1.BidSearchCommand,
        BidAcceptCommand_1.BidAcceptCommand,
        BidCancelCommand_1.BidCancelCommand,
        BidRejectCommand_1.BidRejectCommand,
        BidSendCommand_1.BidSendCommand,
        EscrowRootCommand_1.EscrowRootCommand,
        EscrowAddCommand_1.EscrowAddCommand,
        EscrowRemoveCommand_1.EscrowRemoveCommand,
        EscrowUpdateCommand_1.EscrowUpdateCommand,
        EscrowLockCommand_1.EscrowLockCommand,
        EscrowRefundCommand_1.EscrowRefundCommand,
        EscrowReleaseCommand_1.EscrowReleaseCommand,
        FavoriteRootCommand_1.FavoriteRootCommand,
        FavoriteListCommand_1.FavoriteListCommand,
        FavoriteAddCommand_1.FavoriteAddCommand,
        FavoriteRemoveCommand_1.FavoriteRemoveCommand,
        ItemCategoryListCommand_1.ItemCategoryListCommand,
        ItemCategoryAddCommand_1.ItemCategoryAddCommand,
        ItemCategorySearchCommand_1.ItemCategorySearchCommand,
        ItemCategoryGetCommand_1.ItemCategoryGetCommand,
        ItemCategoryRemoveCommand_1.ItemCategoryRemoveCommand,
        ItemCategoryUpdateCommand_1.ItemCategoryUpdateCommand,
        ItemCategoryRootCommand_1.ItemCategoryRootCommand,
        ItemImageRootCommand_1.ItemImageRootCommand,
        ItemImageListCommand_1.ItemImageListCommand,
        ItemImageAddCommand_1.ItemImageAddCommand,
        ItemImageRemoveCommand_1.ItemImageRemoveCommand,
        ItemInformationAddCommand_1.ItemInformationAddCommand,
        ItemInformationGetCommand_1.ItemInformationGetCommand,
        ItemInformationUpdateCommand_1.ItemInformationUpdateCommand,
        ItemInformationRootCommand_1.ItemInformationRootCommand,
        ItemLocationAddCommand_1.ItemLocationAddCommand,
        ItemLocationRemoveCommand_1.ItemLocationRemoveCommand,
        ItemLocationUpdateCommand_1.ItemLocationUpdateCommand,
        ItemLocationRootCommand_1.ItemLocationRootCommand,
        ListingItemGetCommand_1.ListingItemGetCommand,
        ListingItemFlagCommand_1.ListingItemFlagCommand,
        ListingItemSearchCommand_1.ListingItemSearchCommand,
        ListingItemUpdateCommand_1.ListingItemUpdateCommand,
        ListingItemRootCommand_1.ListingItemRootCommand,
        ListingItemTemplateAddCommand_1.ListingItemTemplateAddCommand,
        ListingItemTemplateRemoveCommand_1.ListingItemTemplateRemoveCommand,
        ListingItemTemplateGetCommand_1.ListingItemTemplateGetCommand,
        ListingItemTemplateSearchCommand_1.ListingItemTemplateSearchCommand,
        ListingItemTemplatePostCommand_1.ListingItemTemplatePostCommand,
        ListingItemTemplateRootCommand_1.ListingItemTemplateRootCommand,
        MarketAddCommand_1.MarketAddCommand,
        MarketRootCommand_1.MarketRootCommand,
        MarketListCommand_1.MarketListCommand,
        MessagingInformationUpdateCommand_1.MessagingInformationUpdateCommand,
        MessagingInformationRootCommand_1.MessagingInformationRootCommand,
        OrderRootCommand_1.OrderRootCommand,
        OrderSearchCommand_1.OrderSearchCommand,
        PaymentInformationUpdateCommand_1.PaymentInformationUpdateCommand,
        PaymentInformationRootCommand_1.PaymentInformationRootCommand,
        AddressRootCommand_1.AddressRootCommand,
        AddressListCommand_1.AddressListCommand,
        AddressAddCommand_1.AddressAddCommand,
        AddressUpdateCommand_1.AddressUpdateCommand,
        AddressRemoveCommand_1.AddressRemoveCommand,
        ProfileAddCommand_1.ProfileAddCommand,
        ProfileRemoveCommand_1.ProfileRemoveCommand,
        ProfileGetCommand_1.ProfileGetCommand,
        ProfileUpdateCommand_1.ProfileUpdateCommand,
        ProfileListCommand_1.ProfileListCommand,
        ProfileRootCommand_1.ProfileRootCommand,
        ShippingDestinationRootCommand_1.ShippingDestinationRootCommand,
        ShippingDestinationListCommand_1.ShippingDestinationListCommand,
        ShippingDestinationAddCommand_1.ShippingDestinationAddCommand,
        ShippingDestinationRemoveCommand_1.ShippingDestinationRemoveCommand,
        DataAddCommand_1.DataAddCommand,
        DataCleanCommand_1.DataCleanCommand,
        DataGenerateCommand_1.DataGenerateCommand,
        DataRootCommand_1.DataRootCommand,
        ListingItemObjectRootCommand_1.ListingItemObjectRootCommand,
        ListingItemObjectSearchCommand_1.ListingItemObjectSearchCommand,
        ShoppingCartAddCommand_1.ShoppingCartAddCommand,
        ShoppingCartUpdateCommand_1.ShoppingCartUpdateCommand,
        ShoppingCartRemoveCommand_1.ShoppingCartRemoveCommand,
        ShoppingCartListCommand_1.ShoppingCartListCommand,
        ShoppingCartGetCommand_1.ShoppingCartGetCommand,
        ShoppingCartClearCommand_1.ShoppingCartClearCommand,
        ShoppingCartRootCommand_1.ShoppingCartRootCommand,
        ShoppingCartItemAddCommand_1.ShoppingCartItemAddCommand,
        ShoppingCartItemRemoveCommand_1.ShoppingCartItemRemoveCommand,
        ShoppingCartItemListCommand_1.ShoppingCartItemListCommand,
        ShoppingCartItemRootCommand_1.ShoppingCartItemRootCommand,
        PriceTickerRootCommand_1.PriceTickerRootCommand,
        CurrencyPriceRootCommand_1.CurrencyPriceRootCommand,
        HelpCommand_1.HelpCommand, Object])
], RpcCommandFactory);
exports.RpcCommandFactory = RpcCommandFactory;
// tslint:enable:array-type
// tslint:enable:max-line-length
//# sourceMappingURL=RpcCommandFactory.js.map