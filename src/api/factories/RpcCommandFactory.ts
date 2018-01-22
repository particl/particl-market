import * as Bookshelf from 'bookshelf';
import { inject, named, multiInject } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { RpcCommandInterface} from '../commands/RpcCommandInterface';
import { NotFoundException } from '../exceptions/NotFoundException';

import { DataAddCommand } from '../commands/data/DataAddCommand';
import { DataCleanCommand } from '../commands/data/DataCleanCommand';
import { DataGenerateCommand } from '../commands/data/DataGenerateCommand';
import { HelpCommand } from '../commands/HelpCommand';

import { BidSearchCommand } from '../commands/bid/BidSearchCommand';
import { EscrowCreateCommand } from '../commands/escrow/EscrowCreateCommand';
import { EscrowDestroyCommand } from '../commands/escrow/EscrowDestroyCommand';
import { EscrowUpdateCommand } from '../commands/escrow/EscrowUpdateCommand';
import { FavoriteAddCommand } from '../commands/favorite/FavoriteAddCommand';
import { FavoriteRemoveCommand } from '../commands/favorite/FavoriteRemoveCommand';
import { ItemCategoriesGetCommand } from '../commands/itemcategory/ItemCategoriesGetCommand';
import { ItemCategoryCreateCommand } from '../commands/itemcategory/ItemCategoryCreateCommand';
import { ItemCategoryFindCommand } from '../commands/itemcategory/ItemCategoryFindCommand';
import { ItemCategoryGetCommand } from '../commands/itemcategory/ItemCategoryGetCommand';
import { ItemCategoryRemoveCommand } from '../commands/itemcategory/ItemCategoryRemoveCommand';
import { ItemCategoryUpdateCommand } from '../commands/itemcategory/ItemCategoryUpdateCommand';
import { ItemImageAddCommand } from '../commands/itemimage/ItemImageAddCommand';
import { ItemImageGetsCommand } from '../commands/itemimage/ItemImageGetsCommand';
import { ItemImageRemoveCommand } from '../commands/itemimage/ItemImageRemoveCommand';
import { ItemInformationCreateCommand } from '../commands/iteminformation/ItemInformationCreateCommand';
import { ItemInformationGetCommand } from '../commands/iteminformation/ItemInformationGetCommand';
import { ItemInformationUpdateCommand } from '../commands/iteminformation/ItemInformationUpdateCommand';
import { ItemLocationRemoveCommand } from '../commands/itemlocation/ItemLocationRemoveCommand';
import { ItemLocationCreateCommand } from '../commands/itemlocation/ItemLocationCreateCommand';
import { ItemLocationUpdateCommand } from '../commands/itemlocation/ItemLocationUpdateCommand';
import { ListingItemGetCommand } from '../commands/listingitem/ListingItemGetCommand';
import { ListingItemSearchCommand } from '../commands/listingitem/ListingItemSearchCommand';
import { OwnListingItemSearchCommand } from '../commands/listingitem/OwnListingItemSearchCommand';
import { ListingItemTemplateCreateCommand } from '../commands/listingitemtemplate/ListingItemTemplateCreateCommand';
import { ListingItemTemplateDestroyCommand } from '../commands/listingitemtemplate/ListingItemTemplateDestroyCommand';
import { ListingItemTemplateGetCommand } from '../commands/listingitemtemplate/ListingItemTemplateGetCommand';
import { ListingItemTemplateSearchCommand } from '../commands/listingitemtemplate/ListingItemTemplateSearchCommand';
import { MessagingInformationUpdateCommand } from '../commands/messaginginformation/MessagingInformationUpdateCommand';
import { MarketCreateCommand } from '../commands/market/MarketCreateCommand';
import { PaymentInformationUpdateCommand } from '../commands/paymentinformation/PaymentInformationUpdateCommand';
import { AddressCreateCommand } from '../commands/profile/AddressCreateCommand';
import { AddressDestroyCommand } from '../commands/profile/AddressDestroyCommand';
import { AddressUpdateCommand } from '../commands/profile/AddressUpdateCommand';
import { ProfileCreateCommand } from '../commands/profile/ProfileCreateCommand';
import { ProfileDestroyCommand } from '../commands/profile/ProfileDestroyCommand';
import { ProfileUpdateCommand } from '../commands/profile/ProfileUpdateCommand';
import { ProfileGetCommand } from '../commands/profile/ProfileGetCommand';
import { ShippingDestinationAddCommand } from '../commands/shippingdestination/ShippingDestinationAddCommand';
import { ShippingDestinationRemoveCommand } from '../commands/shippingdestination/ShippingDestinationRemoveCommand';
import { EscrowLockCommand } from '../commands/escrow/EscrowLockCommand';
import { EscrowRefundCommand } from '../commands/escrow/EscrowRefundCommand';
import { EscrowReleaseCommand } from '../commands/escrow/EscrowReleaseCommand';

