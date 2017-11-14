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
        CryptocurrencyAddress: 'CryptocurrencyAddress',
        Escrow: 'Escrow',
        EscrowRatio: 'EscrowRatio',
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
        CryptocurrencyAddressRepository: 'CryptocurrencyAddressRepository',
        EscrowRatioRepository: 'EscrowRatioRepository',
        EscrowRepository: 'EscrowRepository',
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
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
        DefaultProfileService: 'DefaultProfileService',
        EscrowRatioService: 'EscrowRatioService',
        EscrowService: 'EscrowService',
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
        MessagingInformationService: 'MessagingInformationService',
        PaymentInformationService: 'PaymentInformationService',
        ProfileService: 'ProfileService',
        RpcAddressService: 'RpcAddressService',
        RpcListingItemService: 'RpcListingItemService',
        RpcProfileService: 'RpcProfileService',
        ShippingDestinationService: 'ShippingDestinationService',
        ShippingPriceService: 'ShippingPriceService',
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
        CryptocurrencyAddressController: 'CryptocurrencyAddressController',
        EscrowController: 'EscrowController',
        EscrowRatioController: 'EscrowRatioController',
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
