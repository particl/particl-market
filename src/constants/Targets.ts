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
        MessagingInformation: 'MessagingInformation',
        PaymentInformation: 'PaymentInformation',
        Profile: 'Profile',
        ShippingDestination: 'ShippingDestination',
        ShippingPrice: 'ShippingPrice',
        User: 'User'
    },
    Repository:     {
        AddressRepository: 'AddressRepository',
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
        MessagingInformationRepository: 'MessagingInformationRepository',
        PaymentInformationRepository: 'PaymentInformationRepository',
        ProfileRepository: 'ProfileRepository',
        ShippingDestinationRepository: 'ShippingDestinationRepository',
        ShippingPriceRepository: 'ShippingPriceRepository',
        UserRepository: 'UserRepository'
    },
    Service:     {
        AddressService: 'AddressService',
        BidService: 'BidService',
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
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
        MessageBroadcastServiceService: 'MessageBroadcastServiceService',
        MessagingInformationService: 'MessagingInformationService',
        PaymentInformationService: 'PaymentInformationService',
        ProfileService: 'ProfileService',
        rpc: {
            RpcAddressService: 'RpcAddressService',
            RpcCliHelpService: 'RpcCliHelpService',
            RpcEscrowService: 'RpcEscrowService',
            RpcFavoriteItemService: 'RpcFavoriteItemService',
            RpcItemCategoryService: 'RpcItemCategoryService',
            RpcItemImageService: 'RpcItemImageService',
            RpcItemInformationService: 'RpcItemInformationService',
            RpcItemLocationService: 'RpcItemLocationService',
            RpcListingItemService: 'RpcListingItemService',
            RpcListingItemTemplateService: 'RpcListingItemTemplateService',
            RpcPaymentInformationService: 'RpcPaymentInformationService',
            RpcProfileService: 'RpcProfileService',
            RpcShippingDestinationService: 'RpcShippingDestinationService',
            RpcTestDataService: 'RpcTestDataService'
        },
        ShippingDestinationService: 'ShippingDestinationService',
        ShippingPriceService: 'ShippingPriceService',
        TestDataService: 'TestDataService',
        UserService: 'UserService'
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
        MessagingInformationController: 'MessagingInformationController',
        PaymentInformationController: 'PaymentInformationController',
        ProfileController: 'ProfileController',
        RpcController: 'RpcController',
        ShippingDestinationController: 'ShippingDestinationController',
        ShippingPriceController: 'ShippingPriceController',
        UserController: 'UserController'
    }
};
