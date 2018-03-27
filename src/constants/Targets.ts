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
        ActionMessage: 'ActionMessage',
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
        ListingItemObjectData: 'ListingItemObjectData',
        ListingItemTemplate: 'ListingItemTemplate',
        LocationMarker: 'LocationMarker',
        Market: 'Market',
        MessageData: 'MessageData',
        MessageEscrow: 'MessageEscrow',
        MessageInfo: 'MessageInfo',
        MessageObject: 'MessageObject',
        MessagingInformation: 'MessagingInformation',
        PaymentInformation: 'PaymentInformation',
        PriceTicker: 'PriceTicker',
        Profile: 'Profile',
        ShippingDestination: 'ShippingDestination',
        ShippingPrice: 'ShippingPrice',
        ShoppingCart: 'ShoppingCart',
        ShoppingCartItem: 'ShoppingCartItem',
        User: 'User'
    },
    Repository:     {
        ActionMessageRepository: 'ActionMessageRepository',
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
        ListingItemObjectDataRepository: 'ListingItemObjectDataRepository',
        ListingItemObjectRepository: 'ListingItemObjectRepository',
        ListingItemRepository: 'ListingItemRepository',
        ListingItemTemplateRepository: 'ListingItemTemplateRepository',
        LocationMarkerRepository: 'LocationMarkerRepository',
        MarketRepository: 'MarketRepository',
        MessageDataRepository: 'MessageDataRepository',
        MessageEscrowRepository: 'MessageEscrowRepository',
        MessageInfoRepository: 'MessageInfoRepository',
        MessageObjectRepository: 'MessageObjectRepository',
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
        ActionMessageService: 'ActionMessageService',
        AddressService: 'AddressService',
        BidActionService: 'BidActionService',
        BidDataService: 'BidDataService',
        BidService: 'BidService',
        CoreCookieService: 'CoreCookieService',
        CoreRpcService: 'CoreRpcService',
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        CurrencyPriceService: 'CurrencyPriceService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
        DefaultMarketService: 'DefaultMarketService',
        DefaultProfileService: 'DefaultProfileService',
        EscrowActionService: 'EscrowActionService',
        EscrowRatioService: 'EscrowRatioService',
        EscrowService: 'EscrowService',
        FavoriteItemService: 'FavoriteItemService',
        FlaggedItemService: 'FlaggedItemService',
        ItemCategoryService: 'ItemCategoryService',
        ItemImageDataService: 'ItemImageDataService',
        ItemImageHttpUploadService: 'ItemImageHttpUploadService',
        ItemImageService: 'ItemImageService',
        ItemInformationService: 'ItemInformationService',
        ItemLocationService: 'ItemLocationService',
        ItemPriceService: 'ItemPriceService',
        ListingItemActionService: 'ListingItemActionService',
        ListingItemObjectDataService: 'ListingItemObjectDataService',
        ListingItemObjectService: 'ListingItemObjectService',
        ListingItemService: 'ListingItemService',
        ListingItemTemplateService: 'ListingItemTemplateService',
        LocationMarkerService: 'LocationMarkerService',
        MarketService: 'MarketService',
        MessageDataService: 'MessageDataService',
        MessageEscrowService: 'MessageEscrowService',
        MessageInfoService: 'MessageInfoService',
        MessageObjectService: 'MessageObjectService',
        MessagingInformationService: 'MessagingInformationService',
        PaymentInformationService: 'PaymentInformationService',
        PriceTickerService: 'PriceTickerService',
        ProfileService: 'ProfileService',
        ShippingDestinationService: 'ShippingDestinationService',
        ShippingPriceService: 'ShippingPriceService',
        ShoppingCartItemService: 'ShoppingCartItemService',
        ShoppingCartService: 'ShoppingCartService',
        SmsgService: 'SmsgService',
        TestDataService: 'TestDataService',
        UserService: 'UserService',
        ObjectHashService: 'ObjectHashService'
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
        currencyprice: {
            CurrencyPriceRootCommand: 'CurrencyPriceRootCommand'
        },
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
            EscrowLockCommand: 'EscrowLockCommand',
            EscrowRefundCommand: 'EscrowRefundCommand',
            EscrowReleaseCommand: 'EscrowReleaseCommand',
            EscrowRemoveCommand: 'EscrowRemoveCommand',
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
            ItemCategoryGetCommand: 'ItemCategoryGetCommand',
            ItemCategoryListCommand: 'ItemCategoryListCommand',
            ItemCategoryRemoveCommand: 'ItemCategoryRemoveCommand',
            ItemCategoryRootCommand: 'ItemCategoryRootCommand',
            ItemCategorySearchCommand: 'ItemCategorySearchCommand',
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
            ListingItemFlagCommand: 'ListingItemFlagCommand',
            ListingItemGetCommand: 'ListingItemGetCommand',
            ListingItemRootCommand: 'ListingItemRootCommand',
            ListingItemSearchCommand: 'ListingItemSearchCommand',
            ListingItemUpdateCommand: 'ListingItemUpdateCommand'
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
            ProfileGetCommand: 'ProfileGetCommand',
            ProfileListCommand: 'ProfileListCommand',
            ProfileRemoveCommand: 'ProfileRemoveCommand',
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
        }
    },
    Factory:     {
        ActionMessageFactory: 'ActionMessageFactory',
        BidFactory: 'BidFactory',
        EscrowFactory: 'EscrowFactory',
        ImageFactory: 'ImageFactory',
        ItemCategoryFactory: 'ItemCategoryFactory',
        ListingItemFactory: 'ListingItemFactory',
        MessagingInformationFactory: 'MessagingInformationFactory',
        RpcCommandFactory: 'RpcCommandFactory'
    },
    MessageProcessor:     {
        deprecated: {
            AcceptBidMessageProcessor: 'AcceptBidMessageProcessor',
            BidMessageProcessor: 'BidMessageProcessor',
            CancelBidMessageProcessor: 'CancelBidMessageProcessor',
            ListingItemMessageProcessor: 'ListingItemMessageProcessor',
            RejectBidMessageProcessor: 'RejectBidMessageProcessor',
            TestMessageProcessor: 'TestMessageProcessor',
            UpdateListingItemMessageProcessor: 'UpdateListingItemMessageProcessor'
        },
        MessageProcessor: 'MessageProcessor',
        MessageProcessorInterface: 'MessageProcessorInterface'
    },
    Middleware:     {
        AuthenticateMiddleware: 'AuthenticateMiddleware',
        MulterMiddleware: 'MulterMiddleware',
        PopulateUserMiddleware: 'PopulateUserMiddleware',
        RestApiMiddleware: 'RestApiMiddleware',
        RpcMiddleware: 'RpcMiddleware'
    },
    Listener:     {
        ServerStartedListener: 'ServerStartedListener',
        user: {
            UserAuthenticatedListener: 'UserAuthenticatedListener',
            UserCreatedListener: 'UserCreatedListener'
        }
    },
    Controller:     {
        ItemImageController: 'ItemImageController',
        RpcController: 'RpcController'
    }
};
