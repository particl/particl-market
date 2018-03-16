/**
 * constants.Targets
 * ------------------------------------------------
 *
 * This is for our IOC so have a unique key/target for
 * our controllers, services and repositories
 *
 * This file is generated with the task `$ npm run console update:targets`.
 */

export const Targets = {
    Model:     {
        Address: 'Address',
        Bid: 'Bid',
        BidData: 'BidData',
        CryptocurrencyAddress: 'CryptocurrencyAddress',
        CurrencyPrice: 'CurrencyPrice',
        Escrow: 'Escrow',
        EscrowRatio: 'EscrowRatio',
        FavoriteItem: 'FavoriteItem',
        FlaggedItem: 'FlaggedItem',
        ItemCategory: 'ItemCategory',
        ItemImage: 'ItemImage',
        ItemImageData: 'ItemImageData',
        ItemInformation: 'ItemInformation',
        ItemLocation: 'ItemLocation',
        ItemPrice: 'ItemPrice',
        ListingItem: 'ListingItem',
        ListingItemObject: 'ListingItemObject',
        ListingItemTemplate: 'ListingItemTemplate',
        LocationMarker: 'LocationMarker',
        Market: 'Market',
        MessagingInformation: 'MessagingInformation',
        PaymentInformation: 'PaymentInformation',
        PriceTicker: 'PriceTicker',
        Profile: 'Profile',
        ShippingDestination: 'ShippingDestination',
        ShippingPrice: 'ShippingPrice',
        ShoppingCartItem: 'ShoppingCartItem',
        ShoppingCart: 'ShoppingCart',
        User: 'User'
    },
    Repository:     {
        AddressRepository: 'AddressRepository',
        BidDataRepository: 'BidDataRepository',
        BidRepository: 'BidRepository',
        CryptocurrencyAddressRepository: 'CryptocurrencyAddressRepository',
        CurrencyPriceRepository: 'CurrencyPriceRepository',
        EscrowRatioRepository: 'EscrowRatioRepository',
        EscrowRepository: 'EscrowRepository',
        FavoriteItemRepository: 'FavoriteItemRepository',
        FlaggedItemRepository: 'FlaggedItemRepository',
        ItemCategoryRepository: 'ItemCategoryRepository',
        ItemImageDataRepository: 'ItemImageDataRepository',
        ItemImageRepository: 'ItemImageRepository',
        ItemInformationRepository: 'ItemInformationRepository',
        ItemLocationRepository: 'ItemLocationRepository',
        ItemPriceRepository: 'ItemPriceRepository',
        ListingItemObjectRepository: 'ListingItemObjectRepository',
        ListingItemRepository: 'ListingItemRepository',
        ListingItemTemplateRepository: 'ListingItemTemplateRepository',
        LocationMarkerRepository: 'LocationMarkerRepository',
        MarketRepository: 'MarketRepository',
        MessagingInformationRepository: 'MessagingInformationRepository',
        PaymentInformationRepository: 'PaymentInformationRepository',
        PriceTickerRepository: 'PriceTickerRepository',
        ProfileRepository: 'ProfileRepository',
        ShippingDestinationRepository: 'ShippingDestinationRepository',
        ShippingPriceRepository: 'ShippingPriceRepository',
        ShoppingCartItemRepository: 'ShoppingCartItemRepository',
        ShoppingCartRepository: 'ShoppingCartRepository',
        UserRepository: 'UserRepository'
    },
    Service:     {
        AddressService: 'AddressService',
        BidDataService: 'BidDataService',
        BidService: 'BidService',
        CoreRpcService: 'CoreRpcService',
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        CurrencyPriceService: 'CurrencyPriceService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
        DefaultMarketService: 'DefaultMarketService',
        DefaultProfileService: 'DefaultProfileService',
        EscrowRatioService: 'EscrowRatioService',
        EscrowService: 'EscrowService',
        FavoriteItemService: 'FavoriteItemService',
        FlaggedItemService: 'FlaggedItemService',
        ItemCategoryService: 'ItemCategoryService',
        ItemImageDataService: 'ItemImageDataService',
        ItemImageService: 'ItemImageService',
        ItemInformationService: 'ItemInformationService',
        ItemLocationService: 'ItemLocationService',
        ItemPriceService: 'ItemPriceService',
        ListingItemObjectService: 'ListingItemObjectService',
        ListingItemService: 'ListingItemService',
        ListingItemTemplateService: 'ListingItemTemplateService',
        LocationMarkerService: 'LocationMarkerService',
        MarketService: 'MarketService',
        SmsgService: 'SmsgService',
        MessagingInformationService: 'MessagingInformationService',
        PaymentInformationService: 'PaymentInformationService',
        PriceTickerService: 'PriceTickerService',
        ProfileService: 'ProfileService',
        ShippingDestinationService: 'ShippingDestinationService',
        ShippingPriceService: 'ShippingPriceService',
        ShoppingCartItemService: 'ShoppingCartItemService',
        ShoppingCartService: 'ShoppingCartService',
        TestDataService: 'TestDataService',
        UserService: 'UserService'
    },
    Command:     {
        address: {
            AddressAddCommand: 'AddressAddCommand',
            AddressListCommand: 'AddressListCommand',
            AddressRemoveCommand: 'AddressRemoveCommand',
            AddressRootCommand: 'AddressRootCommand',
            AddressUpdateCommand: 'AddressUpdateCommand'
        },
        admin: {
            AdminCommand: 'AdminCommand'
        },
        BaseCommand: 'BaseCommand',
        bid: {
            BidAcceptCommand: 'BidAcceptCommand',
            BidCancelCommand: 'BidCancelCommand',
            BidRejectCommand: 'BidRejectCommand',
            BidRootCommand: 'BidRootCommand',
            BidSearchCommand: 'BidSearchCommand',
            BidSendCommand: 'BidSendCommand'
        },
        Command: 'Command',
        CommandEnumType: 'CommandEnumType',
        daemon: {
            DaemonRootCommand: 'DaemonRootCommand'
        },
        data: {
            DataAddCommand: 'DataAddCommand',
            DataCleanCommand: 'DataCleanCommand',
            DataGenerateCommand: 'DataGenerateCommand',
            DataRootCommand: 'DataRootCommand'
        },
        escrow: {
            EscrowAddCommand: 'EscrowAddCommand',
            EscrowRemoveCommand: 'EscrowRemoveCommand',
            EscrowLockCommand: 'EscrowLockCommand',
            EscrowRefundCommand: 'EscrowRefundCommand',
            EscrowReleaseCommand: 'EscrowReleaseCommand',
            EscrowRootCommand: 'EscrowRootCommand',
            EscrowUpdateCommand: 'EscrowUpdateCommand'
        },
        favorite: {
            FavoriteAddCommand: 'FavoriteAddCommand',
            FavoriteListCommand: 'FavoriteListCommand',
            FavoriteRemoveCommand: 'FavoriteRemoveCommand',
            FavoriteRootCommand: 'FavoriteRootCommand'
        },
        HelpCommand: 'HelpCommand',
        itemcategory: {
            ItemCategoryAddCommand: 'ItemCategoryAddCommand',
            ItemCategorySearchCommand: 'ItemCategorySearchCommand',
            ItemCategoryGetCommand: 'ItemCategoryGetCommand',
            ItemCategoryListCommand: 'ItemCategoryListCommand',
            ItemCategoryRemoveCommand: 'ItemCategoryRemoveCommand',
            ItemCategoryRootCommand: 'ItemCategoryRootCommand',
            ItemCategoryUpdateCommand: 'ItemCategoryUpdateCommand'
        },
        itemimage: {
            ItemImageAddCommand: 'ItemImageAddCommand',
            ItemImageListCommand: 'ItemImageListCommand',
            ItemImageRemoveCommand: 'ItemImageRemoveCommand',
            ItemImageRootCommand: 'ItemImageRootCommand'
        },
        iteminformation: {
            ItemInformationAddCommand: 'ItemInformationAddCommand',
            ItemInformationGetCommand: 'ItemInformationGetCommand',
            ItemInformationRootCommand: 'ItemInformationRootCommand',
            ItemInformationUpdateCommand: 'ItemInformationUpdateCommand'
        },
        itemlocation: {
            ItemLocationAddCommand: 'ItemLocationAddCommand',
            ItemLocationRemoveCommand: 'ItemLocationRemoveCommand',
            ItemLocationRootCommand: 'ItemLocationRootCommand',
            ItemLocationUpdateCommand: 'ItemLocationUpdateCommand'
        },
        listingitem: {
            ListingItemGetCommand: 'ListingItemGetCommand',
            ListingItemRootCommand: 'ListingItemRootCommand',
            ListingItemSearchCommand: 'ListingItemSearchCommand',
            ListingItemUpdateCommand: 'ListingItemUpdateCommand',
            ListingItemFlagCommand: 'ListingItemFlagCommand'
        },
        listingitemobject: {
            ListingItemObjectRootCommand: 'ListingItemObjectRootCommand',
            ListingItemObjectSearchCommand: 'ListingItemObjectSearchCommand'
        },
        listingitemtemplate: {
            ListingItemTemplateAddCommand: 'ListingItemTemplateAddCommand',
            ListingItemTemplateGetCommand: 'ListingItemTemplateGetCommand',
            ListingItemTemplatePostCommand: 'ListingItemTemplatePostCommand',
            ListingItemTemplateRemoveCommand: 'ListingItemTemplateRemoveCommand',
            ListingItemTemplateRootCommand: 'ListingItemTemplateRootCommand',
            ListingItemTemplateSearchCommand: 'ListingItemTemplateSearchCommand'
        },
        market: {
            MarketAddCommand: 'MarketAddCommand',
            MarketListCommand: 'MarketListCommand',
            MarketRootCommand: 'MarketRootCommand'
        },
        messaginginformation: {
            MessagingInformationRootCommand: 'MessagingInformationRootCommand',
            MessagingInformationUpdateCommand: 'MessagingInformationUpdateCommand'
        },
        paymentinformation: {
            PaymentInformationRootCommand: 'PaymentInformationRootCommand',
            PaymentInformationUpdateCommand: 'PaymentInformationUpdateCommand'
        },
        priceticker: {
            PriceTickerRootCommand: 'PriceTickerRootCommand'
        },
        profile: {
            ProfileAddCommand: 'ProfileAddCommand',
            ProfileRemoveCommand: 'ProfileRemoveCommand',
            ProfileGetCommand: 'ProfileGetCommand',
            ProfileListCommand: 'ProfileListCommand',
            ProfileRootCommand: 'ProfileRootCommand',
            ProfileUpdateCommand: 'ProfileUpdateCommand'
        },
        RpcCommandInterface: 'RpcCommandInterface',
        shippingdestination: {
            ShippingDestinationAddCommand: 'ShippingDestinationAddCommand',
            ShippingDestinationListCommand: 'ShippingDestinationListCommand',
            ShippingDestinationRemoveCommand: 'ShippingDestinationRemoveCommand',
            ShippingDestinationRootCommand: 'ShippingDestinationRootCommand'
        },
        shoppingcart: {
            ShoppingCartAddCommand: 'ShoppingCartAddCommand',
            ShoppingCartClearCommand: 'ShoppingCartClearCommand',
            ShoppingCartGetCommand: 'ShoppingCartGetCommand',
            ShoppingCartListCommand: 'ShoppingCartListCommand',
            ShoppingCartRemoveCommand: 'ShoppingCartRemoveCommand',
            ShoppingCartRootCommand: 'ShoppingCartRootCommand',
            ShoppingCartUpdateCommand: 'ShoppingCartUpdateCommand'
        },
        shoppingcartitem: {
            ShoppingCartItemAddCommand: 'ShoppingCartItemAddCommand',
            ShoppingCartItemListCommand: 'ShoppingCartItemListCommand',
            ShoppingCartItemRemoveCommand: 'ShoppingCartItemRemoveCommand',
            ShoppingCartItemRootCommand: 'ShoppingCartItemRootCommand'
        },
        currencyprice: {
            CurrencyPriceRootCommand: 'CurrencyPriceRootCommand'
        }
    },
    Factory:     {
        BidFactory: 'BidFactory',
        EscrowFactory: 'EscrowFactory',
        ImageFactory: 'ImageFactory',
        ItemCategoryFactory: 'ItemCategoryFactory',
        ListingItemFactory: 'ListingItemFactory',
        MessagingInformationFactory: 'MessagingInformationFactory',
        RpcCommandFactory: 'RpcCommandFactory'
    },
    MessageProcessor:     {
        AcceptBidMessageProcessor: 'AcceptBidMessageProcessor',
        BidMessageProcessor: 'BidMessageProcessor',
        CancelBidMessageProcessor: 'CancelBidMessageProcessor',
        ListingItemMessageProcessor: 'ListingItemMessageProcessor',
        MessageProcessor: 'MessageProcessor',
        MessageProcessorInterface: 'MessageProcessorInterface',
        RejectBidMessageProcessor: 'RejectBidMessageProcessor',
        TestMessageProcessor: 'TestMessageProcessor',
        UpdateListingItemMessageProcessor: 'UpdateListingItemMessageProcessor'
    },
    Middleware:     {
        AuthenticateMiddleware: 'AuthenticateMiddleware',
        PopulateUserMiddleware: 'PopulateUserMiddleware',
        RestApiMiddleware: 'RestApiMiddleware',
        MulterMiddleware: 'MulterMiddleware',
        RpcMiddleware: 'RpcMiddleware'
    },
    Listener:     {
        ServerStartedListener: 'ServerStartedListener',
        ListingItemReceivedListener: 'ListingItemReceivedListener',
        user: {
            UserAuthenticatedListener: 'UserAuthenticatedListener',
            UserCreatedListener: 'UserCreatedListener'
        }
    },
    Controller:     {
        AddressController: 'AddressController',
        BidController: 'BidController',
        BidDataController: 'BidDataController',
        CryptocurrencyAddressController: 'CryptocurrencyAddressController',
        CurrencyPriceController: 'CurrencyPriceController',
        EscrowController: 'EscrowController',
        EscrowRatioController: 'EscrowRatioController',
        FavoriteItemController: 'FavoriteItemController',
        FlaggedItemController: 'FlaggedItemController',
        ItemCategoryController: 'ItemCategoryController',
        ItemImageController: 'ItemImageController',
        ItemImageDataController: 'ItemImageDataController',
        ItemInformationController: 'ItemInformationController',
        ItemLocationController: 'ItemLocationController',
        ItemPriceController: 'ItemPriceController',
        ListingItemController: 'ListingItemController',
        ListingItemObjectController: 'ListingItemObjectController',
        ListingItemTemplateController: 'ListingItemTemplateController',
        LocationMarkerController: 'LocationMarkerController',
        MarketController: 'MarketController',
        MessagingInformationController: 'MessagingInformationController',
        PaymentInformationController: 'PaymentInformationController',
        PriceTickerController: 'PriceTickerController',
        ProfileController: 'ProfileController',
        RpcController: 'RpcController',
        ShippingDestinationController: 'ShippingDestinationController',
        ShippingPriceController: 'ShippingPriceController',
        ShoppingCartItemController: 'ShoppingCartItemController',
        ShoppingCartController: 'ShoppingCartController',
        UserController: 'UserController'
    }
};
