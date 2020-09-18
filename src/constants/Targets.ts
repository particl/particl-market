// Copyright (c) 2017-2020, The Particl Market developers
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
        Blacklist: 'Blacklist',
        Comment: 'Comment',
        CryptocurrencyAddress: 'CryptocurrencyAddress',
        CurrencyPrice: 'CurrencyPrice',
        Escrow: 'Escrow',
        EscrowRatio: 'EscrowRatio',
        FavoriteItem: 'FavoriteItem',
        FlaggedItem: 'FlaggedItem',
        Identity: 'Identity',
        ItemCategory: 'ItemCategory',
        Image: 'Image',
        ImageData: 'ImageData',
        ItemInformation: 'ItemInformation',
        ItemLocation: 'ItemLocation',
        ItemPrice: 'ItemPrice',
        ListingItem: 'ListingItem',
        ListingItemObject: 'ListingItemObject',
        ListingItemObjectData: 'ListingItemObjectData',
        ListingItemTemplate: 'ListingItemTemplate',
        LocationMarker: 'LocationMarker',
        Market: 'Market',
        MessagingInformation: 'MessagingInformation',
        Order: 'Order',
        OrderItem: 'OrderItem',
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
        Vote: 'Vote'
    },
    Repository:     {
        AddressRepository: 'AddressRepository',
        BidDataRepository: 'BidDataRepository',
        BidRepository: 'BidRepository',
        BlacklistRepository: 'BlacklistRepository',
        CommentRepository: 'CommentRepository',
        CryptocurrencyAddressRepository: 'CryptocurrencyAddressRepository',
        CurrencyPriceRepository: 'CurrencyPriceRepository',
        EscrowRatioRepository: 'EscrowRatioRepository',
        EscrowRepository: 'EscrowRepository',
        FavoriteItemRepository: 'FavoriteItemRepository',
        FlaggedItemRepository: 'FlaggedItemRepository',
        IdentityRepository: 'IdentityRepository',
        ItemCategoryRepository: 'ItemCategoryRepository',
        ImageDataRepository: 'ImageDataRepository',
        ImageRepository: 'ImageRepository',
        ItemInformationRepository: 'ItemInformationRepository',
        ItemLocationRepository: 'ItemLocationRepository',
        ItemPriceRepository: 'ItemPriceRepository',
        ListingItemObjectDataRepository: 'ListingItemObjectDataRepository',
        ListingItemObjectRepository: 'ListingItemObjectRepository',
        ListingItemRepository: 'ListingItemRepository',
        ListingItemTemplateRepository: 'ListingItemTemplateRepository',
        LocationMarkerRepository: 'LocationMarkerRepository',
        MarketRepository: 'MarketRepository',
        MessagingInformationRepository: 'MessagingInformationRepository',
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
        VoteRepository: 'VoteRepository'
    },
    Service:     {
        action: {
            ActionServiceInterface: 'ActionServiceInterface',
            BidAcceptActionService: 'BidAcceptActionService',
            BidActionService: 'BidActionService',
            BidCancelActionService: 'BidCancelActionService',
            BidRejectActionService: 'BidRejectActionService',
            CommentAddActionService: 'CommentAddActionService',
            EscrowCompleteActionService: 'EscrowCompleteActionService',
            EscrowLockActionService: 'EscrowLockActionService',
            EscrowRefundActionService: 'EscrowRefundActionService',
            EscrowReleaseActionService: 'EscrowReleaseActionService',
            ListingItemAddActionService: 'ListingItemAddActionService',
            ListingItemImageAddActionService: 'ListingItemImageAddActionService',
            MarketAddActionService: 'MarketAddActionService',
            MarketImageAddActionService: 'MarketImageAddActionService',
            OrderItemShipActionService: 'OrderItemShipActionService',
            ProposalAddActionService: 'ProposalAddActionService',
            VoteActionService: 'VoteActionService'
        },
        BaseActionService: 'BaseActionService',
        BaseBidActionService: 'BaseBidActionService',
        CoreRpcService: 'CoreRpcService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
        DefaultMarketService: 'DefaultMarketService',
        DefaultProfileService: 'DefaultProfileService',
        DefaultSettingService: 'DefaultSettingService',
        ImageHttpUploadService: 'ImageHttpUploadService',
        model: {
            AddressService: 'AddressService',
            BidDataService: 'BidDataService',
            BidService: 'BidService',
            BlacklistService: 'BlacklistService',
            CommentService: 'CommentService',
            CryptocurrencyAddressService: 'CryptocurrencyAddressService',
            CurrencyPriceService: 'CurrencyPriceService',
            EscrowRatioService: 'EscrowRatioService',
            EscrowService: 'EscrowService',
            FavoriteItemService: 'FavoriteItemService',
            FlaggedItemService: 'FlaggedItemService',
            IdentityService: 'IdentityService',
            ItemCategoryService: 'ItemCategoryService',
            ImageDataService: 'ImageDataService',
            ImageService: 'ImageService',
            ItemInformationService: 'ItemInformationService',
            ItemLocationService: 'ItemLocationService',
            ItemPriceService: 'ItemPriceService',
            ListingItemObjectDataService: 'ListingItemObjectDataService',
            ListingItemObjectService: 'ListingItemObjectService',
            ListingItemService: 'ListingItemService',
            ListingItemTemplateService: 'ListingItemTemplateService',
            LocationMarkerService: 'LocationMarkerService',
            MarketService: 'MarketService',
            MessagingInformationService: 'MessagingInformationService',
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
            VoteService: 'VoteService'
        },
        observer: {
            BaseObserverService: 'BaseObserverService',
            CoreCookieService: 'CoreCookieService',
            CoreConnectionStatusService: 'CoreConnectionStatusService',
            ExpiredListingItemService: 'ExpiredListingItemService',
            ExpiredProposalService: 'ExpiredProposalService',
            ProposalResultRecalcService: 'ProposalResultRecalcService',
            WaitingMessageService: 'WaitingMessageService'
        },
        OmpService: 'OmpService',
        SmsgService: 'SmsgService',
        NotificationService: 'NotificationService',
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
        BaseSearchCommand: 'BaseSearchCommand',
        bid: {
            BidAcceptCommand: 'BidAcceptCommand',
            BidCancelCommand: 'BidCancelCommand',
            BidRejectCommand: 'BidRejectCommand',
            BidRootCommand: 'BidRootCommand',
            BidSearchCommand: 'BidSearchCommand',
            BidGetCommand: 'BidGetCommand',
            BidSendCommand: 'BidSendCommand'
        },
        blacklist: {
            BlacklistListCommand: 'BlacklistListCommand',
            BlacklistRootCommand: 'BlacklistRootCommand'
        },
        Command: 'Command',
        CommandEnumType: 'CommandEnumType',
        comment: {
            CommentCountCommand: 'CommentCountCommand',
            CommentGetCommand: 'CommentGetCommand',
            CommentPostCommand: 'CommentPostCommand',
            CommentRootCommand: 'CommentRootCommand',
            CommentSearchCommand: 'CommentSearchCommand'
        },
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
            EscrowCompleteCommand: 'EscrowCompleteCommand',
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
        identity: {
            IdentityAddCommand: 'IdentityAddCommand',
            IdentityListCommand: 'IdentityListCommand',
            IdentityRootCommand: 'IdentityRootCommand'
        },
        itemcategory: {
            ItemCategoryAddCommand: 'ItemCategoryAddCommand',
            ItemCategoryGetCommand: 'ItemCategoryGetCommand',
            ItemCategoryListCommand: 'ItemCategoryListCommand',
            ItemCategoryRemoveCommand: 'ItemCategoryRemoveCommand',
            ItemCategoryRootCommand: 'ItemCategoryRootCommand',
            ItemCategorySearchCommand: 'ItemCategorySearchCommand',
            ItemCategoryUpdateCommand: 'ItemCategoryUpdateCommand'
        },
        image: {
            ImageAddCommand: 'ImageAddCommand',
            ImageCompressCommand: 'ImageCompressCommand',
            ImageListCommand: 'ImageListCommand',
            ImageRemoveCommand: 'ImageRemoveCommand',
            ImageRootCommand: 'ImageRootCommand'
        },
        iteminformation: {
            ItemInformationGetCommand: 'ItemInformationGetCommand',
            ItemInformationRootCommand: 'ItemInformationRootCommand',
            ItemInformationUpdateCommand: 'ItemInformationUpdateCommand'
        },
        itemlocation: {
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
            ListingItemTemplateCloneCommand: 'ListingItemTemplateCloneCommand',
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
            MarketFlagCommand: 'MarketFlagCommand',
            MarketGetCommand: 'MarketGetCommand',
            MarketListCommand: 'MarketListCommand',
            MarketRemoveCommand: 'MarketRemoveCommand',
            MarketJoinCommand: 'MarketJoinCommand',
            MarketPostCommand: 'MarketPostCommand',
            MarketSearchCommand: 'MarketSearchCommand',
            MarketRootCommand: 'MarketRootCommand',
            MarketDefaultCommand: 'MarketDefaultCommand'
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
            OrderItemHistoryCommand: 'OrderItemHistoryCommand',
            OrderItemRootCommand: 'OrderItemRootCommand',
            OrderItemShipCommand: 'OrderItemShipCommand',
            OrderItemStatusCommand: 'OrderItemStatusCommand',
            OrderItemSearchCommand: 'OrderItemSearchCommand'
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
            ProfileDefaultCommand: 'ProfileDefaultCommand',
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
            SmsgRemoveCommand: 'SmsgRemoveCommand',
            SmsgResendCommand: 'SmsgResendCommand',
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
        hashableconfig: {
            HashableField: 'HashableField',
            createrequest: {
                HashableBidBasicCreateRequestConfig: 'HashableBidBasicCreateRequestConfig',
                HashableBidCreateRequestConfig: 'HashableBidCreateRequestConfig',
                HashableCommentCreateRequestConfig: 'HashableCommentCreateRequestConfig',
                HashableItemCategoryCreateRequestConfig: 'HashableItemCategoryCreateRequestConfig',
                HashableImageCreateRequestConfig: 'HashableImageCreateRequestConfig',
                HashableListingItemTemplateCreateRequestConfig: 'HashableListingItemTemplateCreateRequestConfig',
                HashableMarketCreateRequestConfig: 'HashableMarketCreateRequestConfig',
                HashableOrderCreateRequestConfig: 'HashableOrderCreateRequestConfig',
                HashableProposalCreateRequestConfig: 'HashableProposalCreateRequestConfig'
            },
            message: {
                HashableBidMessageConfig: 'HashableBidMessageConfig',
                HashableCommentAddMessageConfig: 'HashableCommentAddMessageConfig',
                HashableMarketAddMessageConfig: 'HashableMarketAddMessageConfig',
                HashableProposalAddMessageConfig: 'HashableProposalAddMessageConfig',
                HashableProposalOptionMessageConfig: 'HashableProposalOptionMessageConfig'
            },
            model: {
                HashableListingItemTemplateConfig: 'HashableListingItemTemplateConfig'
            }
        },
        MessageFactoryInterface: 'MessageFactoryInterface',
        ModelCreateParams: 'ModelCreateParams',
        ModelFactoryInterface: 'ModelFactoryInterface',
        RpcCommandFactory: 'RpcCommandFactory',
        message: {
            BaseMessageFactory: 'BaseMessageFactory',
            BidMessageFactory: 'BidMessageFactory',
            BidAcceptMessageFactory: 'BidAcceptMessageFactory',
            BidCancelMessageFactory: 'BidCancelMessageFactory',
            BidRejectMessageFactory: 'BidRejectMessageFactory',
            CommentAddMessageFactory: 'CommentAddMessageFactory',
            EscrowCompleteMessageFactory: 'EscrowCompleteMessageFactory',
            EscrowLockMessageFactory: 'EscrowLockMessageFactory',
            EscrowRefundMessageFactory: 'EscrowRefundMessageFactory',
            EscrowReleaseMessageFactory: 'EscrowReleaseMessageFactory',
            ListingItemAddMessageFactory: 'ListingItemAddMessageFactory',
            ListingItemImageAddMessageFactory: 'ListingItemImageAddMessageFactory',
            MarketAddMessageFactory: 'MarketAddMessageFactory',
            MarketImageAddMessageFactory: 'MarketImageAddMessageFactory',
            OrderItemShipMessageFactory: 'OrderItemShipMessageFactory',
            ProposalAddMessageFactory: 'ProposalAddMessageFactory',
            VoteMessageFactory: 'VoteMessageFactory'
        },
        model: {
            BidFactory: 'BidFactory',
            CommentFactory: 'CommentFactory',
            ImageFactory: 'ImageFactory',
            ImageDataFactory: 'ImageDataFactory',
            ItemCategoryFactory: 'ItemCategoryFactory',
            ItemInformationFactory: 'ItemInformationFactory',
            ListingItemFactory: 'ListingItemFactory',
            ListingItemTemplateFactory: 'ListingItemTemplateFactory',
            MarketFactory: 'MarketFactory',
            OrderFactory: 'OrderFactory',
            OrderItemFactory: 'OrderItemFactory',
            PaymentInformationFactory: 'PaymentInformationFactory',
            ProposalFactory: 'ProposalFactory',
            SmsgMessageFactory: 'SmsgMessageFactory',
            VoteFactory: 'VoteFactory'
        }
    },
    MessageValidator:     {
        BidAcceptValidator: 'BidAcceptValidator',
        BidCancelValidator: 'BidCancelValidator',
        BidRejectValidator: 'BidRejectValidator',
        BidValidator: 'BidValidator',
        CommentAddValidator: 'CommentAddValidator',
        EscrowCompleteValidator: 'EscrowCompleteValidator',
        EscrowLockValidator: 'EscrowLockValidator',
        EscrowRefundValidator: 'EscrowRefundValidator',
        EscrowReleaseValidator: 'EscrowReleaseValidator',
        ListingItemAddValidator: 'ListingItemAddValidator',
        ListingItemImageAddValidator: 'ListingItemImageAddValidator',
        MarketAddValidator: 'MarketAddValidator',
        MarketImageAddValidator: 'MarketImageAddValidator',
        OrderItemShipValidator: 'OrderItemShipValidator',
        ProposalAddValidator: 'ProposalAddValidator',
        VoteValidator: 'VoteValidator'
    },
    MessageProcessor:     {
        action: {
            BidAcceptActionMessageProcessor: 'BidAcceptActionMessageProcessor',
            BidActionMessageProcessor: 'BidActionMessageProcessor',
            BidCancelActionMessageProcessor: 'BidCancelActionMessageProcessor',
            BidRejectActionMessageProcessor: 'BidRejectActionMessageProcessor',
            CommentAddActionMessageProcessor: 'CommentAddActionMessageProcessor',
            EscrowCompleteActionMessageProcessor: 'EscrowCompleteActionMessageProcessor',
            EscrowLockActionMessageProcessor: 'EscrowLockActionMessageProcessor',
            EscrowRefundActionMessageProcessor: 'EscrowRefundActionMessageProcessor',
            EscrowReleaseActionMessageProcessor: 'EscrowReleaseActionMessageProcessor',
            ListingItemAddActionMessageProcessor: 'ListingItemAddActionMessageProcessor',
            ListingItemImageAddActionMessageProcessor: 'ListingItemImageAddActionMessageProcessor',
            MarketAddActionMessageProcessor: 'MarketAddActionMessageProcessor',
            MarketImageAddActionMessageProcessor: 'MarketImageAddActionMessageProcessor',
            OrderItemShipActionMessageProcessor: 'OrderItemShipActionMessageProcessor',
            ProposalAddActionMessageProcessor: 'ProposalAddActionMessageProcessor',
            VoteActionMessageProcessor: 'VoteActionMessageProcessor'
        },
        ActionMessageProcessorInterface: 'ActionMessageProcessorInterface',
        BaseActionMessageProcessor: 'BaseActionMessageProcessor',
        BaseBidActionMessageProcessor: 'BaseBidActionMessageProcessor',
        CoreMessageProcessor: 'CoreMessageProcessor',
        MarketplaceMessageProcessor: 'MarketplaceMessageProcessor',
        MessageProcessorInterface: 'MessageProcessorInterface'
    },
    Middleware:     {
        AuthenticateMiddleware: 'AuthenticateMiddleware',
        MulterMiddleware: 'MulterMiddleware',
        RestApiMiddleware: 'RestApiMiddleware',
        RpcMiddleware: 'RpcMiddleware'
    },
    Listener:     {
        ServerStartedListener: 'ServerStartedListener'
    },
    Controller:     {
        ImageController: 'ImageController',
        RpcController: 'RpcController'
    }
};
