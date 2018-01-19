/**
 * CommandName
 *
 */

export enum CommandName {

    MARKET              = 'market',
    MARKET_LIST         =   'list',
    MARKET_ADD          =   'add',
    PROFILE             = 'profile',
    PROFILE_LIST        =   'list',
    PROFILE_GET         =   'get',
    PROFILE_ADD         =   'add',
    PROFILE_UPDATE      =   'update',
    PROFILE_REMOVE      =   'remove',
    PROFILE_ADDRESS     =   'address',
    PROFILE_FAVORITE    =   'favorite',

    ADDRESS             = 'address',
    ADDRESS_LIST        =   'list',
    ADDRESS_ADD         =   'add',
    ADDRESS_UPDATE      =   'update',
    ADDRESS_REMOVE      = 'remove',

    FAVORITE            = 'favorite',
    FAVORITE_LIST       =   'list',
    FAVORITE_ADD        =   'add',
    FAVORITE_REMOVE     =   'remove',

    CATEGORY            = 'category',
    CATEGORY_LIST       =   'list',
    CATEGORY_GET        =   'get',
    CATEGORY_ADD        =   'add',
    CATEGORY_UPDATE     =   'update',
    CATEGORY_REMOVE     =   'remove',
    CATEGORY_SEARCH     =   'search',

    TEMPLATE                = 'market',
    TEMPLATE_SEARCH         =   'search',
    TEMPLATE_GET            =   'get',
    TEMPLATE_ADD            =   'add',
    TEMPLATE_REMOVE         =   'remove',
    TEMPLATE_INFORMATION    =   'information',
    TEMPLATE_IMAGE          =   'image',
    TEMPLATE_LOCATION       =   'location',
    TEMPLATE_SHIPPING       =   'shipping',
    TEMPLATE_MESSAGING      =   'messaging',
    TEMPLATE_PAYMENT        =   'payment',
    TEMPLATE_ESCROW         =   'escrow',
    TEMPLATE_POST           =   'post',
    TEMPLATE_IMPORT         =   'import',

    ITEMINFORMATION         = 'iteminformation',
    ITEMINFORMATION_LIST    =   'list',
    ITEMINFORMATION_ADD     =   'add',
    ITEMINFORMATION_REMOVE  =   'remove',

    ITEMLOCATION            = 'itemlocation',
    ITEMLOCATION_ADD        =   'add',
    ITEMLOCATION_UPDATE     =   'update',
    ITEMLOCATION_REMOVE     =   'remove',

    SHIPPINGDESTINATION         = 'shippingdestination',
    SHIPPINGDESTINATION_LIST    =   'list',
    SHIPPINGDESTINATION_ADD     =   'add',
    SHIPPINGDESTINATION_REMOVE  =   'remove',

    MESSAGINGINFORMATION        = 'messaginginformation',
    MESSAGINGINFORMATION_UPDATE =   'update',

    PAYMENTINFORMATION          = 'paymentinformation',
    PAYMENTINFORMATION_UPDATE   =   'update',

    ESCROW          = 'escrow',
    ESCROW_ADD      =   'add',
    ESCROW_UPDATE   =   'update',
    ESCROW_REMOVE   =   'remove',
    ESCROW_LOCK     =   'lock',
    ESCROW_REFUND   =   'refund',
    ESCROW_RELEASE  =   'release',

    ITEM            = 'item',
    ITEM_SEARCH     =   'search',
    ITEM_SEARCH_OWN =   'searchown',
    ITEM_GET        =   'get',

    BID             = 'bid',
    BID_SEARCH      =   'search',
    BID_ACCEPT      =   'accept',
    BID_CANCEL      =   'cancel',
    BID_REJECT      =   'reject',
    BID_SEND        =   'send',

    ADMIN           = 'admin',
    ADMIN_DATA      =   'data',

    DATA            = 'data',
    DATA_ADD        =   'add',
    DATA_GENERATE   =   'generate',
    DATA            =   'clean',

    DAEMON          = 'daemon',
    HELP            = 'help'

}
