// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf as Database } from '../../config/Database';
import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import * as _ from 'lodash';
import * as Faker from 'faker';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageException } from '../exceptions/MessageException';
import { TestDataCreateRequest } from '../requests/TestDataCreateRequest';
import { ShippingCountries } from '../../core/helpers/ShippingCountries';
import { ShippingAvailability } from '../enums/ShippingAvailability';
import { ListingItemObjectType } from '../enums/ListingItemObjectType';
import { ListingItem } from '../models/ListingItem';
import { ListingItemService } from './ListingItemService';
import { ListingItemTemplateService } from './ListingItemTemplateService';
import { DefaultItemCategoryService } from './DefaultItemCategoryService';
import { DefaultProfileService } from './DefaultProfileService';
import { DefaultMarketService } from './DefaultMarketService';
import { ProfileService } from './ProfileService';
import { MarketService } from './MarketService';
import { ItemCategoryService } from './ItemCategoryService';
import { FavoriteItemService } from './FavoriteItemService';
import { ItemInformationService } from './ItemInformationService';
import { BidService } from './BidService';
import { ProposalService } from './ProposalService';
import { PaymentInformationService } from './PaymentInformationService';
import { ItemImageService } from './ItemImageService';
import { TestDataGenerateRequest } from '../requests/TestDataGenerateRequest';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../requests/ListingItemTemplateCreateRequest';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { FavoriteItemCreateRequest } from '../requests/FavoriteItemCreateRequest';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { ItemImageCreateRequest } from '../requests/ItemImageCreateRequest';
import { CreatableModel } from '../enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../requests/params/GenerateListingItemTemplateParams';
import { GenerateListingItemParams } from '../requests/params/GenerateListingItemParams';
import { GenerateProfileParams } from '../requests/params/GenerateProfileParams';
import { GenerateBidParams } from '../requests/params/GenerateBidParams';
import { GenerateProposalParams } from '../requests/params/GenerateProposalParams';
import { ImageProcessing } from '../../core/helpers/ImageProcessing';
import { AddressCreateRequest } from '../requests/AddressCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../requests/CryptocurrencyAddressCreateRequest';
import { BidDataCreateRequest } from '../requests/BidDataCreateRequest';
import { AddressType } from '../enums/AddressType';
import { CoreRpcService } from './CoreRpcService';
import { GenerateOrderParams } from '../requests/params/GenerateOrderParams';
import { OrderCreateRequest } from '../requests/OrderCreateRequest';
import { OrderService } from './OrderService';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalOptionCreateRequest } from '../requests/ProposalOptionCreateRequest';
import { ItemPriceCreateRequest } from '../requests/ItemPriceCreateRequest';
import { EscrowCreateRequest } from '../requests/EscrowCreateRequest';
import { ProposalCategory } from '../enums/ProposalCategory';
import { VoteCreateRequest } from '../requests/VoteCreateRequest';
import { VoteService } from './VoteService';
import { VoteActionService } from './action/VoteActionService';
import { ProposalResultService } from './ProposalResultService';
import { ProposalOptionResultService } from './ProposalOptionResultService';
import { ProposalActionService } from './action/ProposalActionService';
import { ItemCategoryUpdateRequest } from '../requests/ItemCategoryUpdateRequest';
import { BidDataValue } from '../enums/BidDataValue';
import { SettingCreateRequest } from '../requests/SettingCreateRequest';
import { ItemVote } from '../enums/ItemVote';
import { ShippingDestinationCreateRequest } from '../requests/ShippingDestinationCreateRequest';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../enums/HashableObjectType';
import { EscrowType, MPAction, SaleType} from 'omp-lib/dist/interfaces/omp-enums';
import { CryptoAddressType, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import {hash} from 'omp-lib/dist/hasher/hash';
import {EscrowRatioCreateRequest} from '../requests/EscrowRatioCreateRequest';
import {ShippingPriceCreateRequest} from '../requests/ShippingPriceCreateRequest';
import {MessagingInformationCreateRequest} from '../requests/MessagingInformationCreateRequest';
import {ListingItemObjectCreateRequest} from '../requests/ListingItemObjectCreateRequest';
import {ListingItemObjectDataCreateRequest} from '../requests/ListingItemObjectDataCreateRequest';
import {ItemImageDataCreateRequest} from '../requests/ItemImageDataCreateRequest';
import {ImageVersions} from '../../core/helpers/ImageVersionEnumType';
import {LocationMarkerCreateRequest} from '../requests/LocationMarkerCreateRequest';
import {ItemLocationCreateRequest} from '../requests/ItemLocationCreateRequest';

export class TestDataService {

    public log: LoggerType;
    public ignoreTables: string[] = ['sqlite_sequence', 'version', 'version_lock', 'knex_migrations', 'knex_migrations_lock'];

    constructor(
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) public defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.OrderService) private orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) private proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.action.ProposalActionService) private proposalActionService: ProposalActionService,
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) private proposalResultService: ProposalResultService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionResultService) private proposalOptionResultService: ProposalOptionResultService,
        @inject(Types.Service) @named(Targets.Service.VoteService) private voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) private voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * clean up the database
     * insert the default data
     *
     * @param ignoreTables
     * @param seed
     * @returns {Promise<void>}
     */
    public async clean(seed: boolean = true): Promise<void> {

        await this.cleanDb()
            .catch( reason => {
                this.log.debug('failed cleaning the db: ' + reason);
            });

        if (seed) {
            this.log.debug('seeding default data after cleaning');
            await this.defaultItemCategoryService.seedDefaultCategories()
                .catch( reason => {
                    this.log.debug('failed seeding default categories: ' + reason);
                });
            await this.defaultProfileService.seedDefaultProfile()
                .catch( reason => {
                    this.log.debug('failed seeding default profile: ' + reason);
                });
            await this.defaultMarketService.seedDefaultMarket()
                .catch( reason => {
                    this.log.debug('failed seeding default market: ' + reason);
                });
        }

        this.log.info('cleanup & default seeds done.');
        return;
    }

    /**
     * creates testdata from json
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async create<T>( @request(TestDataCreateRequest) body: TestDataCreateRequest): Promise<Bookshelf.Model<any>> {
        switch (body.model) {
            case CreatableModel.LISTINGITEMTEMPLATE: {
                return await this.listingItemTemplateService.create(
                    body.data as ListingItemTemplateCreateRequest,
                    body.timestampedHash);
            }
            case CreatableModel.LISTINGITEM: {
                return await this.listingItemService.create(body.data as ListingItemCreateRequest);
            }
            case CreatableModel.PROFILE: {
                return await this.profileService.create(body.data as ProfileCreateRequest);
            }
            case CreatableModel.ITEMCATEGORY: {
                return await this.itemCategoryService.create(body.data as ItemCategoryCreateRequest);
            }
            case CreatableModel.FAVORITEITEM: {
                return await this.favoriteItemService.create(body.data as FavoriteItemCreateRequest);
            }
            case CreatableModel.ITEMINFORMATION: {
                return await this.itemInformationService.create(body.data as ItemInformationCreateRequest);
            }
            case CreatableModel.BID: {
                return await this.bidService.create(body.data as BidCreateRequest);
            }
            case CreatableModel.PAYMENTINFORMATION: {
                return await this.paymentInformationService.create(body.data as PaymentInformationCreateRequest);
            }
            case CreatableModel.ITEMIMAGE: {
                return await this.itemImageService.create(body.data as ItemImageCreateRequest);
            }
            default: {
                throw new MessageException('Not implemented');
            }
        }
    }

    /**
     * generates testdata
     *
     * @param data
     *  model - listingitemtemplate, listingitem or profile
     *  amount - amount of models to create
     *  withRelated - return full related model data or just id's, defaults to true
     *  generateParams - boolean array from GenerateListingItemTemplateParams
     *
     * @returns {Promise<any>}
     */
    @validate()
    public async generate<T>( @request(TestDataGenerateRequest) body: TestDataGenerateRequest ): Promise<any> {
        switch (body.model) {
            case CreatableModel.LISTINGITEMTEMPLATE: {
                const generateParams = new GenerateListingItemTemplateParams(body.generateParams);
                return await this.generateListingItemTemplates(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.LISTINGITEM: {
                const generateParams = new GenerateListingItemParams(body.generateParams);
                return await this.generateListingItems(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.PROFILE: {
                const generateParams = new GenerateProfileParams(body.generateParams);
                return await this.generateProfiles(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.BID: {
                const generateParams = new GenerateBidParams(body.generateParams);
                return await this.generateBids(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.ORDER: {
                const generateParams = new GenerateOrderParams(body.generateParams);
                return await this.generateOrders(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.PROPOSAL: {
                const generateParams = new GenerateProposalParams(body.generateParams);
                return await this.generateProposals(body.amount, body.withRelated, generateParams);
            }
            default: {
                throw new MessageException('Not implemented');
            }
        }
    }

    /**
     * clean up the db
     *
     * @returns {Promise<void>}
     */
    private async cleanDb(): Promise<void> {

        // by default ignore these
        this.log.info('cleaning up the db, ignoring tables: ', this.ignoreTables);
        this.log.debug('ignoreTables: ', this.ignoreTables);

        const tablesToClean = [
            'order_item_objects',
            'order_items',
            'orders',
            'bid_datas',
            'locked_outputs',
            'bids',
            'location_markers',
            'item_locations',
            'shipping_destinations',
            'item_image_datas',
            'item_images',
            'item_informations',
            'shipping_prices',
            'item_prices',
            'escrow_ratios',
            'escrows',
            'payment_informations',
            'messaging_informations',
            'listing_item_object_datas',
            'listing_item_objects',
            'listing_items',
            'listing_item_templates',
            'addresses',
            'favorite_items',
            'cryptocurrency_addresses',
            'profiles',
            'shopping_cart_item',
            'shopping_cart',
            'item_categories',
            'markets',
            'users',        // todo: not needed
            'price_ticker', // todo: price_tickers
            'flagged_items',
            'currency_prices',
            'proposal_option_results',
            'proposal_results',
            'proposal_options',
            'proposals',
            'votes',
            'smsg_messages'
        ];

        this.log.debug('cleaning ' + tablesToClean.length + ' tables...');

        for (const table of tablesToClean) {
            await Database.knex.select().from(table).del();
        }
        return;
    }

    private async getTableNames(knex: any): Promise<any> {
        return await knex.raw("SELECT name FROM sqlite_master WHERE type='table';");
    }

    // -------------------
    // listingitemtemplates

    private async generateListingItemTemplates(
        amount: number, withRelated: boolean = true,
        generateParams: GenerateListingItemTemplateParams):
    Promise<resources.ListingItemTemplate[]> {

        const items: resources.ListingItemTemplate[] = [];
        for (let i = amount; i > 0; i--) {
            const listingItemTemplateCreateRequest = await this.generateListingItemTemplateData(generateParams);

            this.log.debug('listingItemTemplateCreateRequest:', JSON.stringify(listingItemTemplateCreateRequest, null, 2));

            let listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.create(listingItemTemplateCreateRequest)
                .then(value => value.toJSON());

            // generate a ListingItem with the same data
            if (generateParams.generateListingItem) {

                const market: resources.Market = generateParams.marketId
                    ? await this.marketService.getDefault().then(value => value.toJSON())
                    : await this.marketService.findOne(generateParams.marketId).then(value => value.toJSON());

                const listingItemCreateRequest = {
                    seller: listingItemTemplate.Profile.address,
                    market_id: market.id,
                    listing_item_template_id: listingItemTemplate.id,
                    itemInformation: listingItemTemplateCreateRequest.itemInformation,
                    paymentInformation: listingItemTemplateCreateRequest.paymentInformation,
                    messagingInformation: listingItemTemplateCreateRequest.messagingInformation,
                    listingItemObjects: listingItemTemplateCreateRequest.listingItemObjects,
                    expiryTime: 10,
                    postedAt: new Date().getTime(),
                    expiredAt: new Date().getTime() + 60 * 1000 * 60 * 24 * 10,
                    receivedAt: new Date().getTime(),
                    generatedAt: new Date().getTime()
                } as ListingItemCreateRequest;

                // this.log.debug('listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

                const listingItem: resources.ListingItem = await this.listingItemService.create(listingItemCreateRequest)
                    .then(value => value.toJSON());
                // this.log.debug('listingItem:', JSON.stringify(listingItem, null, 2));

                // fetch new relation
                listingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplate.id)
                    .then(value => value.toJSON());

            }
            items.push(listingItemTemplate);
        }
        return this.generateResponse(items, withRelated);
    }

    // -------------------
    // listingitems

    private async generateListingItems(
        amount: number, withRelated: boolean = true,
        generateParams: GenerateListingItemParams):
    Promise<resources.ListingItem[]> {

        this.log.debug('generateListingItems start');
        const items: resources.ListingItem[] = [];
        for (let i = amount; i > 0; i--) {

            const listingItemCreateRequest = await this.generateListingItemData(generateParams);

            // const fromAddress = await this.coreRpcService.getNewAddress();
            const marketModel = await this.marketService.getDefault();
            const market = marketModel.toJSON();

            this.log.debug('create listingitem start');
            const savedListingItemModel = await this.listingItemService.create(listingItemCreateRequest);
            this.log.debug('create listingitem end');

            // this.log.debug('savedListingItem: ', savedListingItem.toJSON());
            const result = savedListingItemModel.toJSON();
            items.push(result);

        }
        // this.log.debug('items: ', items);

        this.log.debug('generateListingItems end');

        return await this.generateResponse(items, withRelated);
    }

    // -------------------
    // bids
    private async generateBids(
        amount: number, withRelated: boolean = true, generateParams: GenerateBidParams):
    Promise<resources.Bid[]> {

        this.log.debug('generateBids, generateParams: ', generateParams);

        const listingItemTemplateGenerateParams = new GenerateListingItemTemplateParams();
        const listingItemGenerateParams = new GenerateListingItemParams();

        let listingItemTemplate: resources.ListingItemTemplate;
        let listingItem: resources.ListingItem;

        // generate template
        if (generateParams.generateListingItemTemplate) {
            const listingItemTemplates = await this.generateListingItemTemplates(1, true, listingItemTemplateGenerateParams);
            listingItemTemplate = listingItemTemplates[0];

            this.log.debug('templates generated:', listingItemTemplates.length);
            this.log.debug('listingItemTemplates[0].id:', listingItemTemplates[0].id);
            this.log.debug('listingItemTemplates[0].hash:', listingItemTemplates[0].hash);

            // set the hash for listing item generation
            listingItemGenerateParams.listingItemTemplateHash = listingItemTemplates[0].hash;
        }

        // generate item
        if (generateParams.generateListingItem) {

            // set the seller for listing item generation
            listingItemGenerateParams.seller = generateParams.listingItemSeller ? generateParams.listingItemSeller : null;

            this.log.debug('listingItemGenerateParams:', listingItemGenerateParams);

            const listingItems = await this.generateListingItems(1, true, listingItemGenerateParams);
            listingItem = listingItems[0];

            this.log.debug('listingItems generated:', listingItems.length);
            this.log.debug('listingItem.id:', listingItem.id);
            this.log.debug('listingItem.hash:', listingItem.hash);

            // set the hash for bid generation
            generateParams.listingItemHash = listingItem.hash;
        }

        this.log.debug('generateParams:', generateParams);

        const items: resources.Bid[] = [];
        for (let i = amount; i > 0; i--) {
            const bid = await this.generateBidData(generateParams);
            const savedBidModel = await this.bidService.create(bid);
            const result = savedBidModel.toJSON();
            items.push(result);
        }
        return this.generateResponse(items, withRelated);
    }

    private async generateBidData(generateParams: GenerateBidParams): Promise<BidCreateRequest> {

        const addresses = await this.generateAddressesData(1);
        // this.log.debug('Generated addresses = ' + JSON.stringify(addresses, null, 2));
        const address = addresses[0];

        // TODO: defaultProfile might not be the correct one
        const defaultProfile = await this.profileService.getDefault();
        address.profile_id = defaultProfile.Id;

        const bidder = generateParams.bidder ? generateParams.bidder : await this.coreRpcService.getNewAddress();
        const type = generateParams.type ? generateParams.type : MPAction.MPA_BID;

        // TODO: generate biddatas
        const bidDatas = [
            {key: 'size', value: 'XL'},
            {key: 'color', value: 'pink'},
            {key: BidDataValue.BUYER_OUTPUTS, value: '[{\"txid\":\"d39a1f90b7fd204bbdbaa49847c0615202c5624bc73634cd83d831e4a226ee0b\"' +
                ',\"vout\":1,\"amount\":1.52497491}]'},
            {key: BidDataValue.BUYER_PUBKEY, value: '021e3ccb8a295d6aca9cf2836587f24b1c2ce14b217fe85b1672ee133e2a5d6d90'},
            {key: BidDataValue.BUYER_CHANGE_ADDRESS, value: 'pbofM9onECpn76EosG1GLpyTcQCrfcLhb4'},
            {key: BidDataValue.BUYER_CHANGE_AMOUNT, value: 96.52477491},
            {key: BidDataValue.BUYER_RELEASE_ADDRESS, value: 'pbofM9onECpn76EosG1GLpyTcQCrfcLhb5'},
            {key: BidDataValue.SELLER_PUBKEY, value: '021e3ccb8a295d6aca9cf2836587f24b1c2ce14b217fe85b1672ee133e2a5d6d91'},
            {key: BidDataValue.SELLER_OUTPUTS, value: '[{\"txid\":\"d39a1f90b7fd204bbdbaa49847c0615202c5624bc73634cd83d831e4a226ee0a\"' +
                ',\"vout\":1,\"amount\":1.52497491}]'},
            {key: BidDataValue.SHIPPING_ADDRESS_FIRST_NAME, value: 'asdf'},
            {key: BidDataValue.SHIPPING_ADDRESS_LAST_NAME, value: 'asdf'},
            {key: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1, value: 'asdf'},
            {key: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2, value: 'asdf'},
            {key: BidDataValue.SHIPPING_ADDRESS_CITY, value: 'asdf'},
            {key: BidDataValue.SHIPPING_ADDRESS_STATE, value: ''},
            {key: BidDataValue.SHIPPING_ADDRESS_ZIP_CODE, value: '1234'},
            {key: BidDataValue.SHIPPING_ADDRESS_COUNTRY, value: 'FI'}
        ] as BidDataCreateRequest[];

        const bidCreateRequest = {
            type,
            address,
            bidder,
            bidDatas,
            generatedAt: new Date().getTime()
        } as BidCreateRequest;
        // this.log.debug('Generated bid = ' + JSON.stringify(retval, null, 2));

        bidCreateRequest.hash = ObjectHash.getHash(bidCreateRequest, HashableObjectType.BID_CREATEREQUEST);

        // if we have a hash, fetch the listingItem and set the relation
        if (generateParams.listingItemHash) {
            const listingItemModel = await this.listingItemService.findOneByHash(generateParams.listingItemHash);
            const listingItem = listingItemModel ? listingItemModel.toJSON() : null;
            if (listingItem) {
                bidCreateRequest.listing_item_id = listingItem.id;
            }
        }

        return bidCreateRequest;
    }

    // -------------------
    // orders
    private async generateOrders(
        amount: number, withRelated: boolean = true, generateParams: GenerateOrderParams):
    Promise<resources.Order[]> {

        this.log.debug('generateOrders, generateParams: ', generateParams);

        let bid: resources.Bid;

        // generate bid
        if (generateParams.generateBid) {
            const bidGenerateParams = new GenerateBidParams([
                generateParams.generateListingItemTemplate,
                generateParams.generateListingItem,
                generateParams.listingItemHash,
                MPAction.MPA_BID,
                generateParams.bidder,
                generateParams.seller
            ]);

            const bids = await this.generateBids(1, true, bidGenerateParams);
            bid = bids[0];

            this.log.debug('bids generated:', bids.length);
            this.log.debug('bid.id:', bid.id);

        } else {
            const bidModel = await this.bidService.findOne(generateParams.bidId);
            bid = bidModel.toJSON();
        }

        // set the bid_id for order generation
        generateParams.bidId = bid.id;

        const items: resources.Order[] = [];
        for (let i = amount; i > 0; i--) {
            const orderCreateRequest = await this.generateOrderData(generateParams);

            // this.log.debug('orderCreateRequest:', JSON.stringify(orderCreateRequest, null, 2));

            const savedOrderModel = await this.orderService.create(orderCreateRequest);
            const result = savedOrderModel.toJSON();
            items.push(result);
        }

        return this.generateResponse(items, withRelated);
    }

    private async generateOrderData(generateParams: GenerateOrderParams): Promise<OrderCreateRequest> {

        // get the bid
        const bidModel = await this.bidService.findOne(generateParams.bidId);
        const bid: resources.Bid = bidModel.toJSON();

        // then generate ordercreaterequest with some orderitems and orderitemobjects
        const orderCreateRequest = await this.bidService.getOrderFromBid(bid);

        if (!generateParams.generateOrderItem) {
            orderCreateRequest.orderItems = [];
        }
        return orderCreateRequest;
    }

    /*
    private async generateOrderItemData(bid: resources.Bid): Promise<OrderItemCreateRequest> {
        const orderItemObjects: OrderItemObjectCreateRequest[] = [];
        return {
            order_id: 0,
            itemHash: bid.ListingItem.hash,
            bid_id: bid.id,
            status: OrderItemStatus.AWAITING_ESCROW,
            orderItemObjects
        } as OrderItemCreateRequest;
    }
    */

    // -------------------
    // Proposals
    private async generateProposals(
        amount: number, withRelated: boolean = true,
        generateParams: GenerateProposalParams): Promise<resources.Proposal[]> {

        this.log.debug('generateProposals, generateParams: ', generateParams);

        // TODO: add template and item generation

        /*
        const listingItemTemplateGenerateParams = new GenerateListingItemTemplateParams();
        const listingItemGenerateParams = new GenerateListingItemParams();

        let listingItemTemplate: resources.ListingItemTemplate;
        let listingItem: resources.ListingItem;
        */
        // generate template
        if (generateParams.generateListingItemTemplate) {
            throw new NotImplementedException();
            /*
            const listingItemTemplates = await this.generateListingItemTemplates(1, true, listingItemTemplateGenerateParams);
            listingItemTemplate = listingItemTemplates[0];

            this.log.debug('templates generated:', listingItemTemplates.length);
            this.log.debug('listingItemTemplates[0].id:', listingItemTemplates[0].id);
            this.log.debug('listingItemTemplates[0].hash:', listingItemTemplates[0].hash);

            // set the hash for listing item generation
            listingItemGenerateParams.listingItemTemplateHash = listingItemTemplates[0].hash;
            */
        }

        // generate item
        if (generateParams.generateListingItem) {
            throw new NotImplementedException();
            /*
            // set the seller for listing item generation
            listingItemGenerateParams.seller = generateParams.seller ? generateParams.seller : null;

            this.log.debug('listingItemGenerateParams:', listingItemGenerateParams);

            const listingItems = await this.generateListingItems(1, true, listingItemGenerateParams);
            listingItem = listingItems[0];

            this.log.debug('listingItems generated:', listingItems.length);
            this.log.debug('listingItem.id:', listingItem.id);
            this.log.debug('listingItem.hash:', listingItem.hash);

            // set the hash for bid generation
            generateParams.listingItemHash = listingItem.hash;
            */
        }
        // TODO: proposalHash is not set to listingitem

        const items: resources.Proposal[] = [];

        for (let i = amount; i > 0; i--) {
            const proposalCreateRequest = await this.generateProposalData(generateParams);
            let proposalModel = await this.proposalService.create(proposalCreateRequest);
            let proposal: resources.Proposal = proposalModel.toJSON();

            this.log.debug('generating ' + generateParams.voteCount + ' votes...');
            if (generateParams.voteCount > 0) {
                const votes = await this.generateVotesForProposal(generateParams.voteCount, proposal);
            }

            // create and update ProposalResult
            let proposalResult = await this.proposalService.createEmptyProposalResult(proposal);
            proposalResult = await this.proposalService.recalculateProposalResult(proposal, true);
            // this.log.debug('updated proposalResult: ', JSON.stringify(proposalResult, null, 2));

            proposalModel = await this.proposalService.findOne(proposal.id);
            proposal = proposalModel.toJSON();
            items.push(proposal);
        }

        return this.generateResponse(items, withRelated);
    }

    private async generateVotesForProposal(amount: number, proposal: resources.Proposal): Promise<resources.Vote[]> {

        const items: resources.Vote[] = [];
        for (let i = amount; i > 0; i--) {
            const randomBoolean: boolean = Math.random() >= 0.5;
            const voter = Faker.finance.bitcoinAddress(); // await this.coreRpcService.getNewAddress();
            const proposalOptionId = proposal.ProposalOptions[randomBoolean ? 0 : 1].id;

            const voteCreateRequest = {
                proposal_option_id: proposalOptionId,
                signature: 'signature' + Faker.finance.bitcoinAddress(),
                voter,
                weight: 1,
                postedAt: new Date().getTime(),
                receivedAt: new Date().getTime(),
                expiredAt: new Date().getTime() + 100000000
            } as VoteCreateRequest;

            const voteModel = await this.voteService.create(voteCreateRequest);
            const vote: resources.Vote = voteModel.toJSON();
            this.log.debug('proposal.id : ' + proposal.id + ' : created vote: ' + vote.voter + ' : '
                + vote.ProposalOption.optionId + ' : ' + vote.ProposalOption.description);
            items.push(vote);
        }
        return items;
    }

    private async generateProposalData(generateParams: GenerateProposalParams): Promise<ProposalCreateRequest> {

        let submitter;
        if (!generateParams.submitter) {
            const defaultProfile = await this.profileService.getDefault();
            const profile = defaultProfile.toJSON();
            submitter = profile.address;
        } else {
            submitter = generateParams.submitter;
        }

        const category = generateParams.listingItemHash ? ProposalCategory.ITEM_VOTE : ProposalCategory.PUBLIC_VOTE;
        const title = generateParams.listingItemHash ? generateParams.listingItemHash : Faker.lorem.words(4);
        const item = generateParams.listingItemHash ? generateParams.listingItemHash : null;
        const description = generateParams.listingItemHash ? 'ILLEGAL ITEM' : Faker.lorem.words(40);

        const currentTime = new Date().getTime();

        const timeStart = generateParams.generatePastProposal
            ? _.random(1, (currentTime / 2), false)
            : _.random(currentTime + 100, currentTime + 1000, false);

        const timeEnd = generateParams.generatePastProposal
            ? _.random((currentTime / 2) + 100, currentTime - 1000, false)
            : _.random(currentTime + 1001, currentTime + 2000, false);

        // this.log.debug('generateParams.generatePastProposal: ', generateParams.generatePastProposal);
        // this.log.debug('currentblock: ', currentblock);
        // this.log.debug('blockStart: ', blockStart);
        // this.log.debug('blockEnd: ', blockEnd);

        const proposalCreateRequest = {
            submitter,
            category,
            item,
            title,
            description,
            timeStart,
            postedAt: timeStart,
            receivedAt: timeStart,
            expiredAt: timeEnd
        } as ProposalCreateRequest;

        proposalCreateRequest.hash = ObjectHash.getHash(proposalCreateRequest, HashableObjectType.PROPOSAL_CREATEREQUEST);

        const options: ProposalOptionCreateRequest[] = [];
        options.push({
            proposalHash: proposalCreateRequest.hash,
            optionId: 0,
            description: ItemVote.KEEP.toString()
        } as ProposalOptionCreateRequest);

        options.push({
            proposalHash: proposalCreateRequest.hash,
            optionId: 1,
            description: ItemVote.REMOVE.toString()
        } as ProposalOptionCreateRequest);

        // TODO: Generate a random number of proposal options, or a number specified in the generateParams
        proposalCreateRequest.options = options;

        // this.log.debug('proposalCreateRequest: ', JSON.stringify(proposalCreateRequest, null, 2));
        return proposalCreateRequest;
    }

    // -------------------
    // profiles

    private async generateProfiles(
        amount: number, withRelated: boolean = true, generateParams: GenerateProfileParams):
    Promise<resources.Profile[]> {

        const items: resources.Profile[] = [];
        for (let i = amount; i > 0; i--) {
            const profile = await this.generateProfileData(generateParams);
            const result: resources.Profile = await this.profileService.create(profile)
                .then(value => value.toJSON());
            items.push(result);
        }
        return this.generateResponse(items, withRelated);
    }

    private async generateResponse(items: any, withRelated: boolean): Promise<any> {
        if (withRelated) {
            return items;
        } else {
            const itemIds: number[] = [];
            for (const item of items) {
                itemIds.push(item.id);
            }
            return itemIds;
        }
    }

    private async generateProfileData(generateParams: GenerateProfileParams): Promise<ProfileCreateRequest> {
        const name = 'TEST-' + Faker.name.firstName();
        const address = await this.coreRpcService.getNewAddress();
        const shippingAddresses = generateParams.generateShippingAddresses
            ? await this.generateAddressesData(_.random(1, 5))
            : [];
        const cryptocurrencyAddresses = generateParams.generateCryptocurrencyAddresses
            ? await this.generateCryptocurrencyAddressesData(_.random(1, 5))
            : [];
        const settings = generateParams.generateSettings
            ? await this.generateSettings(_.random(1, 5))
            : [];

        return {
            name,
            address,
            shippingAddresses,
            cryptocurrencyAddresses,
            settings
        } as ProfileCreateRequest;
    }

    private async generateAddressesData(amount: number): Promise<AddressCreateRequest[]> {
        const addresses: AddressCreateRequest[] = [];
        for (let i = amount; i > 0; i--) {
            addresses.push({
                firstName: Faker.name.firstName(),
                lastName: Faker.name.lastName(),
                title: Faker.company.companyName(),
                addressLine1: Faker.address.streetAddress(),
                addressLine2: Faker.address.secondaryAddress(),
                zipCode: Faker.address.zipCode(),
                city: Faker.address.city(),
                state: Faker.address.state(),
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                type: AddressType.SHIPPING_OWN
            } as AddressCreateRequest);
        }
        return addresses;
    }

    private async generateCryptocurrencyAddressesData(amount: number): Promise<CryptocurrencyAddressCreateRequest[]> {
        const cryptoAddresses: CryptocurrencyAddressCreateRequest[] = [];
        for (let i = amount; i > 0; i--) {
            cryptoAddresses.push({
                type: Faker.random.arrayElement(Object.getOwnPropertyNames(CryptoAddressType)),
                address: await this.coreRpcService.getNewAddress()
            } as CryptocurrencyAddressCreateRequest);
        }
        return cryptoAddresses;
    }

    private async generateSettings(amount: number): Promise<SettingCreateRequest[]> {
        const settings: SettingCreateRequest[] = [];
        for (let i = amount; i > 0; i--) {
            settings.push({
                key: Faker.random.word(),
                value: Faker.random.word()
            } as SettingCreateRequest);
        }
        return settings;
    }

    /**
     * TODO: create a Proposal
     *
     * @param {GenerateListingItemParams} generateParams
     * @returns {Promise<ListingItemCreateRequest>}
     */
    private async generateListingItemData(generateParams: GenerateListingItemParams): Promise<ListingItemCreateRequest> {

        // get default profile
        const defaultProfile: resources.Profile = await this.profileService.getDefault()
            .then(value => value.toJSON());

        // get default market
        const defaultMarket: resources.Market = await this.marketService.getDefault()
            .then(value => value.toJSON());

        // set seller to given address or get a new one
        const seller = generateParams.seller ? generateParams.seller : await this.coreRpcService.getNewAddress();

        const itemInformation = generateParams.generateItemInformation ? this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? await this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];

        const listingItemCreateRequest = {
            seller,
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            market_id: defaultMarket.id,
            expiryTime: 4,
            postedAt: new Date().getTime(),
            expiredAt: new Date().getTime() + 100000000,
            receivedAt: new Date().getTime(),
            generatedAt: new Date().getTime()
        } as ListingItemCreateRequest;

        // this.log.debug('listingItemCreateRequest: ', JSON.stringify(listingItemCreateRequest, null, 2));

        // fetch listingItemTemplate if hash was given and set the listing_item_template_id
        let listingItemTemplate: resources.ListingItemTemplate | null = null;
        if (generateParams.listingItemTemplateHash) {
            const listingItemTemplateModel = await this.listingItemTemplateService.findOneByHash(generateParams.listingItemTemplateHash);
            listingItemTemplate = listingItemTemplateModel ? listingItemTemplateModel.toJSON() : null;
            if (listingItemTemplate) {
                listingItemCreateRequest.listing_item_template_id = listingItemTemplate.id;
            }
        }
        return listingItemCreateRequest;
    }

    private generateShippingDestinationsData(amount: number): ShippingDestinationCreateRequest[] {
        const items: ShippingDestinationCreateRequest[] = [];
        for (let i = amount; i > 0; i--) {
            items.push({
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                shippingAvailability: ShippingAvailability.SHIPS
            } as ShippingDestinationCreateRequest);
        }
        return items;
    }

    private generateItemLocationData(): ItemLocationCreateRequest {
        return {
            country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
            address: Faker.address.streetAddress(),
            description: Faker.lorem.paragraph(),
            locationMarker: {
                lat: _.random(-50, 50),
                lng: _.random(-50, 50),
                markerTitle: Faker.lorem.word(),
                markerText: Faker.lorem.sentence()
            } as LocationMarkerCreateRequest
        } as ItemLocationCreateRequest;
    }

    private generateItemImagesData(amount: number): ItemImageCreateRequest[] {
        const items: ItemImageCreateRequest[] = [];
        for (let i = amount; i > 0; i--) {
            const fakeHash = Faker.random.uuid();
            const item = {
                hash: fakeHash,
                data: [{
                    // itemHash: fakeHash,
                    dataId: Faker.internet.url(),
                    protocol: ProtocolDSN.LOCAL,
                    imageVersion: ImageVersions.ORIGINAL.propName,
                    encoding: 'BASE64',
                    data: ImageProcessing.milkcatSmall
                }] as ItemImageDataCreateRequest[]
            } as ItemImageCreateRequest;
            items.push(item);
        }
        return items;
    }

    private generateItemInformationData(generateParams: GenerateListingItemParams | GenerateListingItemTemplateParams): ItemInformationCreateRequest {

        const shippingDestinations = generateParams.generateShippingDestinations
            ? this.generateShippingDestinationsData(_.random(1, 5))
            : [];

        const itemImages = generateParams.generateItemImages
            ? this.generateItemImagesData(_.random(1, 2))
            : [];

        const itemLocation = generateParams.generateItemLocation
            ? this.generateItemLocationData()
            : undefined;

        const itemCategory = {} as ItemCategoryUpdateRequest;
        if (generateParams.categoryId) {
            itemCategory.id = generateParams.categoryId;
        } else {
            itemCategory.key = this.randomCategoryKey();
        }

        const itemInformation = {
            title: Faker.commerce.productName(),
            shortDescription: Faker.commerce.productAdjective() + ' ' + Faker.commerce.product(),
            longDescription: Faker.lorem.paragraph(),
            itemCategory,
            itemLocation,
            shippingDestinations,
            itemImages
        } as ItemInformationCreateRequest;
        return itemInformation;
    }

    private async generatePaymentInformationData(
        generateParams: GenerateListingItemParams | GenerateListingItemTemplateParams):
    Promise<PaymentInformationCreateRequest> {

        const escrow = generateParams.generateEscrow
            ? {
                type: EscrowType.MAD, // Faker.random.arrayElement(Object.getOwnPropertyNames(EscrowType)),
                ratio: {
                    buyer: _.random(1, 100),
                    seller: _.random(1, 100)
                } as EscrowRatioCreateRequest
            } as EscrowCreateRequest
            : undefined;

        const itemPrice = generateParams.generateItemPrice
            ? {
                currency: Cryptocurrency.PART, // Faker.random.arrayElement(Object.getOwnPropertyNames(Currency)),
                basePrice: _.random(0.1, 1.00),
                shippingPrice: {
                    domestic: _.random(0.01, 0.10),
                    international: _.random(0.10, 0.20)
                } as ShippingPriceCreateRequest,
                cryptocurrencyAddress: {
                    type: Faker.random.arrayElement(Object.getOwnPropertyNames(CryptoAddressType)),
                    address: await this.coreRpcService.getNewAddress()
                } as CryptocurrencyAddressCreateRequest
            } as ItemPriceCreateRequest
            : undefined;

        const paymentInformation = {
            type: SaleType.SALE, // Faker.random.arrayElement(Object.getOwnPropertyNames(SaleType)),
            escrow,
            itemPrice
        } as PaymentInformationCreateRequest;
        return paymentInformation;
    }

    private generateMessagingInformationData(): MessagingInformationCreateRequest[] {
        const messagingInformations: MessagingInformationCreateRequest[] = [{
            protocol: Faker.random.arrayElement(Object.getOwnPropertyNames(MessagingProtocol)),
            publicKey: Faker.random.uuid()
        }] as MessagingInformationCreateRequest[];
        return messagingInformations;
    }

    private generateListingItemObjectsData(generateParams: GenerateListingItemParams | GenerateListingItemTemplateParams): ListingItemObjectCreateRequest[] {
        const listingItemObjectDatas: ListingItemObjectDataCreateRequest[] = generateParams.generateObjectDatas
            ? this.generateObjectDataData(_.random(1, 5))
            : [];

        const listingItemObjects = [{
            type: Faker.random.arrayElement(Object.getOwnPropertyNames(ListingItemObjectType)),
            description: Faker.lorem.paragraph(),
            order: Faker.random.number(),
            listingItemObjectDatas
        }] as ListingItemObjectCreateRequest[];
        return listingItemObjects;
    }

    private generateObjectDataData(amount: number): ListingItemObjectDataCreateRequest[] {
        const objects: ListingItemObjectDataCreateRequest[] = [];
        for (let i = amount; i > 0; i--) {
            objects.push({
                key: Faker.lorem.slug(),
                value: Faker.lorem.word()
            } as ListingItemObjectDataCreateRequest);
        }
        return objects;
    }

    private async generateListingItemTemplateData(generateParams: GenerateListingItemTemplateParams): Promise<ListingItemTemplateCreateRequest> {
        const itemInformation = generateParams.generateItemInformation ? this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? await this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];

        const profile: resources.Profile = generateParams.profileId === null
            ? await this.profileService.getDefault().then(value => value.toJSON())
            : await this.profileService.findOne(generateParams.profileId).then(value => value.toJSON());

        const listingItemTemplateCreateRequest = {
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            profile_id: profile.id
        } as ListingItemTemplateCreateRequest;

        // this.log.debug('listingItemTemplateCreateRequest', JSON.stringify(listingItemTemplateCreateRequest, null, 2));
        return listingItemTemplateCreateRequest;
    }


    private randomCategoryKey(): string {
        const categoryKeys = [
            'cat_high_business_corporate', 'cat_high_vehicles_aircraft_yachts', 'cat_high_real_estate', 'cat_high_luxyry_items',
            'cat_high_services', 'cat_housing_vacation_rentals', 'cat_housing_travel_services', 'cat_housing_apartments_rental_housing',
            'cat_apparel_adult', 'cat_apparel_children', 'cat_apparel_bags_luggage', 'cat_apparel_other', 'cat_app_android',
            'cat_app_ios', 'cat_app_windows', 'cat_app_mac', 'cat_app_web_development', 'cat_app_other', 'cat_auto_cars_truck_parts',
            'cat_auto_motorcycle', 'cat_auto_rv_boating', 'cat_auto_other', 'cat_media_books_art_print', 'cat_media_music_physical',
            'cat_media_music_digital', 'cat_media_movies_entertainment', 'cat_media_other', 'cat_mobile_accessories',
            'cat_mobile_cell_phones', 'cat_mobile_tablets', 'cat_mobile_other', 'cat_electronics_home_audio', 'cat_electronics_music_instruments',
            'cat_electronics_automation_security', 'cat_electronics_video_camera', 'cat_electronics_television_monitors',
            'cat_electronics_computers_parts', 'cat_electronics_gaming_esports', 'cat_electronics_other', 'cat_health_diet_nutrition',
            'cat_health_personal_care', 'cat_health_household_supplies', 'cat_health_beauty_products_jewelry', 'cat_health_baby_infant_care',
            'cat_health_other', 'cat_home_furniture', 'cat_home_appliances_kitchenware', 'cat_home_textiles_rugs_bedding',
            'cat_home_hardware_tools', 'cat_home_pet_supplies', 'cat_home_home_office', 'cat_home_sporting_outdoors', 'cat_home_specialty_items',
            'cat_home_other', 'cat_services_commercial', 'cat_services_freelance', 'cat_services_labor_talent', 'cat_services_transport_logistics',
            'cat_services_escrow', 'cat_services_endoflife_estate_inheritance', 'cat_services_legal_admin', 'cat_services_other',
            'cat_wholesale_consumer_goods', 'cat_wholesale_commercial_industrial', 'cat_wholesale_scientific_equipment_supplies',
            'cat_wholesale_scientific_lab_services', 'cat_wholesale_other'
        ];

        const rand = Math.floor(Math.random() * categoryKeys.length);
        return categoryKeys[rand];
    }

}
