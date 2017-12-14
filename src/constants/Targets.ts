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
        Escrow: 'Escrow',
        EscrowRatio: 'EscrowRatio',
        FavoriteItem: 'FavoriteItem',
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
        Profile: 'Profile',
        ShippingDestination: 'ShippingDestination',
        ShippingPrice: 'ShippingPrice',
        User: 'User'
    },
    Repository:     {
        AddressRepository: 'AddressRepository',
        BidDataRepository: 'BidDataRepository',
        BidRepository: 'BidRepository',
        CryptocurrencyAddressRepository: 'CryptocurrencyAddressRepository',
        EscrowRatioRepository: 'EscrowRatioRepository',
        EscrowRepository: 'EscrowRepository',
        FavoriteItemRepository: 'FavoriteItemRepository',
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
        ProfileRepository: 'ProfileRepository',
        ShippingDestinationRepository: 'ShippingDestinationRepository',
        ShippingPriceRepository: 'ShippingPriceRepository',
        UserRepository: 'UserRepository'
    },
    Service:     {
        AddressService: 'AddressService',
        BidDataService: 'BidDataService',
        BidService: 'BidService',
        CoreRpcService: 'CoreRpcService',
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
        DefaultMarketService: 'DefaultMarketService',
        DefaultProfileService: 'DefaultProfileService',
        EscrowRatioService: 'EscrowRatioService',
        EscrowService: 'EscrowService',
        FavoriteItemService: 'FavoriteItemService',
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
        MessageBroadcastService: 'MessageBroadcastService',
        MessagingInformationService: 'MessagingInformationService',
        PaymentInformationService: 'PaymentInformationService',
        ProfileService: 'ProfileService',
        ShippingDestinationService: 'ShippingDestinationService',
        ShippingPriceService: 'ShippingPriceService',
        TestDataService: 'TestDataService',
        UserService: 'UserService'
    },
    Command:     {
        AddDataCommand: 'AddDataCommand',
        bid: {
            BidSearchCommand: 'BidSearchCommand'
        },
        CleanDbCommand: 'CleanDbCommand',
        escrow: {
            EscrowCreateCommand: 'EscrowCreateCommand',
            EscrowDestroyCommand: 'EscrowDestroyCommand',
            EscrowUpdateCommand: 'EscrowUpdateCommand'
        },
        favorite: {
            FavoriteAddCommand: 'FavoriteAddCommand',
            FavoriteRemoveCommand: 'FavoriteRemoveCommand'
        },
        GenerateDataCommand: 'GenerateDataCommand',
        HelpCommand: 'HelpCommand',
        itemcategory: {
            ItemCategoriesGetCommand: 'ItemCategoriesGetCommand',
            ItemCategoryCreateCommand: 'ItemCategoryCreateCommand',
            ItemCategoryFindCommand: 'ItemCategoryFindCommand',
            ItemCategoryGetCommand: 'ItemCategoryGetCommand',
            ItemCategoryRemoveCommand: 'ItemCategoryRemoveCommand',
            ItemCategoryUpdateCommand: 'ItemCategoryUpdateCommand'
        },
        itemimage: {
            ItemImageAddCommand: 'ItemImageAddCommand',
            ItemImageRemoveCommand: 'ItemImageRemoveCommand'
        },
        iteminformation: {
            ItemInformationCreateCommand: 'ItemInformationCreateCommand',
            ItemInformationGetCommand: 'ItemInformationGetCommand',
            ItemInformationUpdateCommand: 'ItemInformationUpdateCommand'
        },
        itemlocation: {
            ItemLocationCreateCommand: 'ItemLocationCreateCommand',
            ItemLocationRemoveCommand: 'ItemLocationRemoveCommand',
            ItemLocationUpdateCommand: 'ItemLocationUpdateCommand'
        },
        listingitem: {
            ListingItemGetCommand: 'ListingItemGetCommand',
            ListingItemSearchCommand: 'ListingItemSearchCommand',
            OwnListingItemSearchCommand: 'OwnListingItemSearchCommand'
        },
        listingitemtemplate: {
            ListingItemTemplateCreateCommand: 'ListingItemTemplateCreateCommand',
            ListingItemTemplateDestroyCommand: 'ListingItemTemplateDestroyCommand',
            ListingItemTemplateGetCommand: 'ListingItemTemplateGetCommand',
            ListingItemTemplateSearchCommand: 'ListingItemTemplateSearchCommand'
        },
        market: {
            MarketCreateCommand: 'MarketCreateCommand'
        },
        messaginginformation: {
            MessagingInformationUpdateCommand: 'MessagingInformationUpdateCommand'
        },
        paymentinformation: {
            PaymentInformationUpdateCommand: 'PaymentInformationUpdateCommand'
        },
        profile: {
            AddressCreateCommand: 'AddressCreateCommand',
            AddressDestroyCommand: 'AddressDestroyCommand',
            AddressUpdateCommand: 'AddressUpdateCommand',
            ProfileCreateCommand: 'ProfileCreateCommand',
            ProfileDestroyCommand: 'ProfileDestroyCommand',
            ProfileGetCommand: 'ProfileGetCommand',
            ProfileUpdateCommand: 'ProfileUpdateCommand'
        },
        RpcCommandInterface: 'RpcCommandInterface',
        shippingdestination: {
            ShippingDestinationAddCommand: 'ShippingDestinationAddCommand',
            ShippingDestinationRemoveCommand: 'ShippingDestinationRemoveCommand'
        },
        TestCommand: 'TestCommand'
    },
    Factory:     {
        RpcCommandFactory: 'RpcCommandFactory',
        TestFactory: 'TestFactory'
    },
    MessageProcessor:     {
        MessageProcessor: 'MessageProcessor',
        MessageProcessorInterface: 'MessageProcessorInterface',
        TestMessageProcessor: 'TestMessageProcessor'
    },
    Middleware:     {
        AuthenticateMiddleware: 'AuthenticateMiddleware',
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
        AddressController: 'AddressController',
        BidController: 'BidController',
        BidDataController: 'BidDataController',
        CryptocurrencyAddressController: 'CryptocurrencyAddressController',
        EscrowController: 'EscrowController',
        EscrowRatioController: 'EscrowRatioController',
        FavoriteItemController: 'FavoriteItemController',
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
        ProfileController: 'ProfileController',
        RpcController: 'RpcController',
        ShippingDestinationController: 'ShippingDestinationController',
        ShippingPriceController: 'ShippingPriceController',
        UserController: 'UserController'
    }
};
