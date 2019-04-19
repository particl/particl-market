// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
        ListingItemObjectData: 'ListingItemObjectData',
        ListingItemTemplate: 'ListingItemTemplate',
        LocationMarker: 'LocationMarker',
        LockedOutput: 'LockedOutput',
        Market: 'Market',
        MessagingInformation: 'MessagingInformation',
        Order: 'Order',
        OrderItem: 'OrderItem',
        OrderItemObject: 'OrderItemObject',
        PaymentInformation: 'PaymentInformation',
        PriceTicker: 'PriceTicker',
        Profile: 'Profile',
        Proposal: 'Proposal',
        ProposalOption: 'ProposalOption',
        ProposalOptionResult: 'ProposalOptionResult',
        ProposalResult: 'ProposalResult',
        Setting: 'Setting',
        ShippingDestination: 'ShippingDestination',
        ShippingPrice: 'ShippingPrice',
        ShoppingCart: 'ShoppingCart',
        ShoppingCartItem: 'ShoppingCartItem',
        SmsgMessage: 'SmsgMessage',
        User: 'User',
        Vote: 'Vote'
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
        ListingItemObjectDataRepository: 'ListingItemObjectDataRepository',
        ListingItemObjectRepository: 'ListingItemObjectRepository',
        ListingItemRepository: 'ListingItemRepository',
        ListingItemTemplateRepository: 'ListingItemTemplateRepository',
        LocationMarkerRepository: 'LocationMarkerRepository',
        LockedOutputRepository: 'LockedOutputRepository',
        MarketRepository: 'MarketRepository',
        MessagingInformationRepository: 'MessagingInformationRepository',
        OrderItemObjectRepository: 'OrderItemObjectRepository',
        OrderItemRepository: 'OrderItemRepository',
        OrderRepository: 'OrderRepository',
        PaymentInformationRepository: 'PaymentInformationRepository',
        PriceTickerRepository: 'PriceTickerRepository',
        ProfileRepository: 'ProfileRepository',
        ProposalOptionRepository: 'ProposalOptionRepository',
        ProposalOptionResultRepository: 'ProposalOptionResultRepository',
        ProposalRepository: 'ProposalRepository',
        ProposalResultRepository: 'ProposalResultRepository',
        SettingRepository: 'SettingRepository',
        ShippingDestinationRepository: 'ShippingDestinationRepository',
        ShippingPriceRepository: 'ShippingPriceRepository',
        ShoppingCartItemRepository: 'ShoppingCartItemRepository',
        ShoppingCartRepository: 'ShoppingCartRepository',
        SmsgMessageRepository: 'SmsgMessageRepository',
        UserRepository: 'UserRepository',
        VoteRepository: 'VoteRepository'
    },
    Service:     {
        action: {
            BaseActionService: 'BaseActionService',
            BidActionService: 'BidActionService',
            BidAcceptActionService: 'BidAcceptActionService',
            BidCancelActionService: 'BidCancelActionService',
            BidRejectActionService: 'BidRejectActionService',
            EscrowLockActionService: 'EscrowLockActionService',
            EscrowReleaseActionService: 'EscrowReleaseActionService',
            EscrowRefundActionService: 'EscrowRefundActionService',
            ListingItemAddActionService: 'ListingItemAddActionService',
            ProposalActionService: 'ProposalActionService',
            VoteActionService: 'VoteActionService'
        },
        model: {
            AddressService: 'AddressService',
            BidDataService: 'BidDataService',
            BidService: 'BidService',
            CryptocurrencyAddressService: 'CryptocurrencyAddressService',
            CurrencyPriceService: 'CurrencyPriceService',
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
            ListingItemObjectDataService: 'ListingItemObjectDataService',
            ListingItemObjectService: 'ListingItemObjectService',
            ListingItemService: 'ListingItemService',
            ListingItemTemplateService: 'ListingItemTemplateService',
            LocationMarkerService: 'LocationMarkerService',
            LockedOutputService: 'LockedOutputService',
            MarketService: 'MarketService',
            MessagingInformationService: 'MessagingInformationService',
            OrderItemObjectService: 'OrderItemObjectService',
            OrderItemService: 'OrderItemService',
            OrderService: 'OrderService',
            PaymentInformationService: 'PaymentInformationService',
            PriceTickerService: 'PriceTickerService',
            ProfileService: 'ProfileService',
            ProposalOptionResultService: 'ProposalOptionResultService',
            ProposalOptionService: 'ProposalOptionService',
            ProposalResultService: 'ProposalResultService',
            ProposalService: 'ProposalService',
            SettingService: 'SettingService',
            ShippingDestinationService: 'ShippingDestinationService',
            ShippingPriceService: 'ShippingPriceService',
            ShoppingCartItemService: 'ShoppingCartItemService',
            ShoppingCartService: 'ShoppingCartService',
            SmsgMessageService: 'SmsgMessageService',
            UserService: 'UserService',
            VoteService: 'VoteService'
        },
        CoreCookieService: 'CoreCookieService',
        CoreRpcService: 'CoreRpcService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
        DefaultMarketService: 'DefaultMarketService',
        DefaultProfileService: 'DefaultProfileService',
        ItemImageHttpUploadService: 'ItemImageHttpUploadService',
        OmpService: 'OmpService',
        SmsgService: 'SmsgService',
        TestDataService: 'TestDataService'
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
            ListingItemSearchCommand: 'ListingItemSearchCommand'
        },
        listingitemobject: {
            ListingItemObjectRootCommand: 'ListingItemObjectRootCommand',
            ListingItemObjectSearchCommand: 'ListingItemObjectSearchCommand'
        },
        listingitemtemplate: {
            ListingItemTemplateAddCommand: 'ListingItemTemplateAddCommand',
            ListingItemTemplateCompressCommand: 'ListingItemTemplateCompressCommand',
            ListingItemTemplateFeatureImageCommand: 'ListingItemTemplateFeatureImageCommand',
            ListingItemTemplateGetCommand: 'ListingItemTemplateGetCommand',
            ListingItemTemplatePostCommand: 'ListingItemTemplatePostCommand',
            ListingItemTemplateRemoveCommand: 'ListingItemTemplateRemoveCommand',
            ListingItemTemplateRootCommand: 'ListingItemTemplateRootCommand',
            ListingItemTemplateSearchCommand: 'ListingItemTemplateSearchCommand',
            ListingItemTemplateSizeCommand: 'ListingItemTemplateSizeCommand'
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
        order: {
            OrderRootCommand: 'OrderRootCommand',
            OrderSearchCommand: 'OrderSearchCommand'
        },
        orderitem: {
            OrderItemRootCommand: 'OrderItemRootCommand',
            OrderItemStatusCommand: 'OrderItemStatusCommand'
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
        proposal: {
            ProposalGetCommand: 'ProposalGetCommand',
            ProposalListCommand: 'ProposalListCommand',
            ProposalPostCommand: 'ProposalPostCommand',
            ProposalResultCommand: 'ProposalResultCommand',
            ProposalRootCommand: 'ProposalRootCommand'
        },
        RpcCommandInterface: 'RpcCommandInterface',
        setting: {
            SettingGetCommand: 'SettingGetCommand',
            SettingListCommand: 'SettingListCommand',
            SettingRemoveCommand: 'SettingRemoveCommand',
            SettingRootCommand: 'SettingRootCommand',
            SettingSetCommand: 'SettingSetCommand'
        },
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
        smsg: {
            SmsgRootCommand: 'SmsgRootCommand',
            SmsgSearchCommand: 'SmsgSearchCommand'
        },
        vote: {
            VoteGetCommand: 'VoteGetCommand',
            VoteListCommand: 'VoteListCommand',
            VotePostCommand: 'VotePostCommand',
            VoteRootCommand: 'VoteRootCommand'
        }
    },
    Factory:     {
        ImageFactory: 'ImageFactory',
        ItemCategoryFactory: 'ItemCategoryFactory',
        message: {
            BidCancelMessageFactory: 'BidCancelMessageFactory',
            BidRejectMessageFactory: 'BidRejectMessageFactory',
            EscrowRefundMessageFactory: 'EscrowRefundMessageFactory',
            EscrowReleaseMessageFactory: 'EscrowReleaseMessageFactory',
            ListingItemAddMessageFactory: 'ListingItemAddMessageFactory',
            ProposalAddMessageFactory: 'ProposalAddMessageFactory',
            VoteMessageFactory: 'VoteMessageFactory'
        },
        MessagingInformationFactory: 'MessagingInformationFactory',
        model: {
            BidFactory: 'BidFactory',
            ListingItemFactory: 'ListingItemFactory',
            ModelCreateParams: 'ModelCreateParams',
            ModelFactoryInterface: 'ModelFactoryInterface',
            OrderFactory: 'OrderFactory',
            ProposalFactory: 'ProposalFactory',
            SmsgMessageFactory: 'SmsgMessageFactory',
            VoteFactory: 'VoteFactory'
        },
        RpcCommandFactory: 'RpcCommandFactory'
    },
    MessageProcessor:     {
        CoreMessageProcessor: 'CoreMessageProcessor',
        ExpiredListingItemProcessor: 'ExpiredListingItemProcessor',
        MessageProcessor: 'MessageProcessor',
        MessageProcessorInterface: 'MessageProcessorInterface',
        ProposalResultProcessor: 'ProposalResultProcessor'
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