import { AcceptBidCommand } from '../commands/bid/AcceptBidCommand';
import { CancelBidCommand } from '../commands/bid/CancelBidCommand';
import { RejectBidCommand } from '../commands/bid/RejectBidCommand';
import { SendBidCommand } from '../commands/bid/SendBidCommand';
import { ListingItemPostCommand } from '../commands/listingitem/ListingItemPostCommand';
import { Command } from '../commands/Command';

// tslint:disable:array-type
// tslint:disable:max-line-length
export class RpcCommandFactory {

    public log: LoggerType;
    public commands: Array<RpcCommandInterface<any>> = [];

    constructor(
        @inject(Types.Command) @named(Targets.Command.bid.BidSearchCommand) private bidSearchCommand: BidSearchCommand,
        @inject(Types.Command) @named(Targets.Command.bid.AcceptBidCommand) private bidAcceptCommand: AcceptBidCommand,
        @inject(Types.Command) @named(Targets.Command.bid.CancelBidCommand) private bidCancelCommand: CancelBidCommand,
        @inject(Types.Command) @named(Targets.Command.bid.RejectBidCommand) private bidRejectCommand: RejectBidCommand,
        @inject(Types.Command) @named(Targets.Command.bid.SendBidCommand) private bidSendCommand: SendBidCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowCreateCommand) private escrowCreateCommand: EscrowCreateCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowDestroyCommand) private escrowDestroyCommand: EscrowDestroyCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowUpdateCommand) private escrowUpdateCommand: EscrowUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowLockCommand) private escrowLockCommand: EscrowLockCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowRefundCommand) private escrowRefundCommand: EscrowRefundCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowReleaseCommand) private escrowReleaseCommand: EscrowReleaseCommand,
        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteAddCommand) private favoriteAddCommand: FavoriteAddCommand,
        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteRemoveCommand) private favoriteRemoveCommand: FavoriteRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoriesGetCommand) private itemCategoriesGetCommand: ItemCategoriesGetCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryCreateCommand) private itemCategoryCreateCommand: ItemCategoryCreateCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryFindCommand) private itemCategoryFindCommand: ItemCategoryFindCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryGetCommand) private itemCategoryGetCommand: ItemCategoryGetCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryRemoveCommand) private itemCategoryRemoveCommand: ItemCategoryRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryUpdateCommand) private itemCategoryUpdateCommand: ItemCategoryUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.itemimage.ItemImageAddCommand) private itemImageAddCommand: ItemImageAddCommand,
        @inject(Types.Command) @named(Targets.Command.itemimage.ItemImageGetsCommand) private itemImageGetsCommand: ItemImageGetsCommand,
        @inject(Types.Command) @named(Targets.Command.itemimage.ItemImageRemoveCommand) private itemImageRemoveCommand: ItemImageRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationCreateCommand) private itemInformationCreateCommand: ItemInformationCreateCommand,
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationGetCommand) private itemInformationGetCommand: ItemInformationGetCommand,
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationUpdateCommand) private itemInformationUpdateCommand: ItemInformationUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationCreateCommand) private itemLocationCreateCommand: ItemLocationCreateCommand,
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationRemoveCommand) private itemLocationDestroyCommand: ItemLocationRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationUpdateCommand) private itemLocationUpdateCommand: ItemLocationUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemGetCommand) private listingItemGetCommand: ListingItemGetCommand,
        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemSearchCommand) private listingItemSearchCommand: ListingItemSearchCommand,
        @inject(Types.Command) @named(Targets.Command.listingitem.OwnListingItemSearchCommand) private ownListingItemSearchCommand: OwnListingItemSearchCommand,
        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemPostCommand) private listingItemPostCommand: ListingItemPostCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateCreateCommand) private listingItemTemplateCreateCommand: ListingItemTemplateCreateCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateDestroyCommand) private listingItemTemplateDestroyCommand: ListingItemTemplateDestroyCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateGetCommand) private listingItemTemplateGetCommand: ListingItemTemplateGetCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateSearchCommand) private listingItemTemplateSearchCommand: ListingItemTemplateSearchCommand,
        @inject(Types.Command) @named(Targets.Command.market.MarketCreateCommand) private marketCreateCommand: MarketCreateCommand,
        @inject(Types.Command) @named(Targets.Command.messaginginformation.MessagingInformationUpdateCommand) private messagingInformationUpdateCommand: MessagingInformationUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.paymentinformation.PaymentInformationUpdateCommand) private paymentInformationUpdateCommand: PaymentInformationUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.profile.AddressCreateCommand) private addresscreateCommand: AddressCreateCommand,
        @inject(Types.Command) @named(Targets.Command.profile.AddressDestroyCommand) private addressDestroyCommand: AddressDestroyCommand,
        @inject(Types.Command) @named(Targets.Command.profile.AddressUpdateCommand) private addressUpdateCommand: AddressUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileCreateCommand) private profileCreateCommand: ProfileCreateCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileDestroyCommand) private profileDestroyCommand: ProfileDestroyCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileGetCommand) private profileGetCommand: ProfileGetCommand,
        @inject(Types.Command) @named(Targets.Command.profile.ProfileUpdateCommand) private profileUpdateCommand: ProfileUpdateCommand,
        @inject(Types.Command) @named(Targets.Command.shippingdestination.ShippingDestinationAddCommand) private shippingDestinationAddCommand: ShippingDestinationAddCommand,
        @inject(Types.Command) @named(Targets.Command.shippingdestination.ShippingDestinationRemoveCommand) private shippingDestinationRemoveCommand: ShippingDestinationRemoveCommand,

        @inject(Types.Command) @named(Targets.Command.data.DataAddCommand) private dataAddCommand: DataAddCommand,
        @inject(Types.Command) @named(Targets.Command.data.DataCleanCommand) private dataCleanCommand: DataCleanCommand,
        @inject(Types.Command) @named(Targets.Command.data.DataGenerateCommand) private dataGenerateCommand: DataGenerateCommand,
        @inject(Types.Command) @named(Targets.Command.HelpCommand) private helpCommand: HelpCommand,


        //  ---
        // @multiInject(Types.Command) public commands: RpcCommand<any>[],
        // @multiInject(Types.Command) @named(Targets.AllCommands) private commands: Array<RpcCommand<any>>,
        // @multiInject(Types.Command) @named('Command') private commands: Command[],
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        this.commands.push(bidSearchCommand);
        this.commands.push(bidAcceptCommand);
        this.commands.push(bidCancelCommand);
        this.commands.push(bidRejectCommand);
        this.commands.push(bidSendCommand);
        this.commands.push(escrowCreateCommand);
        this.commands.push(escrowDestroyCommand);
        this.commands.push(escrowUpdateCommand);
        this.commands.push(escrowLockCommand);
        this.commands.push(escrowRefundCommand);
        this.commands.push(escrowReleaseCommand);
        this.commands.push(favoriteAddCommand);
        this.commands.push(favoriteRemoveCommand);
        this.commands.push(itemCategoriesGetCommand);
        this.commands.push(itemCategoryCreateCommand);
        this.commands.push(itemCategoryFindCommand);
        this.commands.push(itemCategoryGetCommand);
        this.commands.push(itemCategoryRemoveCommand);
        this.commands.push(itemCategoryUpdateCommand);
        this.commands.push(itemImageAddCommand);
        this.commands.push(itemImageGetsCommand);
        this.commands.push(itemImageRemoveCommand);
        this.commands.push(itemInformationCreateCommand);
        this.commands.push(itemInformationGetCommand);
        this.commands.push(itemInformationUpdateCommand);
        this.commands.push(itemLocationCreateCommand);
        this.commands.push(itemLocationDestroyCommand);
        this.commands.push(itemLocationUpdateCommand);
        this.commands.push(listingItemGetCommand);
        this.commands.push(listingItemSearchCommand);
        this.commands.push(ownListingItemSearchCommand);
        this.commands.push(listingItemPostCommand);
        this.commands.push(listingItemTemplateCreateCommand);
        this.commands.push(listingItemTemplateDestroyCommand);
        this.commands.push(listingItemTemplateGetCommand);
        this.commands.push(listingItemTemplateSearchCommand);
        this.commands.push(marketCreateCommand);
        this.commands.push(messagingInformationUpdateCommand);
        this.commands.push(paymentInformationUpdateCommand);
        this.commands.push(addresscreateCommand);
        this.commands.push(addressDestroyCommand);
        this.commands.push(addressUpdateCommand);
        this.commands.push(profileCreateCommand);
        this.commands.push(profileDestroyCommand);
        this.commands.push(profileGetCommand);
        this.commands.push(profileUpdateCommand);
        this.commands.push(shippingDestinationAddCommand);
        this.commands.push(shippingDestinationRemoveCommand);

        this.commands.push(dataAddCommand);
        this.commands.push(dataCleanCommand);
        this.commands.push(dataGenerateCommand);
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
