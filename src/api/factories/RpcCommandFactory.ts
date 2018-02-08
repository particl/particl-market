import * as Bookshelf from 'bookshelf';
import { inject, named, multiInject } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { RpcCommandInterface } from '../commands/RpcCommandInterface';
import { NotFoundException } from '../exceptions/NotFoundException';

import { DataAddCommand } from '../commands/data/DataAddCommand';
import { DataCleanCommand } from '../commands/data/DataCleanCommand';
import { DataGenerateCommand } from '../commands/data/DataGenerateCommand';
import { DataRootCommand } from '../commands/data/DataRootCommand';
import { HelpCommand } from '../commands/HelpCommand';

import { BidRootCommand } from '../commands/bid/BidRootCommand';
import { BidSearchCommand } from '../commands/bid/BidSearchCommand';
import { BidAcceptCommand } from '../commands/bid/BidAcceptCommand';
import { BidCancelCommand } from '../commands/bid/BidCancelCommand';
import { BidRejectCommand } from '../commands/bid/BidRejectCommand';
import { BidSendCommand } from '../commands/bid/BidSendCommand';

import { EscrowRootCommand } from '../commands/escrow/EscrowRootCommand';
import { EscrowCreateCommand } from '../commands/escrow/EscrowCreateCommand';
import { EscrowDestroyCommand } from '../commands/escrow/EscrowDestroyCommand';
import { EscrowUpdateCommand } from '../commands/escrow/EscrowUpdateCommand';
import { EscrowLockCommand } from '../commands/escrow/EscrowLockCommand';
import { EscrowRefundCommand } from '../commands/escrow/EscrowRefundCommand';
import { EscrowReleaseCommand } from '../commands/escrow/EscrowReleaseCommand';
import { FavoriteRootCommand } from '../commands/favorite/FavoriteRootCommand';
import { FavoriteListCommand } from '../commands/favorite/FavoriteListCommand';
import { FavoriteAddCommand } from '../commands/favorite/FavoriteAddCommand';
import { FavoriteRemoveCommand } from '../commands/favorite/FavoriteRemoveCommand';
import { ItemCategoryListCommand } from '../commands/itemcategory/ItemCategoryListCommand';
import { ItemCategoryAddCommand } from '../commands/itemcategory/ItemCategoryAddCommand';
import { ItemCategoryFindCommand } from '../commands/itemcategory/ItemCategoryFindCommand';
import { ItemCategoryGetCommand } from '../commands/itemcategory/ItemCategoryGetCommand';
import { ItemCategoryRemoveCommand } from '../commands/itemcategory/ItemCategoryRemoveCommand';
import { ItemCategoryUpdateCommand } from '../commands/itemcategory/ItemCategoryUpdateCommand';
import { ItemCategoryRootCommand } from '../commands/itemcategory/ItemCategoryRootCommand';

import { ItemImageRootCommand } from '../commands/itemimage/ItemImageRootCommand';
import { ItemImageListCommand } from '../commands/itemimage/ItemImageListCommand';
import { ItemImageAddCommand } from '../commands/itemimage/ItemImageAddCommand';
import { ItemImageRemoveCommand } from '../commands/itemimage/ItemImageRemoveCommand';

import { ItemInformationCreateCommand } from '../commands/iteminformation/ItemInformationCreateCommand';
import { ItemInformationGetCommand } from '../commands/iteminformation/ItemInformationGetCommand';
import { ItemInformationUpdateCommand } from '../commands/iteminformation/ItemInformationUpdateCommand';
import { ItemInformationRootCommand } from '../commands/iteminformation/ItemInformationRootCommand';

import { ItemLocationRemoveCommand } from '../commands/itemlocation/ItemLocationRemoveCommand';
import { ItemLocationAddCommand } from '../commands/itemlocation/ItemLocationAddCommand';
import { ItemLocationUpdateCommand } from '../commands/itemlocation/ItemLocationUpdateCommand';
import { ItemLocationRootCommand } from '../commands/itemlocation/ItemLocationRootCommand';

import { ListingItemGetCommand } from '../commands/listingitem/ListingItemGetCommand';
import { ListingItemSearchCommand } from '../commands/listingitem/ListingItemSearchCommand';
import { ListingItemRootCommand } from '../commands/listingitem/ListingItemRootCommand';

