/**
 * constants.Targets
 * ------------------------------------------------
 *
 * This is for our IOC so have a unique key/target for
 * our controllers, services and repositories
 *
 * This file is generated with the task `$ npm run console update:targets`.
 */
export declare const Targets: {
    Model: {
        ActionMessage: string;
        Address: string;
        Bid: string;
        BidData: string;
        CryptocurrencyAddress: string;
        CurrencyPrice: string;
        Escrow: string;
        EscrowRatio: string;
        FavoriteItem: string;
        FlaggedItem: string;
        ItemCategory: string;
        ItemImage: string;
        ItemImageData: string;
        ItemInformation: string;
        ItemLocation: string;
        ItemPrice: string;
        ListingItem: string;
        ListingItemObject: string;
        ListingItemObjectData: string;
        ListingItemTemplate: string;
        LocationMarker: string;
        Market: string;
        MessageData: string;
        MessageEscrow: string;
        MessageInfo: string;
        MessageObject: string;
        MessagingInformation: string;
        Order: string;
        OrderItem: string;
        OrderItemObject: string;
        PaymentInformation: string;
        PriceTicker: string;
        Profile: string;
        ShippingDestination: string;
        ShippingPrice: string;
        ShoppingCart: string;
        ShoppingCartItem: string;
        User: string;
    };
    Repository: {
        ActionMessageRepository: string;
        AddressRepository: string;
        BidDataRepository: string;
        BidRepository: string;
        CryptocurrencyAddressRepository: string;
        CurrencyPriceRepository: string;
        EscrowRatioRepository: string;
        EscrowRepository: string;
        FavoriteItemRepository: string;
        FlaggedItemRepository: string;
        ItemCategoryRepository: string;
        ItemImageDataRepository: string;
        ItemImageRepository: string;
        ItemInformationRepository: string;
        ItemLocationRepository: string;
        ItemPriceRepository: string;
        ListingItemObjectDataRepository: string;
        ListingItemObjectRepository: string;
        ListingItemRepository: string;
        ListingItemTemplateRepository: string;
        LocationMarkerRepository: string;
        MarketRepository: string;
        MessageDataRepository: string;
        MessageEscrowRepository: string;
        MessageInfoRepository: string;
        MessageObjectRepository: string;
        MessagingInformationRepository: string;
        OrderItemObjectRepository: string;
        OrderItemRepository: string;
        OrderRepository: string;
        PaymentInformationRepository: string;
        PriceTickerRepository: string;
        ProfileRepository: string;
        ShippingDestinationRepository: string;
        ShippingPriceRepository: string;
        ShoppingCartItemRepository: string;
        ShoppingCartRepository: string;
        UserRepository: string;
    };
    Service: {
        ActionMessageService: string;
        AddressService: string;
        BidActionService: string;
        BidDataService: string;
        BidService: string;
        CoreCookieService: string;
        CoreRpcService: string;
        CryptocurrencyAddressService: string;
        CurrencyPriceService: string;
        DefaultItemCategoryService: string;
        DefaultMarketService: string;
        DefaultProfileService: string;
        EscrowActionService: string;
        EscrowRatioService: string;
        EscrowService: string;
        FavoriteItemService: string;
        FlaggedItemService: string;
        ItemCategoryService: string;
        ItemImageDataService: string;
        ItemImageHttpUploadService: string;
        ItemImageService: string;
        ItemInformationService: string;
        ItemLocationService: string;
        ItemPriceService: string;
        ListingItemActionService: string;
        ListingItemObjectDataService: string;
        ListingItemObjectService: string;
        ListingItemService: string;
        ListingItemTemplateService: string;
        LocationMarkerService: string;
        MarketService: string;
        MessageDataService: string;
        MessageEscrowService: string;
        MessageInfoService: string;
        MessageObjectService: string;
        MessagingInformationService: string;
        OrderItemObjectService: string;
        OrderItemService: string;
        OrderService: string;
        PaymentInformationService: string;
        PriceTickerService: string;
        ProfileService: string;
        ShippingDestinationService: string;
        ShippingPriceService: string;
        ShoppingCartItemService: string;
        ShoppingCartService: string;
        SmsgService: string;
        TestDataService: string;
        UserService: string;
    };
    Command: {
        address: {
            AddressAddCommand: string;
            AddressListCommand: string;
            AddressRemoveCommand: string;
            AddressRootCommand: string;
            AddressUpdateCommand: string;
        };
        admin: {
            AdminCommand: string;
        };
        BaseCommand: string;
        bid: {
            BidAcceptCommand: string;
            BidCancelCommand: string;
            BidRejectCommand: string;
            BidRootCommand: string;
            BidSearchCommand: string;
            BidSendCommand: string;
        };
        Command: string;
        CommandEnumType: string;
        currencyprice: {
            CurrencyPriceRootCommand: string;
        };
        daemon: {
            DaemonRootCommand: string;
        };
        data: {
            DataAddCommand: string;
            DataCleanCommand: string;
            DataGenerateCommand: string;
            DataRootCommand: string;
        };
        escrow: {
            EscrowAddCommand: string;
            EscrowLockCommand: string;
            EscrowRefundCommand: string;
            EscrowReleaseCommand: string;
            EscrowRemoveCommand: string;
            EscrowRootCommand: string;
            EscrowUpdateCommand: string;
        };
        favorite: {
            FavoriteAddCommand: string;
            FavoriteListCommand: string;
            FavoriteRemoveCommand: string;
            FavoriteRootCommand: string;
        };
        HelpCommand: string;
        itemcategory: {
            ItemCategoryAddCommand: string;
            ItemCategoryGetCommand: string;
            ItemCategoryListCommand: string;
            ItemCategoryRemoveCommand: string;
            ItemCategoryRootCommand: string;
            ItemCategorySearchCommand: string;
            ItemCategoryUpdateCommand: string;
        };
        itemimage: {
            ItemImageAddCommand: string;
            ItemImageListCommand: string;
            ItemImageRemoveCommand: string;
            ItemImageRootCommand: string;
        };
        iteminformation: {
            ItemInformationAddCommand: string;
            ItemInformationGetCommand: string;
            ItemInformationRootCommand: string;
            ItemInformationUpdateCommand: string;
        };
        itemlocation: {
            ItemLocationAddCommand: string;
            ItemLocationRemoveCommand: string;
            ItemLocationRootCommand: string;
            ItemLocationUpdateCommand: string;
        };
        listingitem: {
            ListingItemFlagCommand: string;
            ListingItemGetCommand: string;
            ListingItemRootCommand: string;
            ListingItemSearchCommand: string;
            ListingItemUpdateCommand: string;
        };
        listingitemobject: {
            ListingItemObjectRootCommand: string;
            ListingItemObjectSearchCommand: string;
        };
        listingitemtemplate: {
            ListingItemTemplateAddCommand: string;
            ListingItemTemplateGetCommand: string;
            ListingItemTemplatePostCommand: string;
            ListingItemTemplateRemoveCommand: string;
            ListingItemTemplateRootCommand: string;
            ListingItemTemplateSearchCommand: string;
        };
        market: {
            MarketAddCommand: string;
            MarketListCommand: string;
            MarketRootCommand: string;
        };
        messaginginformation: {
            MessagingInformationRootCommand: string;
            MessagingInformationUpdateCommand: string;
        };
        order: {
            OrderRootCommand: string;
            OrderSearchCommand: string;
        };
        paymentinformation: {
            PaymentInformationRootCommand: string;
            PaymentInformationUpdateCommand: string;
        };
        priceticker: {
            PriceTickerRootCommand: string;
        };
        profile: {
            ProfileAddCommand: string;
            ProfileGetCommand: string;
            ProfileListCommand: string;
            ProfileRemoveCommand: string;
            ProfileRootCommand: string;
            ProfileUpdateCommand: string;
        };
        RpcCommandInterface: string;
        shippingdestination: {
            ShippingDestinationAddCommand: string;
            ShippingDestinationListCommand: string;
            ShippingDestinationRemoveCommand: string;
            ShippingDestinationRootCommand: string;
        };
        shoppingcart: {
            ShoppingCartAddCommand: string;
            ShoppingCartClearCommand: string;
            ShoppingCartGetCommand: string;
            ShoppingCartListCommand: string;
            ShoppingCartRemoveCommand: string;
            ShoppingCartRootCommand: string;
            ShoppingCartUpdateCommand: string;
        };
        shoppingcartitem: {
            ShoppingCartItemAddCommand: string;
            ShoppingCartItemListCommand: string;
            ShoppingCartItemRemoveCommand: string;
            ShoppingCartItemRootCommand: string;
        };
    };
    Factory: {
        ActionMessageFactory: string;
        BidFactory: string;
        EscrowFactory: string;
        ImageFactory: string;
        ItemCategoryFactory: string;
        ListingItemFactory: string;
        MessagingInformationFactory: string;
        OrderFactory: string;
        RpcCommandFactory: string;
    };
    MessageProcessor: {
        deprecated: {
            AcceptBidMessageProcessor: string;
            BidMessageProcessor: string;
            CancelBidMessageProcessor: string;
            ListingItemMessageProcessor: string;
            RejectBidMessageProcessor: string;
            TestMessageProcessor: string;
            UpdateListingItemMessageProcessor: string;
        };
        MessageProcessor: string;
        MessageProcessorInterface: string;
    };
    Middleware: {
        AuthenticateMiddleware: string;
        MulterMiddleware: string;
        PopulateUserMiddleware: string;
        RestApiMiddleware: string;
        RpcMiddleware: string;
    };
    Listener: {
        ServerStartedListener: string;
        user: {
            UserAuthenticatedListener: string;
            UserCreatedListener: string;
        };
    };
    Controller: {
        ItemImageController: string;
        RpcController: string;
    };
};
