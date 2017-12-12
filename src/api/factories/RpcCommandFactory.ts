import * as Bookshelf from 'bookshelf';
import { inject, named, multiInject } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { RpcCommand} from '../commands/RpcCommand';
import {NotFoundException} from '../exceptions/NotFoundException';
// import {AddressCommand} from '../commands/AddressCommand';
import {AddressCreateCommand} from '../commands/AddressCreateCommand';
import {AddressUpdateCommand} from '../commands/AddressUpdateCommand';

import {CategoryCreateCommand} from '../commands/CategoryCreateCommand';
import {CategoriesGetCommand} from '../commands/CategoriesGetCommand';
import {CategoryFindCommand} from '../commands/CategoryFindCommand';
import {CategoryGetCommand} from '../commands/CategoryGetCommand';
import {CategoryRemoveCommand} from '../commands/CategoryRemoveCommand';
import {CategoryUpdateCommand} from '../commands/CategoryUpdateCommand';

import {EscrowCreateCommand} from '../commands/EscrowCreateCommand';
import {EscrowDestroyCommand} from '../commands/EscrowDestroyCommand';
import {EscrowFindAllCommand} from '../commands/EscrowFindAllCommand';
import {EscrowFindCommand} from '../commands/EscrowFindCommand';
import {EscrowUpdateCommand} from '../commands/EscrowUpdateCommand';

import {ItemPriceCreateCommand} from '../commands/ItemPriceCreateCommand';
import {ItemPriceDestroyCommand} from '../commands/ItemPriceDestroyCommand';
import {ItemPriceFindAllCommand} from '../commands/ItemPriceFindAllCommand';
import {ItemPriceFindCommand} from '../commands/ItemPriceFindCommand';
import {ItemPriceUpdateCommand} from '../commands/ItemPriceUpdateCommand';

import {ListingItemCreateCommand} from '../commands/ListingItemCreateCommand';
import {ListingItemDestroyCommand} from '../commands/ListingItemDestroyCommand';
import {ListingItemFindAllCommand} from '../commands/ListingItemFindAllCommand';
import {ListingItemFindByCategoryCommand} from '../commands/ListingItemFindByCategoryCommand';
import {ListingItemFindCommand} from '../commands/ListingItemFindCommand';
import {ListingItemUpdateCommand} from '../commands/ListingItemUpdateCommand';

import {PaymentInformationCreateCommand} from '../commands/PaymentInformationCreateCommand';
import {PaymentInformationDestroyCommand} from '../commands/PaymentInformationDestroyCommand';
import {PaymentInformationFindAllCommand} from '../commands/PaymentInformationFindAllCommand';
import {PaymentInformationFindCommand} from '../commands/PaymentInformationFindCommand';
import {PaymentInformationUpdateCommand} from '../commands/PaymentInformationUpdateCommand';

import {ProfileCreateCommand} from '../commands/ProfileCreateCommand';
import {ProfileFindCommand} from '../commands/ProfileFindCommand';
import {ProfileUpdateCommand} from '../commands/ProfileUpdateCommand';

import {ItemImageDataCreateCommand} from '../commands/ItemImageDataCreateCommand';
import {ItemImageDataDestroyCommand} from '../commands/ItemImageDataDestroyCommand';
import {ItemImageDataFindAllCommand} from '../commands/ItemImageDataFindAllCommand';
import {ItemImageDataFindCommand} from '../commands/ItemImageDataFindCommand';
import {ItemImageDataUpdateCommand} from '../commands/ItemImageDataUpdateCommand';

import {ItemImageCreateCommand} from '../commands/ItemImageCreateCommand';
import {ItemImageDestroyCommand} from '../commands/ItemImageDestroyCommand';
import {ItemImageFindAllCommand} from '../commands/ItemImageFindAllCommand';
import {ItemImageFindCommand} from '../commands/ItemImageFindCommand';
import {ItemImageUpdateCommand} from '../commands/ItemImageUpdateCommand';

import {ItemInformationCreateCommand} from '../commands/ItemInformationCreateCommand';
import {ItemInformationDestroyCommand} from '../commands/ItemInformationDestroyCommand';
import {ItemInformationFindAllCommand} from '../commands/ItemInformationFindAllCommand';
import {ItemInformationFindCommand} from '../commands/ItemInformationFindCommand';
import {ItemInformationUpdateCommand} from '../commands/ItemInformationUpdateCommand';

