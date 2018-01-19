import { Enum, EnumValue } from 'ts-enums';
import { Command } from './Command';

export class CommandEnumType extends Enum<Command> {

    public MARKET_LIST: Command         = new Command('marketlist', 'list', false);
    public MARKET_ADD: Command          = new Command('marketadd', 'add', false);
    public MARKET: Command              = new Command('market', 'market', true,
        [this.MARKET_LIST, this.MARKET_ADD]);

    public PROFILE_LIST: Command        = new Command('profilelist', 'list', false);
    public PROFILE_GET: Command         = new Command('profileget', 'get', false);
    public PROFILE_ADD: Command         = new Command('profileadd', 'add', false);
    public PROFILE_UPDATE: Command      = new Command('profileupdate', 'update', false);
    public PROFILE_REMOVE: Command      = new Command('profileremove', 'remove', false);
    public PROFILE_ADDRESS: Command     = new Command('profileaddress', 'address', false);
    public PROFILE_FAVORITE: Command    = new Command('profilefavorite', 'favorite', false);
    public PROFILE: Command             = new Command('profile', 'profile', true,
        [this.PROFILE_LIST, this.PROFILE_GET, this.PROFILE_ADD, this.PROFILE_UPDATE, this.PROFILE_REMOVE,
            this.PROFILE_ADDRESS, this.PROFILE_FAVORITE]);

    public ADDRESS_LIST: Command        = new Command('addresslist', 'list', false);
    public ADDRESS_ADD: Command         = new Command('addressadd', 'add', false);
    public ADDRESS_UPDATE: Command      = new Command('addressupdate', 'update', false);
    public ADDRESS_REMOVE: Command      = new Command('addressremove', 'remove', false);
    public ADDRESS: Command             = new Command('address', 'address', true,
        [this.ADDRESS_LIST, this.ADDRESS_ADD, this.ADDRESS_UPDATE, this.ADDRESS_REMOVE]);

    public FAVORITE_LIST: Command       = new Command('favoritelist', 'list', false);
    public FAVORITE_ADD: Command        = new Command('favoriteadd', 'add', false);
    public FAVORITE_REMOVE: Command     = new Command('favoriteremove', 'remove', false);
    public FAVORITE: Command            = new Command('favorite', 'favorite', true,
        [this.ADDRESS_LIST, this.FAVORITE_LIST, this.FAVORITE_ADD, this.FAVORITE_REMOVE]);

    public CATEGORY_LIST: Command       = new Command('categorylist', 'list', false);
    public CATEGORY_GET: Command        = new Command('categoryget', 'get', false);
    public CATEGORY_ADD: Command        = new Command('categoryadd', 'add', false);
    public CATEGORY_UPDATE: Command     = new Command('categoryupdate', 'update', false);
    public CATEGORY_REMOVE: Command     = new Command('categoryremove', 'remove', false);
    public CATEGORY_SEARCH: Command     = new Command('categorysearch', 'search', false);
    public CATEGORY: Command            = new Command('category', 'category', true,
        [this.CATEGORY_LIST, this.CATEGORY_GET, this.CATEGORY_ADD, this.CATEGORY_UPDATE, this.CATEGORY_REMOVE, this.CATEGORY_SEARCH]);

    public TEMPLATE_SEARCH: Command         = new Command('templatesearch', 'search', false);
    public TEMPLATE_GET: Command            = new Command('templateget', 'get', false);
    public TEMPLATE_ADD: Command            = new Command('templateadd', 'add', false);
    public TEMPLATE_REMOVE: Command         = new Command('templateremove', 'remove', false);
    public TEMPLATE_INFORMATION: Command    = new Command('templateinformation', 'information', false);
    public TEMPLATE_IMAGE: Command          = new Command('templateimage', 'image', false);
    public TEMPLATE_LOCATION: Command       = new Command('templatelocation', 'location', false);
    public TEMPLATE_SHIPPING: Command       = new Command('templateshipping', 'shipping', false);
    public TEMPLATE_MESSAGING: Command      = new Command('templatemessaging', 'messaging', false);
    public TEMPLATE_PAYMENT: Command        = new Command('templatepayment', 'payment', false);
    public TEMPLATE_ESCROW: Command         = new Command('templateescrow', 'escrow', false);
    public TEMPLATE_POST: Command           = new Command('templatepost', 'post', false);
    public TEMPLATE_IMPORT: Command         = new Command('templateimport', 'import', false);
    public TEMPLATE: Command                = new Command('template', 'template', true,
        [this.TEMPLATE_SEARCH, this.TEMPLATE_GET, this.TEMPLATE_ADD, this.TEMPLATE_REMOVE, this.TEMPLATE_INFORMATION,
            this.TEMPLATE_IMAGE, this.TEMPLATE_LOCATION, this.TEMPLATE_SHIPPING, this.TEMPLATE_MESSAGING,
            this.TEMPLATE_PAYMENT, this.TEMPLATE_ESCROW, this.TEMPLATE_POST, this.TEMPLATE_IMPORT]);

