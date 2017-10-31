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
        ItemCategory: 'ItemCategory',
        User: 'User'
    },
    Repository:     {
        ItemCategoryRepository: 'ItemCategoryRepository',
        UserRepository: 'UserRepository'
    },
    Service:     {
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
        ItemCategoryController: 'ItemCategoryController',
        RpcController: 'RpcController',
        UserController: 'UserController'
    }
};
