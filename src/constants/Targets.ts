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
        EscrowRatio: 'EscrowRatio',
        ItemCategory: 'ItemCategory',
        User: 'User'
    },
    Repository:     {
        CryptocurrencyAddressRepository: 'CryptocurrencyAddressRepository',
        EscrowRatioRepository: 'EscrowRatioRepository',
        ItemCategoryRepository: 'ItemCategoryRepository',
        UserRepository: 'UserRepository'
    },
    Service:     {
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        EscrowRatioService: 'EscrowRatioService',
        ItemCategoryService: 'ItemCategoryService',
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
        EscrowRatioController: 'EscrowRatioController',
        ItemCategoryController: 'ItemCategoryController',
        RpcController: 'RpcController',
        UserController: 'UserController'
    }
};
