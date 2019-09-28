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
        Vote: 'Vote',
        Wallet: 'Wallet'
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
        VoteRepository: 'VoteRepository',
        WalletRepository: 'WalletRepository'
    },
    Service:     {
        action: {
            ActionServiceInterface: 'ActionServiceInterface',
            BaseActionService: 'BaseActionService',
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
            OrderItemShipActionService: 'OrderItemShipActionService',
            ProposalAddActionService: 'ProposalAddActionService',
            VoteActionService: 'VoteActionService'
        },
        CoreCookieService: 'CoreCookieService',
        CoreRpcService: 'CoreRpcService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
        DefaultMarketService: 'DefaultMarketService',
        DefaultProfileService: 'DefaultProfileService',
        DefaultSettingService: 'DefaultSettingService',
        ItemImageHttpUploadService: 'ItemImageHttpUploadService',
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
            VoteService: 'VoteService',
            WalletService: 'WalletService'
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
            MarketListCommand: 'MarketListCommand',
            MarketRemoveCommand: 'MarketRemoveCommand',
            MarketRootCommand: 'MarketRootCommand',
            MarketSetDefaultCommand: 'MarketSetDefaultCommand'
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
        },
        wallet: {
            WalletListCommand: 'WalletListCommand',
            WalletRootCommand: 'WalletRootCommand'
        }
    },
    Factory:     {
        hashableconfig: {
            createrequest: {
                HashableBidBasicCreateRequestConfig: 'HashableBidBasicCreateRequestConfig',
                HashableBidCreateRequestConfig: 'HashableBidCreateRequestConfig',
                HashableCommentCreateRequestConfig: 'HashableCommentCreateRequestConfig',
                HashableItemCategoryCreateRequestConfig: 'HashableItemCategoryCreateRequestConfig',
                HashableItemImageCreateRequestConfig: 'HashableItemImageCreateRequestConfig',
                HashableListingItemTemplateCreateRequestConfig: 'HashableListingItemTemplateCreateRequestConfig',
                HashableOrderCreateRequestConfig: 'HashableOrderCreateRequestConfig',
                HashableProposalCreateRequestConfig: 'HashableProposalCreateRequestConfig'
            },
            HashableField: 'HashableField',
            message: {
                HashableBidMessageConfig: 'HashableBidMessageConfig',
                HashableCommentAddMessageConfig: 'HashableCommentAddMessageConfig',
                HashableProposalAddMessageConfig: 'HashableProposalAddMessageConfig',
                HashableProposalOptionMessageConfig: 'HashableProposalOptionMessageConfig'
            },
            model: {
                HashableListingItemTemplateConfig: 'HashableListingItemTemplateConfig'
            }
        },
        ImageFactory: 'ImageFactory',
        ItemCategoryFactory: 'ItemCategoryFactory',
        message: {
            BidCancelMessageFactory: 'BidCancelMessageFactory',
            BidRejectMessageFactory: 'BidRejectMessageFactory',
            CommentAddMessageFactory: 'CommentAddMessageFactory',
            EscrowCompleteMessageFactory: 'EscrowCompleteMessageFactory',
            EscrowRefundMessageFactory: 'EscrowRefundMessageFactory',
            EscrowReleaseMessageFactory: 'EscrowReleaseMessageFactory',
            ListingItemAddMessageFactory: 'ListingItemAddMessageFactory',
            MessageFactoryInterface: 'MessageFactoryInterface',
            OrderItemShipMessageFactory: 'OrderItemShipMessageFactory',
            ProposalAddMessageFactory: 'ProposalAddMessageFactory',
            VoteMessageFactory: 'VoteMessageFactory'
        },
        MessagingInformationFactory: 'MessagingInformationFactory',
        model: {
            BidFactory: 'BidFactory',
            CommentFactory: 'CommentFactory',
            ListingItemFactory: 'ListingItemFactory',
            ListingItemTemplateFactory: 'ListingItemTemplateFactory',
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
        MessageProcessorInterface: 'MessageProcessorInterface',
        ProposalResultProcessor: 'ProposalResultProcessor',
        WaitingMessageProcessor: 'WaitingMessageProcessor'
    },
    Middleware:     {
        AuthenticateMiddleware: 'AuthenticateMiddleware',
        MulterMiddleware: 'MulterMiddleware',
        RestApiMiddleware: 'RestApiMiddleware',
        RpcMiddleware: 'RpcMiddleware'
    },
    Listener:     {
        action: {
            BidAcceptActionListener: 'BidAcceptActionListener',
            BidActionListener: 'BidActionListener',
            BidCancelActionListener: 'BidCancelActionListener',
            BidRejectActionListener: 'BidRejectActionListener',
            CommentAddActionListener: 'CommentAddActionListener',
            EscrowCompleteActionListener: 'EscrowCompleteActionListener',
            EscrowLockActionListener: 'EscrowLockActionListener',
            EscrowRefundActionListener: 'EscrowRefundActionListener',
            EscrowReleaseActionListener: 'EscrowReleaseActionListener',
            ListingItemAddActionListener: 'ListingItemAddActionListener',
            OrderItemShipActionListener: 'OrderItemShipActionListener',
            ProposalAddActionListener: 'ProposalAddActionListener',
            VoteActionListener: 'VoteActionListener'
        },
        ActionListenerInterface: 'ActionListenerInterface',
        BaseActionListenr: 'BaseActionListenr',
        ServerStartedListener: 'ServerStartedListener'
    },
    Controller:     {
        ItemImageController: 'ItemImageController',
        RpcController: 'RpcController'
    }
};