import {ItemLocationCreateCommand} from '../commands/ItemLocationCreateCommand';
import {ItemLocationDestroyCommand} from '../commands/ItemLocationDestroyCommand';
import {ItemLocationFindAllCommand} from '../commands/ItemLocationFindAllCommand';
import {ItemLocationFindCommand} from '../commands/ItemLocationFindCommand';
import {ItemLocationUpdateCommand} from '../commands/ItemLocationUpdateCommand';

import {LocationMarkerCreateCommand} from '../commands/LocationMarkerCreateCommand';
import {LocationMarkerDestroyCommand} from '../commands/LocationMarkerDestroyCommand';
import {LocationMarkerFindAllCommand} from '../commands/LocationMarkerFindAllCommand';
import {LocationMarkerFindCommand} from '../commands/LocationMarkerFindCommand';
import {LocationMarkerUpdateCommand} from '../commands/LocationMarkerUpdateCommand';

import {MessagingInformationCreateCommand} from '../commands/MessagingInformationCreateCommand';
import {MessagingInformationDestroyCommand} from '../commands/MessagingInformationDestroyCommand';
import {MessagingInformationFindAllCommand} from '../commands/MessagingInformationFindAllCommand';
import {MessagingInformationFindCommand} from '../commands/MessagingInformationFindCommand';
import {MessagingInformationUpdateCommand} from '../commands/MessagingInformationUpdateCommand';

import {ItemCategoryCreateCommand} from '../commands/ItemCategoryCreateCommand';
import {ItemCategoryDestroyCommand} from '../commands/ItemCategoryDestroyCommand';
import {ItemCategoryFindAllCommand} from '../commands/ItemCategoryFindAllCommand';
import {ItemCategoryFindCommand} from '../commands/ItemCategoryFindCommand';
import {ItemCategoryFindRootCommand} from '../commands/ItemCategoryFindRootCommand';
import {ItemCategoryUpdateCommand} from '../commands/ItemCategoryUpdateCommand';

import {ShippingCreateCommand} from '../commands/ShippingCreateCommand';
import {ShippingDestroyCommand} from '../commands/ShippingDestroyCommand';
import {ShippingFindAllCommand} from '../commands/ShippingFindAllCommand';
import {ShippingFindCommand} from '../commands/ShippingFindCommand';
import {ShippingUpdateCommand} from '../commands/ShippingUpdateCommand';

import {HelpCommand} from '../commands/HelpCommand';

import {CreateProfileCommand} from '../commands/CreateProfileCommand';
import {GetProfileCommand} from '../commands/GetProfileCommand';
import {UpdateProfileCommand} from '../commands/UpdateProfileCommand';

import {FindItemsCommand} from '../commands/FindItemsCommand';
import {FindOwnItemsCommand} from '../commands/FindOwnItemsCommand';
import {GetItemCommand} from '../commands/GetItemCommand';

// tslint:disable:array-type
export class RpcCommandFactory {

    public log: LoggerType;
    public commands: Array<RpcCommand<any>> = [];