import { ListingItemTemplateAddCommand } from '../commands/listingitemtemplate/ListingItemTemplateAddCommand';
import { ListingItemTemplateRemoveCommand } from '../commands/listingitemtemplate/ListingItemTemplateRemoveCommand';
import { ListingItemTemplateGetCommand } from '../commands/listingitemtemplate/ListingItemTemplateGetCommand';
import { ListingItemTemplateSearchCommand } from '../commands/listingitemtemplate/ListingItemTemplateSearchCommand';
import { ListingItemTemplatePostCommand } from '../commands/listingitemtemplate/ListingItemTemplatePostCommand';
import { ListingItemTemplateRootCommand } from '../commands/listingitemtemplate/ListingItemTemplateRootCommand';

import { MessagingInformationUpdateCommand } from '../commands/messaginginformation/MessagingInformationUpdateCommand';
import { MessagingInformationRootCommand } from '../commands/messaginginformation/MessagingInformationRootCommand';

import { MarketCreateCommand } from '../commands/market/MarketCreateCommand';
import { MarketRootCommand } from '../commands/market/MarketRootCommand';
import { MarketListCommand } from '../commands/market/MarketListCommand';

import { PaymentInformationUpdateCommand } from '../commands/paymentinformation/PaymentInformationUpdateCommand';
import { PaymentInformationRootCommand } from '../commands/paymentinformation/PaymentInformationRootCommand';

import { AddressRootCommand } from '../commands/address/AddressRootCommand';
import { AddressListCommand } from '../commands/address/AddressListCommand';
import { AddressCreateCommand } from '../commands/address/AddressCreateCommand';
import { AddressUpdateCommand } from '../commands/address/AddressUpdateCommand';
import { AddressRemoveCommand } from '../commands/address/AddressRemoveCommand';

import { ProfileCreateCommand } from '../commands/profile/ProfileCreateCommand';
import { ProfileDestroyCommand } from '../commands/profile/ProfileDestroyCommand';
import { ProfileUpdateCommand } from '../commands/profile/ProfileUpdateCommand';
import { ProfileGetCommand } from '../commands/profile/ProfileGetCommand';
import { ProfileListCommand } from '../commands/profile/ProfileListCommand';
import { ProfileRootCommand } from '../commands/profile/ProfileRootCommand';

import { ShippingDestinationRootCommand } from '../commands/shippingdestination/ShippingDestinationRootCommand';
import { ShippingDestinationListCommand } from '../commands/shippingdestination/ShippingDestinationListCommand';
import { ShippingDestinationAddCommand } from '../commands/shippingdestination/ShippingDestinationAddCommand';
import { ShippingDestinationRemoveCommand } from '../commands/shippingdestination/ShippingDestinationRemoveCommand';

import { ListingItemObjectRootCommand } from '../commands/listingitemobject/ListingItemObjectRootCommand';
import { ListingItemObjectSearchCommand } from '../commands/listingitemobject/ListingItemObjectSearchCommand';

import { ShoppingCartAddCommand } from '../commands/shoppingcart/ShoppingCartAddCommand';
import { ShoppingCartUpdateCommand } from '../commands/shoppingcart/ShoppingCartUpdateCommand';
import { ShoppingCartRemoveCommand } from '../commands/shoppingcart/ShoppingCartRemoveCommand';
import { ShoppingCartListCommand } from '../commands/shoppingcart/ShoppingCartListCommand';
import { ShoppingCartGetCommand } from '../commands/shoppingcart/ShoppingCartGetCommand';
import { ShoppingCartClearCommand } from '../commands/shoppingcart/ShoppingCartClearCommand';
import { ShoppingCartRootCommand } from '../commands/shoppingcart/ShoppingCartRootCommand';

import { ShoppingCartItemAddCommand } from '../commands/shoppingcartitems/ShoppingCartItemAddCommand';
import { ShoppingCartItemRemoveCommand } from '../commands/shoppingcartitems/ShoppingCartItemRemoveCommand';
import { ShoppingCartItemListCommand } from '../commands/shoppingcartitems/ShoppingCartItemListCommand';
import { ShoppingCartItemRootCommand } from '../commands/shoppingcartitems/ShoppingCartItemRootCommand';

import { PriceTickerRootCommand } from '../commands/priceticker/PriceTickerRootCommand';

import { Command } from '../commands/Command';

// tslint:disable:array-type
// tslint:disable:max-line-length
export class RpcCommandFactory {