    public ITEMINFORMATION_LIST: Command    = new Command('iteminformationlist', 'list', false);
    public ITEMINFORMATION_ADD: Command     = new Command('iteminformationadd', 'add', false);
    public ITEMINFORMATION_REMOVE: Command  = new Command('iteminformationremove', 'remove', false);
    public ITEMINFORMATION: Command         = new Command('iteminformation', 'iteminformation', true,
        [this.ITEMINFORMATION_LIST, this.ITEMINFORMATION_ADD, this.ITEMINFORMATION_REMOVE]);

    public ITEMLOCATION_ADD: Command    = new Command('itemlocationadd', 'add', false);
    public ITEMLOCATION_UPDATE: Command = new Command('itemlocationupdate', 'update', false);
    public ITEMLOCATION_REMOVE: Command = new Command('itemlocationremove', 'remove', false);
    public ITEMLOCATION: Command        = new Command('itemlocation', 'itemlocation', true,
        [this.ITEMLOCATION_ADD, this.ITEMLOCATION_UPDATE, this.ITEMLOCATION_REMOVE]);

    public SHIPPINGDESTINATION_LIST: Command    = new Command('shippingdestinationlist', 'list', false);
    public SHIPPINGDESTINATION_ADD: Command     = new Command('shippingdestinationadd', 'add', false);
    public SHIPPINGDESTINATION_REMOVE: Command  = new Command('shippingdestinationremove', 'remove', false);
    public SHIPPINGDESTINATION: Command         = new Command('shippingdestination', 'shippingdestination', true,
        [this.SHIPPINGDESTINATION_LIST, this.SHIPPINGDESTINATION_ADD, this.SHIPPINGDESTINATION_REMOVE]);

    public MESSAGINGINFORMATION_UPDATE: Command = new Command('messaginginformationupdate', 'update', false);
    public MESSAGINGINFORMATION: Command        = new Command('messaginginformation', 'messaginginformation', true,
        [this.MESSAGINGINFORMATION_UPDATE]);

    public PAYMENTINFORMATION_UPDATE: Command   = new Command('paymentinformationupdate', 'update', false);
    public PAYMENTINFORMATION: Command          = new Command('paymentinformation', 'paymentinformation', true,
        [this.PAYMENTINFORMATION_UPDATE]);

    public ESCROW_ADD: Command      = new Command('escrowadd', 'add', false);
    public ESCROW_UPDATE: Command   = new Command('escrowupdate', 'update', false);
    public ESCROW_REMOVE: Command   = new Command('escrowremove', 'remove', false);
    public ESCROW_LOCK: Command     = new Command('escrowlock', 'lock', false);
    public ESCROW_REFUND: Command   = new Command('escrowrefund', 'refund', false);
    public ESCROW_RELEASE: Command  = new Command('escrowrelease', 'release', false);
    public ESCROW: Command          = new Command('escrow', 'escrow', true,
        [this.ESCROW_ADD, this.ESCROW_UPDATE, this.ESCROW_REMOVE, this.ESCROW_LOCK, this.ESCROW_REFUND, this.ESCROW_RELEASE]);

    public ITEM_SEARCH: Command     = new Command('itemsearch', 'search', false);
    public ITEM_SEARCH_OWN: Command = new Command('itemsearchown', 'searchown', false);
    public ITEM_GET: Command        = new Command('itemget', 'get', false);
    public ITEM: Command            = new Command('item', 'item', true,
        [this.ITEM_SEARCH, this.ITEM_SEARCH_OWN, this.ITEM_GET]);

    public BID_SEARCH: Command  = new Command('bidsearch', 'search', false);
    public BID_ACCEPT: Command  = new Command('bidaccept', 'accept', false);
    public BID_CANCEL: Command  = new Command('bidcancel', 'cancel', false);
    public BID_REJECT: Command  = new Command('bidreject', 'reject', false);
    public BID_SEND: Command    = new Command('bidsend', 'send', false);
    public BID: Command         = new Command('bid', 'bid', true,
        [this.BID_SEARCH, this.BID_ACCEPT, this.BID_CANCEL, this.BID_REJECT, this.BID_SEND]);

    public ADMIN_DATA: Command    = new Command('admindata', 'data', false);
    public ADMIN: Command         = new Command('admin', 'admin', true,
        [this.ADMIN_DATA]);

    public DATA_ADD: Command        = new Command('dataadd', 'add', false);
    public DATA_GENERATE: Command   = new Command('datagenerate', 'generate', false);
    public DATA_CLEAN: Command      = new Command('dataclean', 'clean', false);
    public DATA: Command            = new Command('data', 'data', true,
        [this.DATA_ADD, this.DATA_GENERATE, this.DATA_CLEAN]);

    public DAEMON: Command  = new Command('daemon', 'daemon', true, []);
    public HELP: Command    = new Command('help', 'help', true, []);

    constructor() {
        super();
        this.initEnum('Command');
    }

    public getRootCommands(): Command[] {
        const rootCommands: Command[] = [];
        for (const cmd: Command in this.values.values) {
            if (cmd.isRoot) {
                rootCommands.push(cmd);
            }
        }
        return rootCommands;
    }
}