    constructor(
       @inject(Types.Command) @named(Targets.Command.AddressCreateCommand) private addresscreateCommand: AddressCreateCommand,
       @inject(Types.Command) @named(Targets.Command.AddressUpdateCommand) private addressUpdateCommand: AddressUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.CategoriesGetCommand) private categoriesGetCommand: CategoriesGetCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryCreateCommand) private categoryCreateCommand: CategoryCreateCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryFindCommand) private categoryFindCommand: CategoryFindCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryGetCommand) private categoryGetCommand: CategoryGetCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryRemoveCommand) private categoryRemoveCommand: CategoryRemoveCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryUpdateCommand) private categoryUpdateCommand: CategoryUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.EscrowCreateCommand) private escrowCreateCommand: EscrowCreateCommand,
       @inject(Types.Command) @named(Targets.Command.EscrowDestroyCommand) private escrowDestroyCommand: EscrowDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.EscrowFindAllCommand) private escrowFindAllCommand: EscrowFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.EscrowFindCommand) private escrowFindCommand: EscrowFindCommand,
       @inject(Types.Command) @named(Targets.Command.EscrowUpdateCommand) private escrowUpdateCommand: EscrowUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ItemPriceCreateCommand) private itemPriceCreateCommand: ItemPriceCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ItemPriceDestroyCommand) private itemPriceDestroyCommand: ItemPriceDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ItemPriceFindAllCommand) private itemPriceFindAllCommand: ItemPriceFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ItemPriceFindCommand) private itemPriceFindCommand: ItemPriceFindCommand,
       @inject(Types.Command) @named(Targets.Command.ItemPriceUpdateCommand) private itemPriceUpdateCommand: ItemPriceUpdateCommand,

       // Truncated names to be under max line length
       @inject(Types.Command) @named(Targets.Command.ListingItemCreateCommand) private lstItemCreateCommand: ListingItemCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ListingItemDestroyCommand) private lstItemDestroyCommand: ListingItemDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ListingItemFindAllCommand) private lstItemFindAllCommand: ListingItemFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ListingItemFindByCategoryCommand) private lstItemFindByCategoryCommand: ListingItemFindByCategoryCommand,
       @inject(Types.Command) @named(Targets.Command.ListingItemFindCommand) private lstItemFindCommand: ListingItemFindCommand,
       @inject(Types.Command) @named(Targets.Command.ListingItemUpdateCommand) private lstItemUpdateCommand: ListingItemUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.PaymentInformationCreateCommand) private paymentInformationCreateCommand: PaymentInformationCreateCommand,
       // Name shortened because max line length
       @inject(Types.Command) @named(Targets.Command.PaymentInformationDestroyCommand) private paymentInfoDestroyCommand: PaymentInformationDestroyCommand,
       // Name shortened because max line length
       @inject(Types.Command) @named(Targets.Command.PaymentInformationFindAllCommand) private paymentInfoFindAllCommand: PaymentInformationFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.PaymentInformationFindCommand) private paymentInformationFindCommand: PaymentInformationFindCommand,
       @inject(Types.Command) @named(Targets.Command.PaymentInformationUpdateCommand) private paymentInformationUpdateCommand: PaymentInformationUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ProfileCreateCommand) private profileCreateCommand: ProfileCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ProfileFindCommand) private profileFindCommand: ProfileFindCommand,
       @inject(Types.Command) @named(Targets.Command.ProfileUpdateCommand) private profileUpdateCommand: ProfileUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ItemImageDataCreateCommand) private itemImageDataCreateCommand: ItemImageDataCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ItemImageDataDestroyCommand) private itemImageDataDestroyCommand: ItemImageDataDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ItemImageDataFindAllCommand) private itemImageDataFindAllCommand: ItemImageDataFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ItemImageDataFindCommand) private itemImageDataFindCommand: ItemImageDataFindCommand,
       @inject(Types.Command) @named(Targets.Command.ItemImageDataUpdateCommand) private itemImageDataUpdateCommand: ItemImageDataUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ItemImageCreateCommand) private itemImageCreateCommand: ItemImageCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ItemImageDestroyCommand) private itemImageDestroyCommand: ItemImageDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ItemImageFindAllCommand) private itemImageFindAllCommand: ItemImageFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ItemImageFindCommand) private itemImageFindCommand: ItemImageFindCommand,
       @inject(Types.Command) @named(Targets.Command.ItemImageUpdateCommand) private itemImageUpdateCommand: ItemImageUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ItemInformationCreateCommand) private itemInformationCreateCommand: ItemInformationCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ItemInformationDestroyCommand) private itemInformationDestroyCommand: ItemInformationDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ItemInformationFindAllCommand) private itemInformationFindAllCommand: ItemInformationFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ItemInformationFindCommand) private itemInformationFindCommand: ItemInformationFindCommand,
       @inject(Types.Command) @named(Targets.Command.ItemInformationUpdateCommand) private itemInformationUpdateCommand: ItemInformationUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ItemLocationCreateCommand) private itemLocationCreateCommand: ItemLocationCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ItemLocationDestroyCommand) private itemLocationDestroyCommand: ItemLocationDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ItemLocationFindAllCommand) private itemLocationFindAllCommand: ItemLocationFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ItemLocationFindCommand) private itemLocationFindCommand: ItemLocationFindCommand,
       @inject(Types.Command) @named(Targets.Command.ItemLocationUpdateCommand) private itemLocationUpdateCommand: ItemLocationUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.LocationMarkerCreateCommand) private locationMarkerCreateCommand: LocationMarkerCreateCommand,
       @inject(Types.Command) @named(Targets.Command.LocationMarkerDestroyCommand) private locationMarkerDestroyCommand: LocationMarkerDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.LocationMarkerFindAllCommand) private locationMarkerFindAllCommand: LocationMarkerFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.LocationMarkerFindCommand) private locationMarkerFindCommand: LocationMarkerFindCommand,
       @inject(Types.Command) @named(Targets.Command.LocationMarkerUpdateCommand) private locationMarkerUpdateCommand: LocationMarkerUpdateCommand,

       // Truncated names so they don't exceed max line length
       @inject(Types.Command) @named(Targets.Command.MessagingInformationCreateCommand) private msgInfoCreateCommand: MessagingInformationCreateCommand,
       @inject(Types.Command) @named(Targets.Command.MessagingInformationDestroyCommand) private msgInfoDestroyCommand: MessagingInformationDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.MessagingInformationFindAllCommand) private msgInfoFindAllCommand: MessagingInformationFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.MessagingInformationFindCommand) private msgInfoFindCommand: MessagingInformationFindCommand,
       @inject(Types.Command) @named(Targets.Command.MessagingInformationUpdateCommand) private msgInfoUpdateCommand: MessagingInformationUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ItemCategoryCreateCommand) private itemCategoryCreateCommand: ItemCategoryCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryDestroyCommand) private itemCategoryDestroyCommand: ItemCategoryDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryFindAllCommand) private itemCategoryFindAllCommand: ItemCategoryFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryFindCommand) private itemCategoryFindCommand: ItemCategoryFindCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryFindRootCommand) private itemCategoryFindRootCommand: ItemCategoryFindRootCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryUpdateCommand) private itemCategoryUpdateCommand: ItemCategoryUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ShippingCreateCommand) private shippingCreateCommand: ShippingCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ShippingDestroyCommand) private shippingDestroyCommand: ShippingDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ShippingFindAllCommand) private shippingFindAllCommand: ShippingFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ShippingFindCommand) private shippingFindCommand: ShippingFindCommand,
       @inject(Types.Command) @named(Targets.Command.ShippingUpdateCommand) private shippingUpdateCommand: ShippingUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.HelpCommand) private helpCommand: HelpCommand,

       @inject(Types.Command) @named(Targets.Command.CreateProfileCommand) private createProfileCommand: CreateProfileCommand,
       @inject(Types.Command) @named(Targets.Command.GetProfileCommand) private getProfileCommand: GetProfileCommand,
       @inject(Types.Command) @named(Targets.Command.UpdateProfileCommand) private updateProfileCommand: UpdateProfileCommand,

       @inject(Types.Command) @named(Targets.Command.FindItemsCommand) private findItemsCommand: FindItemsCommand,
       @inject(Types.Command) @named(Targets.Command.FindOwnItemsCommand) private findOwnItemsCommand: FindOwnItemsCommand,
       @inject(Types.Command) @named(Targets.Command.GetItemCommand) private getItemCommand: GetItemCommand,

       // @multiInject(Types.Command) public commands: RpcCommand<any>[],
       // @multiInject(Types.Command) @named(Targets.AllCommands) private commands: Array<RpcCommand<any>>,
       // @multiInject(Types.Command) @named('Command') private commands: Command[],
       @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        this.commands.push(addresscreateCommand);
        this.commands.push(addressUpdateCommand);

        this.commands.push(categoriesGetCommand);
        this.commands.push(categoryCreateCommand);
        this.commands.push(categoryFindCommand);
        this.commands.push(categoryGetCommand);
        this.commands.push(categoryRemoveCommand);
        this.commands.push(categoryUpdateCommand);

        this.commands.push(escrowCreateCommand);
        this.commands.push(escrowDestroyCommand);
        this.commands.push(escrowFindAllCommand);
        this.commands.push(escrowFindCommand);
        this.commands.push(escrowUpdateCommand);

        this.commands.push(itemPriceCreateCommand);
        this.commands.push(itemPriceDestroyCommand);
        this.commands.push(itemPriceFindAllCommand);
        this.commands.push(itemPriceFindCommand);
        this.commands.push(itemPriceUpdateCommand);

        this.commands.push(lstItemCreateCommand);
        this.commands.push(lstItemDestroyCommand);
        this.commands.push(lstItemFindAllCommand);
        this.commands.push(lstItemFindByCategoryCommand);
        this.commands.push(lstItemFindCommand);
        this.commands.push(lstItemUpdateCommand);

        this.commands.push(paymentInformationCreateCommand);
        this.commands.push(paymentInfoDestroyCommand);
        this.commands.push(paymentInfoFindAllCommand);
        this.commands.push(paymentInformationFindCommand);
        this.commands.push(paymentInformationUpdateCommand);

        this.commands.push(profileCreateCommand);
        this.commands.push(profileFindCommand);
        this.commands.push(profileUpdateCommand);

        this.commands.push(itemImageDataCreateCommand);
        this.commands.push(itemImageDataDestroyCommand);
        this.commands.push(itemImageDataFindAllCommand);
        this.commands.push(itemImageDataFindCommand);
        this.commands.push(itemImageDataUpdateCommand);

        this.commands.push(itemImageCreateCommand);
        this.commands.push(itemImageDestroyCommand);
        this.commands.push(itemImageFindAllCommand);
        this.commands.push(itemImageFindCommand);
        this.commands.push(itemImageUpdateCommand);

        this.commands.push(itemInformationCreateCommand);
        this.commands.push(itemInformationDestroyCommand);
        this.commands.push(itemInformationFindAllCommand);
        this.commands.push(itemInformationFindCommand);
        this.commands.push(itemInformationUpdateCommand);

        this.commands.push(itemLocationCreateCommand);
        this.commands.push(itemLocationDestroyCommand);
        this.commands.push(itemLocationFindAllCommand);
        this.commands.push(itemLocationFindCommand);
        this.commands.push(itemLocationUpdateCommand);

        this.commands.push(locationMarkerCreateCommand);
        this.commands.push(locationMarkerDestroyCommand);
        this.commands.push(locationMarkerFindAllCommand);
        this.commands.push(locationMarkerFindCommand);
        this.commands.push(locationMarkerUpdateCommand);

        this.commands.push(msgInfoCreateCommand);
        this.commands.push(msgInfoDestroyCommand);
        this.commands.push(msgInfoFindAllCommand);
        this.commands.push(msgInfoFindCommand);
        this.commands.push(msgInfoUpdateCommand);

        this.commands.push(itemCategoryCreateCommand);
        this.commands.push(itemCategoryDestroyCommand);
        this.commands.push(itemCategoryFindAllCommand);
        this.commands.push(itemCategoryFindCommand);
        this.commands.push(itemCategoryFindRootCommand);
        this.commands.push(itemCategoryUpdateCommand);

        this.commands.push(shippingCreateCommand);
        this.commands.push(shippingDestroyCommand);
        this.commands.push(shippingFindAllCommand);
        this.commands.push(shippingFindCommand);
        this.commands.push(shippingUpdateCommand);

        this.commands.push(createProfileCommand);
        this.commands.push(getProfileCommand);
        this.commands.push(updateProfileCommand);

        this.commands.push(findItemsCommand);
        this.commands.push(findOwnItemsCommand);
        this.commands.push(getItemCommand);

        this.commands.push(helpCommand);

        for (const o of this.commands) {
            this.log.debug('Command ' + o.name + ' was pushed');
        }

    }

    public get(commandName: string): RpcCommand<Bookshelf.Model<any>> {
        this.log.debug('Looking for command <' + commandName + '>');
        for (const command of this.commands) {
            if (command.name.toLowerCase() === commandName.toLowerCase()) {
                this.log.debug('Found ' + command.name.toLowerCase());
                return command;
            }
        }
        throw new NotFoundException('Couldn\'t find command <' + commandName + '>\n');
    }
}
// tslint:enable:array-type