    public log: LoggerType;
    public commands: Array<RpcCommandInterface<any>> = [];

    constructor(
        @inject(Types.Command) @named(Targets.Command.bid.BidRootCommand) private bidRootCommand: BidRootCommand,
        @inject(Types.Command) @named(Targets.Command.bid.BidSearchCommand) private bidSearchCommand: BidSearchCommand,
        @inject(Types.Command) @named(Targets.Command.bid.BidAcceptCommand) private bidAcceptCommand: BidAcceptCommand,
        @inject(Types.Command) @named(Targets.Command.bid.BidCancelCommand) private bidCancelCommand: BidCancelCommand,
        @inject(Types.Command) @named(Targets.Command.bid.BidRejectCommand) private bidRejectCommand: BidRejectCommand,
        @inject(Types.Command) @named(Targets.Command.bid.BidSendCommand) private bidSendCommand: BidSendCommand,

        @inject(Types.Command) @named(Targets.Command.escrow.EscrowRootCommand) private escrowRootCommand: EscrowRootCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowCreateCommand) private escrowCreateCommand: EscrowCreateCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowDestroyCommand) private escrowDestroyCommand: EscrowDestroyCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowUpdateCommand) private escrowUpdateCommand: EscrowUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowLockCommand) private escrowLockCommand: EscrowLockCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowRefundCommand) private escrowRefundCommand: EscrowRefundCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowReleaseCommand) private escrowReleaseCommand: EscrowReleaseCommand,

        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteRootCommand) private favoriteRootCommand: FavoriteRootCommand,
        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteListCommand) private favoriteListCommand: FavoriteListCommand,
        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteAddCommand) private favoriteAddCommand: FavoriteAddCommand,
        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteRemoveCommand) private favoriteRemoveCommand: FavoriteRemoveCommand,

        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryListCommand) private itemCategoryListCommand: ItemCategoryListCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryAddCommand) private itemCategoryAddCommand: ItemCategoryAddCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryFindCommand) private itemCategoryFindCommand: ItemCategoryFindCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryGetCommand) private itemCategoryGetCommand: ItemCategoryGetCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryRemoveCommand) private itemCategoryRemoveCommand: ItemCategoryRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryUpdateCommand) private itemCategoryUpdateCommand: ItemCategoryUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryRootCommand) private itemCategoryRootCommand: ItemCategoryRootCommand,

        @inject(Types.Command) @named(Targets.Command.itemimage.ItemImageRootCommand) private itemImageRootCommand: ItemImageRootCommand,
        @inject(Types.Command) @named(Targets.Command.itemimage.ItemImageListCommand) private itemImageListCommand: ItemImageListCommand,
        @inject(Types.Command) @named(Targets.Command.itemimage.ItemImageAddCommand) private itemImageAddCommand: ItemImageAddCommand,
        @inject(Types.Command) @named(Targets.Command.itemimage.ItemImageRemoveCommand) private itemImageRemoveCommand: ItemImageRemoveCommand,

        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationCreateCommand) private itemInformationCreateCommand: ItemInformationCreateCommand,
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationGetCommand) private itemInformationGetCommand: ItemInformationGetCommand,
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationUpdateCommand) private itemInformationUpdateCommand: ItemInformationUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationRootCommand) private itemInformationRootCommand: ItemInformationRootCommand,

        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationAddCommand) private itemLocationAddCommand: ItemLocationAddCommand,
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationRemoveCommand) private itemLocationDestroyCommand: ItemLocationRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationUpdateCommand) private itemLocationUpdateCommand: ItemLocationUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationRootCommand) private itemLocationRootCommand: ItemLocationRootCommand,

        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemGetCommand) private listingItemGetCommand: ListingItemGetCommand,
        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemSearchCommand) private listingItemSearchCommand: ListingItemSearchCommand,
        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemRootCommand) private listingItemRootCommand: ListingItemRootCommand,

        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateAddCommand) private listingItemTemplateAddCommand: ListingItemTemplateAddCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateRemoveCommand) private listingItemTemplateRemoveCommand: ListingItemTemplateRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateGetCommand) private listingItemTemplateGetCommand: ListingItemTemplateGetCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateSearchCommand) private listingItemTemplateSearchCommand: ListingItemTemplateSearchCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplatePostCommand) private listingItemTemplatePostCommand: ListingItemTemplatePostCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateRootCommand) private listingItemTemplateRootCommand: ListingItemTemplateRootCommand,

        @inject(Types.Command) @named(Targets.Command.market.MarketCreateCommand) private marketCreateCommand: MarketCreateCommand,
        @inject(Types.Command) @named(Targets.Command.market.MarketRootCommand) private marketRootCommand: MarketRootCommand,
        @inject(Types.Command) @named(Targets.Command.market.MarketListCommand) private marketListCommand: MarketListCommand,

        @inject(Types.Command) @named(Targets.Command.messaginginformation.MessagingInformationUpdateCommand) private messagingInformationUpdateCommand: MessagingInformationUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.messaginginformation.MessagingInformationRootCommand) private messagingInformationRootCommand: MessagingInformationRootCommand,

        @inject(Types.Command) @named(Targets.Command.paymentinformation.PaymentInformationUpdateCommand) private paymentInformationUpdateCommand: PaymentInformationUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.paymentinformation.PaymentInformationRootCommand) private paymentInformationRootCommand: PaymentInformationRootCommand,

        @inject(Types.Command) @named(Targets.Command.address.AddressRootCommand) private addressRootCommand: AddressRootCommand,
        @inject(Types.Command) @named(Targets.Command.address.AddressListCommand) private addressListCommand: AddressListCommand,
        @inject(Types.Command) @named(Targets.Command.address.AddressCreateCommand) private addressCreateCommand: AddressCreateCommand,
        @inject(Types.Command) @named(Targets.Command.address.AddressUpdateCommand) private addressUpdateCommand: AddressUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.address.AddressRemoveCommand) private addressRemoveCommand: AddressRemoveCommand,

        @inject(Types.Command) @named(Targets.Command.profile.ProfileCreateCommand) private profileCreateCommand: ProfileCreateCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileDestroyCommand) private profileDestroyCommand: ProfileDestroyCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileGetCommand) private profileGetCommand: ProfileGetCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileUpdateCommand) private profileUpdateCommand: ProfileUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileListCommand) private profileListCommand: ProfileListCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileRootCommand) private profileRootCommand: ProfileRootCommand,

        @inject(Types.Command) @named(Targets.Command.shippingdestination.ShippingDestinationRootCommand) private shippingDestinationRootCommand: ShippingDestinationRootCommand,
        @inject(Types.Command) @named(Targets.Command.shippingdestination.ShippingDestinationListCommand) private shippingDestinationListCommand: ShippingDestinationListCommand,
        @inject(Types.Command) @named(Targets.Command.shippingdestination.ShippingDestinationAddCommand) private shippingDestinationAddCommand: ShippingDestinationAddCommand,
        @inject(Types.Command) @named(Targets.Command.shippingdestination.ShippingDestinationRemoveCommand) private shippingDestinationRemoveCommand: ShippingDestinationRemoveCommand,

        @inject(Types.Command) @named(Targets.Command.data.DataAddCommand) private dataAddCommand: DataAddCommand,
        @inject(Types.Command) @named(Targets.Command.data.DataCleanCommand) private dataCleanCommand: DataCleanCommand,
        @inject(Types.Command) @named(Targets.Command.data.DataGenerateCommand) private dataGenerateCommand: DataGenerateCommand,
        @inject(Types.Command) @named(Targets.Command.data.DataRootCommand) private dataRootCommand: DataRootCommand,

        @inject(Types.Command) @named(Targets.Command.listingitemobject.ListingItemObjectRootCommand) private listingItemObjectRootCommand: ListingItemObjectRootCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemobject.ListingItemObjectSearchCommand) private listingItemObjectSearchCommand: ListingItemObjectSearchCommand,

        @inject(Types.Command) @named(Targets.Command.shoppingcart.ShoppingCartAddCommand) private shoppingCartAddCommand: ShoppingCartAddCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcart.ShoppingCartUpdateCommand) private shoppingCartUpdateCommand: ShoppingCartUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcart.ShoppingCartRemoveCommand) private shoppingCartRemoveCommand: ShoppingCartRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcart.ShoppingCartListCommand) private shoppingCartListCommand: ShoppingCartListCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcart.ShoppingCartGetCommand) private shoppingCartGetCommand: ShoppingCartGetCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcart.ShoppingCartClearCommand) private shoppingCartClearCommand: ShoppingCartClearCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcart.ShoppingCartRootCommand) private shoppingCartRootCommand: ShoppingCartRootCommand,

        @inject(Types.Command) @named(Targets.Command.shoppingcartitems.ShoppingCartItemAddCommand) private shoppingCartItemAddCommand: ShoppingCartItemAddCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcartitems.ShoppingCartItemRemoveCommand) private shoppingCartItemRemoveCommand: ShoppingCartItemRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcartitems.ShoppingCartItemListCommand) private shoppingCartItemListCommand: ShoppingCartItemListCommand,
        @inject(Types.Command) @named(Targets.Command.shoppingcartitems.ShoppingCartItemRootCommand) private shoppingCartItemRootCommand: ShoppingCartItemRootCommand,

        @inject(Types.Command) @named(Targets.Command.priceticker.PriceTickerRootCommand) private priceTickerRootCommand: PriceTickerRootCommand,

        @inject(Types.Command) @named(Targets.Command.HelpCommand) private helpCommand: HelpCommand,


        //  ---
        // @multiInject(Types.Command) public commands: RpcCommand<any>[],
        // @multiInject(Types.Command) @named(Targets.AllCommands) private commands: Array<RpcCommand<any>>,
        // @multiInject(Types.Command) @named('Command') private commands: Command[],
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        this.commands.push(bidRootCommand);
        this.commands.push(bidSearchCommand);
        this.commands.push(bidAcceptCommand);
        this.commands.push(bidCancelCommand);
        this.commands.push(bidRejectCommand);
        this.commands.push(bidSendCommand);

        this.commands.push(escrowRootCommand);
        this.commands.push(escrowCreateCommand);
        this.commands.push(escrowDestroyCommand);
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
        this.commands.push(itemCategoryFindCommand);
        this.commands.push(itemCategoryGetCommand);
        this.commands.push(itemCategoryRemoveCommand);
        this.commands.push(itemCategoryUpdateCommand);
        this.commands.push(itemCategoryRootCommand);

        this.commands.push(itemImageRootCommand);
        this.commands.push(itemImageListCommand);
        this.commands.push(itemImageAddCommand);
        this.commands.push(itemImageRemoveCommand);

        this.commands.push(itemInformationCreateCommand);
        this.commands.push(itemInformationGetCommand);
        this.commands.push(itemInformationUpdateCommand);
        this.commands.push(itemInformationRootCommand);

        this.commands.push(itemLocationAddCommand);
        this.commands.push(itemLocationDestroyCommand);
        this.commands.push(itemLocationUpdateCommand);
        this.commands.push(itemLocationRootCommand);

        this.commands.push(listingItemGetCommand);
        this.commands.push(listingItemSearchCommand);
        this.commands.push(listingItemRootCommand);

        this.commands.push(listingItemTemplatePostCommand);
        this.commands.push(listingItemTemplateAddCommand);
        this.commands.push(listingItemTemplateRemoveCommand);
        this.commands.push(listingItemTemplateGetCommand);
        this.commands.push(listingItemTemplateSearchCommand);
        this.commands.push(listingItemTemplateRootCommand);

        this.commands.push(marketCreateCommand);
        this.commands.push(marketRootCommand);
        this.commands.push(marketListCommand);

        this.commands.push(messagingInformationUpdateCommand);
        this.commands.push(messagingInformationRootCommand);

        this.commands.push(paymentInformationUpdateCommand);
        this.commands.push(paymentInformationRootCommand);

        this.commands.push(addressRootCommand);
        this.commands.push(addressListCommand);
        this.commands.push(addressCreateCommand);
        this.commands.push(addressUpdateCommand);
        this.commands.push(addressRemoveCommand);

        this.commands.push(profileCreateCommand);
        this.commands.push(profileDestroyCommand);
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
    public get(commandType: Command): RpcCommandInterface<any> {
        this.log.debug('Looking for command <' + commandType.toString() + '>');
        for (const commandInstance of this.commands) {
            if (commandInstance.getCommand().toString() === commandType.toString()) {
                this.log.debug('Found ' + commandInstance.getCommand().toString());
                return commandInstance;
            }
        }
        throw new NotFoundException('Couldn\'t find command <' + commandType.toString() + '>\n');
    }
}
// tslint:enable:array-type
// tslint:enable:max-line-length
