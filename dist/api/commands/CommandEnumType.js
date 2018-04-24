"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_enums_1 = require("ts-enums");
const Command_1 = require("./Command");
const Environment_1 = require("../../core/helpers/Environment");
class CommandEnumType extends ts_enums_1.Enum {
    constructor() {
        super();
        this.DAEMON_ROOT = new Command_1.Command('daemon', 'daemon', true, [], Environment_1.EnvironmentType.ALL);
        this.HELP_ROOT = new Command_1.Command('help', 'help', true, [], Environment_1.EnvironmentType.ALL);
        this.DATA_ADD = new Command_1.Command('dataadd', 'add', false);
        this.DATA_GENERATE = new Command_1.Command('datagenerate', 'generate', false);
        this.DATA_CLEAN = new Command_1.Command('dataclean', 'clean', false);
        this.DATA_ROOT = new Command_1.Command('data', 'data', true, [this.DATA_ADD, this.DATA_GENERATE, this.DATA_CLEAN], Environment_1.EnvironmentType.DEVELOPMENT);
        // public ADMIN_DATA: Command    = new Command('admindata', 'data', true); // link to root
        this.ADMIN_ROOT = new Command_1.Command('admin', 'admin', true, [this.DATA_ROOT], Environment_1.EnvironmentType.DEVELOPMENT);
        this.BID_SEARCH = new Command_1.Command('bidsearch', 'search', false);
        this.BID_ACCEPT = new Command_1.Command('bidaccept', 'accept', false);
        this.BID_CANCEL = new Command_1.Command('bidcancel', 'cancel', false);
        this.BID_REJECT = new Command_1.Command('bidreject', 'reject', false);
        this.BID_SEND = new Command_1.Command('bidsend', 'send', false);
        this.BID_ROOT = new Command_1.Command('bid', 'bid', true, [this.BID_SEARCH, this.BID_ACCEPT, this.BID_CANCEL, this.BID_REJECT, this.BID_SEND], Environment_1.EnvironmentType.ALL);
        this.ITEM_SEARCH = new Command_1.Command('itemsearch', 'search', false);
        this.ITEM_GET = new Command_1.Command('itemget', 'get', false);
        this.ITEM_POST_UPDATE = new Command_1.Command('itempostupdate', 'update', false);
        this.ITEM_FLAG = new Command_1.Command('itemflag', 'flag', false);
        this.ITEM_ROOT = new Command_1.Command('item', 'item', true, [this.ITEM_SEARCH, this.ITEM_GET, this.ITEM_POST_UPDATE, this.ITEM_FLAG], Environment_1.EnvironmentType.ALL);
        this.ESCROW_ADD = new Command_1.Command('escrowadd', 'add', false);
        this.ESCROW_UPDATE = new Command_1.Command('escrowupdate', 'update', false);
        this.ESCROW_REMOVE = new Command_1.Command('escrowremove', 'remove', false);
        this.ESCROW_LOCK = new Command_1.Command('escrowlock', 'lock', false);
        this.ESCROW_REFUND = new Command_1.Command('escrowrefund', 'refund', false);
        this.ESCROW_RELEASE = new Command_1.Command('escrowrelease', 'release', false);
        this.ESCROW_ROOT = new Command_1.Command('escrow', 'escrow', true, [this.ESCROW_ADD, this.ESCROW_UPDATE, this.ESCROW_REMOVE, this.ESCROW_LOCK, this.ESCROW_REFUND, this.ESCROW_RELEASE], Environment_1.EnvironmentType.ALL);
        this.PAYMENTINFORMATION_UPDATE = new Command_1.Command('paymentinformationupdate', 'update', false);
        this.PAYMENTINFORMATION_ROOT = new Command_1.Command('paymentinformation', 'payment', true, [this.PAYMENTINFORMATION_UPDATE], Environment_1.EnvironmentType.ALL);
        this.MESSAGINGINFORMATION_UPDATE = new Command_1.Command('messaginginformationupdate', 'update', false);
        this.MESSAGINGINFORMATION_ROOT = new Command_1.Command('messaginginformation', 'messaging', true, [this.MESSAGINGINFORMATION_UPDATE], Environment_1.EnvironmentType.ALL);
        this.SHIPPINGDESTINATION_LIST = new Command_1.Command('shippingdestinationlist', 'list', false);
        this.SHIPPINGDESTINATION_ADD = new Command_1.Command('shippingdestinationadd', 'add', false);
        this.SHIPPINGDESTINATION_REMOVE = new Command_1.Command('shippingdestinationremove', 'remove', false);
        this.SHIPPINGDESTINATION_ROOT = new Command_1.Command('shippingdestination', 'shipping', true, [this.SHIPPINGDESTINATION_LIST, this.SHIPPINGDESTINATION_ADD, this.SHIPPINGDESTINATION_REMOVE], Environment_1.EnvironmentType.ALL);
        this.ITEMLOCATION_ADD = new Command_1.Command('itemlocationadd', 'add', false);
        this.ITEMLOCATION_UPDATE = new Command_1.Command('itemlocationupdate', 'update', false);
        this.ITEMLOCATION_REMOVE = new Command_1.Command('itemlocationremove', 'remove', false);
        this.ITEMLOCATION_ROOT = new Command_1.Command('itemlocation', 'location', true, [this.ITEMLOCATION_ADD, this.ITEMLOCATION_UPDATE, this.ITEMLOCATION_REMOVE], Environment_1.EnvironmentType.ALL);
        this.ITEMIMAGE_LIST = new Command_1.Command('itemimagelist', 'list', false);
        this.ITEMIMAGE_ADD = new Command_1.Command('itemimageadd', 'add', false);
        this.ITEMIMAGE_REMOVE = new Command_1.Command('itemimageremove', 'remove', false);
        this.ITEMIMAGE_ROOT = new Command_1.Command('itemimage', 'image', true, [this.ITEMIMAGE_LIST, this.ITEMIMAGE_ADD, this.ITEMIMAGE_REMOVE], Environment_1.EnvironmentType.ALL);
        this.ITEMINFORMATION_GET = new Command_1.Command('iteminformationget', 'get', false);
        this.ITEMINFORMATION_ADD = new Command_1.Command('iteminformationadd', 'add', false);
        this.ITEMINFORMATION_UPDATE = new Command_1.Command('iteminformationupdate', 'update', false);
        this.ITEMINFORMATION_ROOT = new Command_1.Command('iteminformation', 'information', true, [this.ITEMINFORMATION_GET, this.ITEMINFORMATION_ADD, this.ITEMINFORMATION_UPDATE], Environment_1.EnvironmentType.ALL);
        this.TEMPLATE_SEARCH = new Command_1.Command('templatesearch', 'search', false);
        this.TEMPLATE_GET = new Command_1.Command('templateget', 'get', false);
        this.TEMPLATE_ADD = new Command_1.Command('templateadd', 'add', false);
        this.TEMPLATE_REMOVE = new Command_1.Command('templateremove', 'remove', false);
        this.TEMPLATE_POST = new Command_1.Command('templatepost', 'post', false);
        this.TEMPLATE_IMPORT = new Command_1.Command('templateimport', 'import', false);
        this.TEMPLATE_ROOT = new Command_1.Command('template', 'template', true, [this.TEMPLATE_SEARCH, this.TEMPLATE_GET, this.TEMPLATE_ADD, this.TEMPLATE_REMOVE, this.TEMPLATE_POST, this.TEMPLATE_IMPORT,
            this.ITEMINFORMATION_ROOT, this.ITEMIMAGE_ROOT, this.ITEMLOCATION_ROOT, this.SHIPPINGDESTINATION_ROOT,
            this.MESSAGINGINFORMATION_ROOT, this.PAYMENTINFORMATION_ROOT, this.ESCROW_ROOT], Environment_1.EnvironmentType.ALL);
        this.CATEGORY_LIST = new Command_1.Command('categorylist', 'list', false);
        this.CATEGORY_GET = new Command_1.Command('categoryget', 'get', false);
        this.CATEGORY_ADD = new Command_1.Command('categoryadd', 'add', false);
        this.CATEGORY_UPDATE = new Command_1.Command('categoryupdate', 'update', false);
        this.CATEGORY_REMOVE = new Command_1.Command('categoryremove', 'remove', false);
        this.CATEGORY_SEARCH = new Command_1.Command('categorysearch', 'search', false);
        this.CATEGORY_ROOT = new Command_1.Command('category', 'category', true, [this.CATEGORY_LIST, this.CATEGORY_GET, this.CATEGORY_ADD, this.CATEGORY_UPDATE, this.CATEGORY_REMOVE, this.CATEGORY_SEARCH], Environment_1.EnvironmentType.ALL);
        this.FAVORITE_LIST = new Command_1.Command('favoritelist', 'list', false);
        this.FAVORITE_ADD = new Command_1.Command('favoriteadd', 'add', false);
        this.FAVORITE_REMOVE = new Command_1.Command('favoriteremove', 'remove', false);
        this.FAVORITE_ROOT = new Command_1.Command('favorite', 'favorite', true, [this.FAVORITE_LIST, this.FAVORITE_ADD, this.FAVORITE_REMOVE], Environment_1.EnvironmentType.ALL);
        this.ADDRESS_LIST = new Command_1.Command('addresslist', 'list', false);
        this.ADDRESS_ADD = new Command_1.Command('addressadd', 'add', false);
        this.ADDRESS_UPDATE = new Command_1.Command('addressupdate', 'update', false);
        this.ADDRESS_REMOVE = new Command_1.Command('addressremove', 'remove', false);
        this.ADDRESS_ROOT = new Command_1.Command('address', 'address', true, [this.ADDRESS_LIST, this.ADDRESS_ADD, this.ADDRESS_UPDATE, this.ADDRESS_REMOVE], Environment_1.EnvironmentType.ALL);
        this.PROFILE_LIST = new Command_1.Command('profilelist', 'list', false);
        this.PROFILE_GET = new Command_1.Command('profileget', 'get', false);
        this.PROFILE_ADD = new Command_1.Command('profileadd', 'add', false);
        this.PROFILE_UPDATE = new Command_1.Command('profileupdate', 'update', false);
        this.PROFILE_REMOVE = new Command_1.Command('profileremove', 'remove', false);
        // public PROFILE_ADDRESS: Command     = new Command('profileaddress', 'address', true);      // link to root
        // public PROFILE_FAVORITE: Command    = new Command('profilefavorite', 'favorite', true);    // link to root
        this.PROFILE_ROOT = new Command_1.Command('profile', 'profile', true, [this.PROFILE_LIST, this.PROFILE_GET, this.PROFILE_ADD, this.PROFILE_UPDATE, this.PROFILE_REMOVE,
            this.ADDRESS_ROOT, this.FAVORITE_ROOT], Environment_1.EnvironmentType.ALL);
        this.MARKET_LIST = new Command_1.Command('marketlist', 'list', false);
        this.MARKET_ADD = new Command_1.Command('marketadd', 'add', false);
        this.MARKET_ROOT = new Command_1.Command('market', 'market', true, [this.MARKET_LIST, this.MARKET_ADD], Environment_1.EnvironmentType.ALL);
        this.SHOPPINGCART_LIST = new Command_1.Command('cartlist', 'list', false);
        this.SHOPPINGCART_GET = new Command_1.Command('cartget', 'get', false);
        this.SHOPPINGCART_ADD = new Command_1.Command('cartadd', 'add', false);
        this.SHOPPINGCART_UPDATE = new Command_1.Command('cartupdate', 'update', false);
        this.SHOPPINGCART_REMOVE = new Command_1.Command('cartremove', 'remove', false);
        this.SHOPPINGCART_CLEAR = new Command_1.Command('cartclear', 'clear', false);
        this.SHOPPINGCART_ROOT = new Command_1.Command('cart', 'cart', true, [this.SHOPPINGCART_LIST, this.SHOPPINGCART_GET, this.SHOPPINGCART_ADD, this.SHOPPINGCART_UPDATE,
            this.SHOPPINGCART_REMOVE, this.SHOPPINGCART_CLEAR], Environment_1.EnvironmentType.ALL);
        this.SHOPPINGCARTITEM_LIST = new Command_1.Command('cartitemlist', 'list', false);
        this.SHOPPINGCARTITEM_ADD = new Command_1.Command('cartitemadd', 'add', false);
        this.SHOPPINGCARTITEM_REMOVE = new Command_1.Command('cartitemremove', 'remove', false);
        this.SHOPPINGCARTITEM_ROOT = new Command_1.Command('cartitem', 'cartitem', true, [this.SHOPPINGCARTITEM_LIST, this.SHOPPINGCARTITEM_ADD, this.SHOPPINGCARTITEM_REMOVE], Environment_1.EnvironmentType.ALL);
        this.ITEMOBJECT_SEARCH = new Command_1.Command('itemobjectsearch', 'search', false);
        this.ITEMOBJECT_ROOT = new Command_1.Command('itemobject', 'itemobject', true, [this.ITEMOBJECT_SEARCH], Environment_1.EnvironmentType.ALL);
        this.ORDER_SEARCH = new Command_1.Command('ordersearch', 'search', false);
        this.ORDER_ROOT = new Command_1.Command('order', 'order', true, [this.ORDER_SEARCH], Environment_1.EnvironmentType.ALL);
        this.PRICETICKER_ROOT = new Command_1.Command('priceticker', 'priceticker', true);
        this.CURRENCYPRICE_ROOT = new Command_1.Command('currencyprice', 'currencyprice', true);
        this.initEnum('Command');
    }
    get rootCommands() {
        const rootCommands = [];
        for (const cmd of this.values) {
            if (cmd.isRoot) {
                // if (cmd.commandType === EnvironmentType.ALL || (nodeEnv ? nodeEnv.toUpperCase() === cmd.commandType : true)) {
                rootCommands.push(cmd);
                // }
            }
        }
        return rootCommands;
    }
}
exports.CommandEnumType = CommandEnumType;
exports.Commands = new CommandEnumType();
//# sourceMappingURL=CommandEnumType.js.map