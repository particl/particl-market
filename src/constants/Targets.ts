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
        ItemPrice: 'ItemPrice',
        ShippingPrice: 'ShippingPrice',
        User: 'User'
    },
    Repository:     {
        CryptocurrencyAddressRepository: 'CryptocurrencyAddressRepository',
        EscrowRatioRepository: 'EscrowRatioRepository',
        EscrowRepository: 'EscrowRepository',
        ItemCategoryRepository: 'ItemCategoryRepository',
        ItemPriceRepository: 'ItemPriceRepository',
        ShippingPriceRepository: 'ShippingPriceRepository',
        UserRepository: 'UserRepository'
    },
    Service:     {
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        EscrowRatioService: 'EscrowRatioService',
        EscrowService: 'EscrowService',
        ItemCategoryService: 'ItemCategoryService',
        ItemPriceService: 'ItemPriceService',
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
        ItemPriceController: 'ItemPriceController',
        RpcController: 'RpcController',
        ShippingPriceController: 'ShippingPriceController',
        UserController: 'UserController'
    }
};
