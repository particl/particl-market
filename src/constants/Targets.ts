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
        CryptocurrencyAddress: 'CryptocurrencyAddress',
        Escrow: 'Escrow',
        EscrowRatio: 'EscrowRatio',
        ItemCategory: 'ItemCategory',
        ItemImage: 'ItemImage',
        ItemImageData: 'ItemImageData',
        ItemPrice: 'ItemPrice',
        LocationMarker: 'LocationMarker',
        PaymentInformation: 'PaymentInformation',
        ShippingPrice: 'ShippingPrice',
        User: 'User'
    },
    Repository:     {
        CryptocurrencyAddressRepository: 'CryptocurrencyAddressRepository',
        EscrowRatioRepository: 'EscrowRatioRepository',
        EscrowRepository: 'EscrowRepository',
        ItemCategoryRepository: 'ItemCategoryRepository',
        ItemImageDataRepository: 'ItemImageDataRepository',
        ItemImageRepository: 'ItemImageRepository',
        ItemPriceRepository: 'ItemPriceRepository',
        LocationMarkerRepository: 'LocationMarkerRepository',
        PaymentInformationRepository: 'PaymentInformationRepository',
        ShippingPriceRepository: 'ShippingPriceRepository',
        UserRepository: 'UserRepository'
    },
    Service:     {
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        EscrowRatioService: 'EscrowRatioService',
        EscrowService: 'EscrowService',
        ItemCategoryService: 'ItemCategoryService',
        ItemImageDataService: 'ItemImageDataService',
        ItemImageService: 'ItemImageService',
        ItemPriceService: 'ItemPriceService',
        LocationMarkerService: 'LocationMarkerService',
        PaymentInformationService: 'PaymentInformationService',
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
        CryptocurrencyAddressController: 'CryptocurrencyAddressController',
        EscrowController: 'EscrowController',
        EscrowRatioController: 'EscrowRatioController',
        ItemCategoryController: 'ItemCategoryController',
        ItemImageController: 'ItemImageController',
        ItemImageDataController: 'ItemImageDataController',
        ItemPriceController: 'ItemPriceController',
        LocationMarkerController: 'LocationMarkerController',
        PaymentInformationController: 'PaymentInformationController',
        RpcController: 'RpcController',
        ShippingPriceController: 'ShippingPriceController',
        UserController: 'UserController'
    }
};
