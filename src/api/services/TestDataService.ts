// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf as Database } from '../../config/Database';
import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import * as _ from 'lodash';
import * as Faker from 'faker';
import * as jpeg from 'jpeg-js';
import { inject, named } from 'inversify';
import { request, validate } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Core, Targets, Types } from '../../constants';
import { MessageException } from '../exceptions/MessageException';
import { TestDataCreateRequest } from '../requests/testdata/TestDataCreateRequest';
import { ShippingCountries } from '../../core/helpers/ShippingCountries';
import { ShippingAvailability } from '../enums/ShippingAvailability';
import { ListingItemObjectType } from '../enums/ListingItemObjectType';
import { ListingItem } from '../models/ListingItem';
import { ListingItemService } from './model/ListingItemService';
import { ListingItemTemplateService } from './model/ListingItemTemplateService';
import { DefaultItemCategoryService } from './DefaultItemCategoryService';
import { DefaultProfileService } from './DefaultProfileService';
import { DefaultMarketService } from './DefaultMarketService';
import { ProfileService } from './model/ProfileService';
import { MarketService } from './model/MarketService';
import { ItemCategoryService } from './model/ItemCategoryService';
import { FavoriteItemService } from './model/FavoriteItemService';
import { ItemInformationService } from './model/ItemInformationService';
import { BidService } from './model/BidService';
import { ProposalService } from './model/ProposalService';
import { PaymentInformationService } from './model/PaymentInformationService';
import { ItemImageService } from './model/ItemImageService';
import { TestDataGenerateRequest } from '../requests/testdata/TestDataGenerateRequest';
import { ProfileCreateRequest } from '../requests/model/ProfileCreateRequest';
import { ListingItemCreateRequest } from '../requests/model/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../requests/model/ListingItemTemplateCreateRequest';
import { ItemCategoryCreateRequest } from '../requests/model/ItemCategoryCreateRequest';
import { FavoriteItemCreateRequest } from '../requests/model/FavoriteItemCreateRequest';
import { ItemInformationCreateRequest } from '../requests/model/ItemInformationCreateRequest';
import { BidCreateRequest } from '../requests/model/BidCreateRequest';
import { PaymentInformationCreateRequest } from '../requests/model/PaymentInformationCreateRequest';
import { ItemImageCreateRequest } from '../requests/model/ItemImageCreateRequest';
import { CreatableModel } from '../enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../requests/testdata/GenerateListingItemTemplateParams';
import { GenerateListingItemParams } from '../requests/testdata/GenerateListingItemParams';
import { GenerateProfileParams } from '../requests/testdata/GenerateProfileParams';
import { GenerateBidParams } from '../requests/testdata/GenerateBidParams';
import { GenerateProposalParams } from '../requests/testdata/GenerateProposalParams';
import { AddressCreateRequest } from '../requests/model/AddressCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../requests/model/CryptocurrencyAddressCreateRequest';
import { AddressType } from '../enums/AddressType';
import { CoreRpcService } from './CoreRpcService';
import { GenerateOrderParams } from '../requests/testdata/GenerateOrderParams';
import { OrderCreateRequest } from '../requests/model/OrderCreateRequest';
import { OrderService } from './model/OrderService';
import { ProposalCreateRequest } from '../requests/model/ProposalCreateRequest';
import { ProposalOptionCreateRequest } from '../requests/model/ProposalOptionCreateRequest';
import { ItemPriceCreateRequest } from '../requests/model/ItemPriceCreateRequest';
import { EscrowCreateRequest } from '../requests/model/EscrowCreateRequest';
import { ProposalCategory } from '../enums/ProposalCategory';
import { VoteCreateRequest } from '../requests/model/VoteCreateRequest';
import { VoteService } from './model/VoteService';
import { VoteActionService } from './action/VoteActionService';
import { ProposalResultService } from './model/ProposalResultService';
import { ProposalOptionResultService } from './model/ProposalOptionResultService';
import { ProposalAddActionService } from './action/ProposalAddActionService';
import { SettingCreateRequest } from '../requests/model/SettingCreateRequest';
import { ItemVote } from '../enums/ItemVote';
import { ShippingDestinationCreateRequest } from '../requests/model/ShippingDestinationCreateRequest';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { EscrowReleaseType, EscrowType, HashableBidField, MessagingProtocol, MPAction, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { CryptoAddressType, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { EscrowRatioCreateRequest } from '../requests/model/EscrowRatioCreateRequest';
import { ShippingPriceCreateRequest } from '../requests/model/ShippingPriceCreateRequest';
import { MessagingInformationCreateRequest } from '../requests/model/MessagingInformationCreateRequest';
import { ListingItemObjectCreateRequest } from '../requests/model/ListingItemObjectCreateRequest';
import { ListingItemObjectDataCreateRequest } from '../requests/model/ListingItemObjectDataCreateRequest';
import { ItemImageDataCreateRequest } from '../requests/model/ItemImageDataCreateRequest';
import { ImageVersions } from '../../core/helpers/ImageVersionEnumType';
import { ItemLocationCreateRequest } from '../requests/model/ItemLocationCreateRequest';
import { OrderFactory } from '../factories/model/OrderFactory';
import { OrderCreateParams } from '../factories/model/ModelCreateParams';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidCreateRequestConfig } from '../factories/hashableconfig/createrequest/HashableBidCreateRequestConfig';
import { HashableProposalCreateRequestConfig } from '../factories/hashableconfig/createrequest/HashableProposalCreateRequestConfig';
import { HashableProposalAddField, HashableProposalOptionField } from '../factories/hashableconfig/HashableField';
import { HashableListingItemTemplateCreateRequestConfig } from '../factories/hashableconfig/createrequest/HashableListingItemTemplateCreateRequestConfig';
import { HashableProposalOptionMessageConfig } from '../factories/hashableconfig/message/HashableProposalOptionMessageConfig';
import { OrderStatus } from '../enums/OrderStatus';
import { toSatoshis } from 'omp-lib/dist/util';
import { CommentCreateRequest } from '../requests/model/CommentCreateRequest';
import { CommentType } from '../enums/CommentType';
import { CommentService } from './model/CommentService';
import { GenerateCommentParams } from '../requests/testdata/GenerateCommentParams';
import { HashableCommentCreateRequestConfig } from '../factories/hashableconfig/createrequest/HashableCommentCreateRequestConfig';
import { DefaultSettingService } from './DefaultSettingService';
import { SettingValue } from '../enums/SettingValue';
import { GenerateSmsgMessageParams } from '../requests/testdata/GenerateSmsgMessageParams';
import { SmsgMessageService } from './model/SmsgMessageService';
import { SmsgMessageCreateRequest } from '../requests/model/SmsgMessageCreateRequest';
import { ListingItemAddMessageFactory, SellerMessage } from '../factories/message/ListingItemAddMessageFactory';
import { ompVersion } from 'omp-lib/dist/omp';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ActionMessageInterface } from '../messages/action/ActionMessageInterface';
import { GovernanceAction } from '../enums/GovernanceAction';
import { CommentAction } from '../enums/CommentAction';
import { ListingItemAddMessage } from '../messages/action/ListingItemAddMessage';
import { CoreSmsgMessage } from '../messages/CoreSmsgMessage';
import { ActionDirection } from '../enums/ActionDirection';
import { SmsgMessageFactory } from '../factories/model/SmsgMessageFactory';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { GenerateBlacklistParams } from '../requests/testdata/GenerateBlacklistParams';
import { BlacklistService } from './model/BlacklistService';
import { BlacklistCreateRequest } from '../requests/model/BlacklistCreateRequest';
import { BlacklistType } from '../enums/BlacklistType';
import { IdentityService } from './model/IdentityService';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { HashableListingItemTemplateConfig } from '../factories/hashableconfig/model/HashableListingItemTemplateConfig';
import { ServerStartedListener } from '../listeners/ServerStartedListener';
import { ActionMessageObjects } from '../enums/ActionMessageObjects';
import { ListingItemAddRequest } from '../requests/action/ListingItemAddRequest';
import { SmsgSendParams } from '../requests/action/SmsgSendParams';
import {ListingItemAddMessageCreateParams} from '../requests/message/ListingItemAddMessageCreateParams';


export class TestDataService {

    public log: LoggerType;
    public ignoreTables: string[] = ['sqlite_sequence', 'version', 'version_lock', 'knex_migrations', 'knex_migrations_lock'];

    constructor(
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) private defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) private defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) private defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.DefaultSettingService) private defaultSettingService: DefaultSettingService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.model.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) private orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) private proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalResultService) private proposalResultService: ProposalResultService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalOptionResultService) private proposalOptionResultService: ProposalOptionResultService,
        @inject(Types.Service) @named(Targets.Service.model.VoteService) private voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.model.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) private commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) private blacklistService: BlacklistService,
        @inject(Types.Service) @named(Targets.Service.action.ProposalAddActionService) private proposalAddActionService: ProposalAddActionService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) private voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.model.OrderFactory) private orderFactory: OrderFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemAddMessageFactory) private listingItemAddMessageFactory: ListingItemAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Listener) @named(Targets.Listener.ServerStartedListener) private serverStartedListener: ServerStartedListener,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * clean up the database
     * insert the default data
     *
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

            await this.serverStartedListener.bootstrap()
                .catch(reason => {
                    this.log.error('ERROR: marketplace bootstrap failed: ', reason);
                });

        }

        this.log.info('cleanup & default seeds done.');

        return;
    }

    /**
     * creates testdata from json
     *
     * @returns {Promise<ListingItem>}
     * @param body
     */
    @validate()
    public async create<T>( @request(TestDataCreateRequest) body: TestDataCreateRequest): Promise<Bookshelf.Model<any>> {
        switch (body.model) {
            case CreatableModel.LISTINGITEMTEMPLATE: {
                return await this.listingItemTemplateService.create(body.data as ListingItemTemplateCreateRequest);
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
            case CreatableModel.COMMENT: {
                return await this.commentService.create(body.data as CommentCreateRequest);
            }
            default: {
                throw new MessageException('Not implemented');
            }
        }
    }

    /**
     * generates testdata
     *
     *  model - listingitemtemplate, listingitem or profile
     *  amount - amount of models to create
     *  withRelated - return full related model data or just id's, defaults to true
     *  generateParams - boolean array from GenerateListingItemTemplateParams
     *
     * @param body
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
            case CreatableModel.COMMENT: {
                const generateParams = new GenerateCommentParams(body.generateParams);
                return await this.generateComments(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.SMSGMESSAGE: {
                const generateParams = new GenerateSmsgMessageParams(body.generateParams);
                return await this.generateSmsgMessages(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.BLACKLIST: {
                const generateParams = new GenerateBlacklistParams(body.generateParams);
                return await this.generateBlacklists(body.amount, body.withRelated, generateParams);
            }
            default: {
                throw new MessageException('Not implemented');
            }
        }
    }

    /**
     * Generates a new Profile with default Market and Identity
     */
    public async generateProfile(): Promise<resources.Profile> {

        const sellerProfileParams = new GenerateProfileParams([true, true, true]).toParamsArray();
        const profiles = await this.generate({
            model: CreatableModel.PROFILE,
            amount: 1,
            withRelated: true,
            generateParams: sellerProfileParams
        } as TestDataGenerateRequest);

        // seed the default Market for default Profile, also creates the market Identity for the Profile
        await this.defaultMarketService.seedDefaultMarketForProfile(profiles[0])
            .catch(reason => {
                this.log.error('ERROR: seedDefaultMarket, ' + reason);
                throw reason;
            });

        this.log.debug('generateProfile(), Profile generated.');

        return await this.profileService.findOne(profiles[0].id).then(value => value.toJSON());
    }

    /**
     * Generates a new ListingItemTemplate without ListingItem
     */
    public async generateListingItemTemplate(sellerProfile: resources.Profile, bidderMarket: resources.Market,
                                             generateItemImages: boolean = false): Promise<resources.ListingItemTemplate> {
        const generateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            true,                   // generateItemLocation
            true,                   // generateShippingDestinations
            generateItemImages,     // generateItemImages
            true,                   // generatePaymentInformation
            true,                   // generateEscrow
            true,                   // generateItemPrice
            false,                  // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            sellerProfile.id,       // profileId
            false,                  // generateListingItem
            bidderMarket.id         // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await this.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);

        // this.log.debug('listingItemTemplates: ', JSON.stringify(listingItemTemplates, null, 2));
        return listingItemTemplates[0];
    }

    /**
     * Generates a new ListingItem with ListingItemTemplate
     */
    public async generateListingItemWithTemplate(sellerProfile: resources.Profile, bidderMarket: resources.Market,
                                                 generateItemImages: boolean = false): Promise<resources.ListingItem> {
        const generateParams = new GenerateListingItemTemplateParams([
            true,                   // generateItemInformation
            true,                   // generateItemLocation
            true,                   // generateShippingDestinations
            generateItemImages,     // generateItemImages
            true,                   // generatePaymentInformation
            true,                   // generateEscrow
            true,                   // generateItemPrice
            false,                  // generateMessagingInformation
            false,                  // generateListingItemObjects
            false,                  // generateObjectDatas
            sellerProfile.id,       // profileId
            true,                   // generateListingItem
            bidderMarket.id         // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await this.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);

        // this.log.debug('listingItemTemplates: ', JSON.stringify(listingItemTemplates, null, 2));
        return await this.listingItemService.findOne(listingItemTemplates[0].ListingItems[0].id).then(value => value.toJSON());
    }

    /**
     * Generates a new Bid
     */
    public async generateBid(type: ActionMessageTypes, listingItemId: number, bidderMarket: resources.Market, sellerMarket: resources.Market,
                             parentBidId?: number): Promise<resources.Bid[]> {
        const bidParams = new GenerateBidParams([
            false,                              // generateListingItemTemplate
            false,                              // generateListingItem
            false,                              // generateOrder
            listingItemId,                      // listingItemId
            type,                               // type
            bidderMarket.Identity.address,      // bidder
            sellerMarket.Identity.address,      // seller
            parentBidId                         // parentBidId, should be set if type !== MPA_BID
        ]);

        const bidCreateRequest = await this.generateBidData(bidParams);
        const bids: resources.Bid[] = [];
        bids[0] = await this.bidService.create(bidCreateRequest).then(value => value.toJSON());

        bidCreateRequest.profile_id = sellerMarket.Profile.id;
        bidCreateRequest.address.profile_id = sellerMarket.Profile.id;
        bids[1] = await this.bidService.create(bidCreateRequest).then(value => value.toJSON());

        return bids;
    }

    // TODO: generateOrder + generateBid needs to be redone..

    /**
     * Generates a new Order
     */
    public async generateOrder(bid: resources.Bid, generateOrderItems: boolean): Promise<resources.Order[]> {
        const orderGenerateParams = new GenerateOrderParams([
            generateOrderItems,             // generateOrderItems
            bid.id                          // bidId
        ]);

        const orders: resources.Order[] = await this.generate({
            model: CreatableModel.ORDER,
            amount: 1,
            withRelated: true,
            generateParams: orderGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        // this.log.debug('orders: ', JSON.stringify(orders, null, 2));
        return orders;
    }

    /**
     * Generates a new Proposal
     */
    public async generateProposal(listingItemId: number, bidderMarket: resources.Market,
                                  generateOptions: boolean, generateResults: boolean,
                                  voteCount: number = 0): Promise<resources.Proposal> {
        const generateProposalParams = new GenerateProposalParams([
            listingItemId,                              // listingItemId,
            false,                                      // generatePastProposal,
            voteCount,                                  // voteCount
            bidderMarket.Identity.address,              // submitter
            bidderMarket.receiveAddress,                // market
            generateOptions,
            generateResults
        ]).toParamsArray();

        const proposals: resources.Proposal[] = await this.generate({
            model: CreatableModel.PROPOSAL,             // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProposalParams      // what kind of data to generate
        } as TestDataGenerateRequest);
        // this.log.debug('proposals: ', JSON.stringify(proposals, null, 2));

        return proposals[0];
    }

    /**
     * Generates CoreSmsgMessage
     */
    public async generateCoreSmsgMessage(actionMessage: ActionMessageInterface, from: string, to: string): Promise<CoreSmsgMessage> {

        const marketplaceMessage: MarketplaceMessage = {
            version: ompVersion(),
            action: actionMessage
        };
        const now = Date.now();
        const message = {
            msgid: 'TESTMESSAGE-' + Faker.random.uuid(),
            version: '0300',
            location: 'inbox',
            read: true,
            paid: true,
            payloadsize: 320,
            received: now,
            sent: now - 10000,
            expiration: now + (1000 * 60 * 60 * 24 * 2),
            daysretention: 2,
            from,
            to,
            text: JSON.stringify(marketplaceMessage)
        } as CoreSmsgMessage;

        return message;
    }

    /**
     * Generates an random colored image with specified width, height and quality
     * @param width width of the image
     * @param height height of the image
     * @param quality quality of the image
     */
    public async generateRandomImage(width: number = 200, height: number = 200, quality: number = 50): Promise<string> {
        const frameData = Buffer.alloc(width * height * 4);
        let i = 0;
        while (i < frameData.length) {
            frameData[i++] = Math.floor(Math.random() * 256);
        }
        const rawImageData = {
            data: frameData,
            width,
            height
        };
        const image: jpeg.RawImageData<Buffer> = jpeg.encode(rawImageData, quality);
        return image.data.toString('base64');
    }

    /**
     * return a random default ItemCategory
     */
    public async getRandomCategory(): Promise<resources.ItemCategory> {
        // findRoot should be called only if were not fetching a default category
        const defaultRoot: resources.ItemCategory = await this.itemCategoryService.findDefaultRoot().then(value => value.toJSON());
        const childCat: resources.ItemCategory = Faker.random.arrayElement(defaultRoot.ChildItemCategories);
        return Faker.random.arrayElement(childCat.ChildItemCategories);
    }

    /**
     * clean up the db
     *
     * @returns {Promise<void>}
     */
    private async cleanDb(): Promise<void> {

        // by default ignore these
        this.log.info('cleaning up the db, ignoring tables: ', this.ignoreTables);

        const tablesToClean = [
            'order_items',
            'orders',
            'bid_datas',
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
            'identities',
            'profiles',
            'shopping_cart_items',
            'shopping_carts',
            'item_categories',
            'markets',
            'identities',
            'settings',
            'price_ticker', // todo: price_tickers
            'flagged_items',
            'currency_prices',
            'proposal_option_results',
            'proposal_results',
            'proposal_options',
            'proposals',
            'votes',
            'smsg_messages',
            'comments',
            'blacklists'
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

    private async generateListingItemTemplates(amount: number, withRelated: boolean = true,
                                               generateParams: GenerateListingItemTemplateParams): Promise<resources.ListingItemTemplate[]> {

        // this.log.debug('generateListingItemTemplates(), generateParams: ', JSON.stringify(generateParams, null, 2));

        const items: resources.ListingItemTemplate[] = [];
        for (let i = amount; i > 0; i--) {
            const listingItemTemplateCreateRequest: ListingItemTemplateCreateRequest = await this.generateListingItemTemplateData(generateParams);

            // this.log.debug('generateListingItemTemplates(), listingItemTemplateCreateRequest: ', JSON.stringify(listingItemTemplateCreateRequest, null, 2));

            // create base template
            let listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.create(listingItemTemplateCreateRequest)
                .then(value => value.toJSON());

            // create market template
            if (generateParams.soldOnMarketId) {
                // this.log.debug('generateListingItemTemplates(), generateParams.soldOnMarketId: ', generateParams.soldOnMarketId);

                const soldOnMarket: resources.Market = await this.marketService.findOne(generateParams.soldOnMarketId).then(value => value.toJSON());
                listingItemTemplateCreateRequest.market = soldOnMarket.receiveAddress;
                listingItemTemplateCreateRequest.parent_listing_item_template_id = listingItemTemplate.id;
                listingItemTemplate = await this.listingItemTemplateService.create(listingItemTemplateCreateRequest).then(value => value.toJSON());
            }

            // this.log.debug('created listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));
            // this.log.debug('created listingItemTemplate, hash: ', listingItemTemplate.hash);
            // this.log.debug('generateParams.generateListingItem: ', generateParams.generateListingItem);

            // generate a ListingItem with the same data
            if (generateParams.generateListingItem) {

                // there's a listingItem, so template is posted and should have a hash
                const hash = ConfigurableHasher.hash(listingItemTemplate, new HashableListingItemTemplateConfig());
                this.log.debug('template.hash:', hash);
                listingItemTemplate = await this.listingItemTemplateService.updateHash(listingItemTemplate.id, hash).then(value => value.toJSON());

                const soldOnMarket: resources.Market = await this.marketService.findOne(generateParams.soldOnMarketId).then(value => value.toJSON());
                const sellersMarketIdentity: resources.Identity = await this.profileService.findOne(generateParams.profileId)
                    .then(value => {
                        const sellerProfile: resources.Profile = value.toJSON();
                        const foundMarket = _.find(sellerProfile.Markets, sellersMarket => {
                            return sellersMarket.receiveAddress === soldOnMarket.receiveAddress;
                        });

                        if (foundMarket) {
                            return foundMarket.Identity;
                        } else {
                            throw new MessageException('Seller does not have a market on which the ListingItem is posted on.');
                        }
                    });

                // this.log.debug('sellersMarketIdentityAddress: ', sellersMarketIdentity.address);

                const listingItemCreateRequest = {
                    seller: sellersMarketIdentity.address,
                    market: soldOnMarket.receiveAddress,
                    listing_item_template_id: listingItemTemplate.id,
                    itemInformation: listingItemTemplateCreateRequest.itemInformation,
                    paymentInformation: listingItemTemplateCreateRequest.paymentInformation,
                    messagingInformation: listingItemTemplateCreateRequest.messagingInformation,
                    listingItemObjects: listingItemTemplateCreateRequest.listingItemObjects,
                    msgid: '' + Date.now(),
                    expiryTime: 10,
                    postedAt: Date.now(),
                    expiredAt: Date.now() + 60 * 1000 * 60 * 24 * 10,
                    receivedAt: Date.now(),
                    generatedAt: listingItemTemplateCreateRequest.generatedAt
                } as ListingItemCreateRequest;

                // this.log.debug('listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

                listingItemCreateRequest.hash = ConfigurableHasher.hash(listingItemCreateRequest, new HashableListingItemTemplateCreateRequestConfig());
                this.log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
                this.log.debug('listingItem.hash:', listingItemCreateRequest.hash);

                // make sure the hashes match
                if (listingItemCreateRequest.hash !== listingItemTemplate.hash) {
                    throw new MessageException('ListingItemTemplate and ListingItem hashes dont match.');
                }

                const message = {
                    address: sellersMarketIdentity.address,
                    hash: listingItemCreateRequest.hash
                } as SellerMessage;
                const signature = await this.coreRpcService.signMessage(sellersMarketIdentity.wallet, sellersMarketIdentity.address, message);
                listingItemCreateRequest.signature = signature;

                const listingItem: resources.ListingItem = await this.listingItemService.create(listingItemCreateRequest).then(value => value.toJSON());
                // this.log.debug('listingItem:', JSON.stringify(listingItem, null, 2));
                this.log.debug('created listingItem, hash: ', listingItem.hash);

                listingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplate.id).then(value => value.toJSON());
            }
            items.push(listingItemTemplate);
        }
        this.log.debug('generated ' + items.length + ' listingItemTemplates');
        return await this.generateResponse(items, withRelated);
    }

    // -------------------
    // listingitems

    private async generateListingItems(amount: number, withRelated: boolean = true,
                                       generateParams: GenerateListingItemParams): Promise<resources.ListingItem[]> {

        const items: resources.ListingItem[] = [];
        for (let i = amount; i > 0; i--) {

            const listingItemCreateRequest = await this.generateListingItemData(generateParams);

            // const fromAddress = await this.coreRpcService.getNewAddress();
            // const market: resources.Market = await this.marketService.getDefaultForProfile().then(value => value.toJSON());

            const savedListingItem: resources.ListingItem = await this.listingItemService.create(listingItemCreateRequest).then(value => value.toJSON());

            // this.log.debug('savedListingItem: ', JSON.stringify(savedListingItem, null, 2));

            // TODO: make this optional/configurable
            if (generateParams.generatePaymentInformation && generateParams.generateEscrow && generateParams.generateItemPrice)  {
                await this.createListingItemSmsgMessage(savedListingItem);
            }

            items.push(savedListingItem);
        }
        // this.log.debug('items: ', items);

        return await this.generateResponse(items, withRelated);
    }

    private async createListingItemSmsgMessage(listingItem: resources.ListingItem): Promise<resources.SmsgMessage> {

        const sellerIdentity: resources.Identity = await this.identityService.findOneByAddress(listingItem.seller)
            .then(value => value.toJSON())
            .catch(reason => {
                return {
                    address: Faker.finance.bitcoinAddress()
                } as resources.Identity;
            });

        const listingItemAddMessage: ListingItemAddMessage = await this.listingItemAddMessageFactory.get({
            sendParams: {
                wallet: sellerIdentity.wallet
            } as SmsgSendParams,
            listingItem,
            sellerAddress: sellerIdentity.address
        } as ListingItemAddRequest).then(value => value.action as ListingItemAddMessage);

        const marketplaceMessage: MarketplaceMessage = {
            version: ompVersion(),
            action: listingItemAddMessage
        };

        // put the MarketplaceMessage in SmsgMessage
        const listingItemSmsg = {
            msgid: 'TESTMESSAGE-' + Faker.random.uuid(),
            version: '0300',
            location: 'inbox',
            read: true,
            paid: true,
            payloadsize: 100,
            received: Date.now(),
            sent: Date.now(),
            expiration: Date.now(),
            daysretention: 7,
            from: listingItem.seller,
            to: listingItem.market,
            text: JSON.stringify(marketplaceMessage)
        } as CoreSmsgMessage;

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            status: SmsgMessageStatus.PROCESSED,
            message: listingItemSmsg
        });
        return await this.smsgMessageService.create(smsgMessageCreateRequest)
            .then(async smsgMessageModel => {

                const smsgMessage: resources.SmsgMessage = smsgMessageModel.toJSON();
                this.log.debug('SAVED SMSGMESSAGE: '
                    + smsgMessage.from + ' => ' + smsgMessage.to
                    + ' : ' + smsgMessage.type
                    + ' : ' + smsgMessage.status
                    + ' : ' + smsgMessage.msgid);
                return smsgMessage;
            });
    }

    // -------------------
    // bids
    private async generateBids(
        amount: number, withRelated: boolean = true, generateParams: GenerateBidParams):
    Promise<resources.Bid[]> {

        const listingItemTemplateGenerateParams = new GenerateListingItemTemplateParams();
        const listingItemGenerateParams = new GenerateListingItemParams();

        // TODO: implement listingitem and template generation

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
            listingItemGenerateParams.seller = generateParams.seller ? generateParams.seller : '';

            // this.log.debug('listingItemGenerateParams:', listingItemGenerateParams);

            const listingItems = await this.generateListingItems(1, true, listingItemGenerateParams);
            listingItem = listingItems[0];

            this.log.debug('listingItems generated:', listingItems.length);
            this.log.debug('listingItem.id:', listingItem.id);
            this.log.debug('listingItem.hash:', listingItem.hash);

            // set the hash for bid generation
            generateParams.listingItemId = listingItem.id;
        }

        const bids: resources.Bid[] = [];
        for (let i = amount; i > 0; i--) {
            const bidCreateRequest = await this.generateBidData(generateParams);
            // this.log.debug('bidCreateRequest:', JSON.stringify(bidCreateRequest, null, 2));
            let bid: resources.Bid = await this.bidService.create(bidCreateRequest).then(value => value.toJSON());

            const orderGenerateParams = new GenerateOrderParams([true, bid.id]);

            if (generateParams.generateOrder && bid.type === MPAction.MPA_BID) {
                await this.generateOrders(1, true, orderGenerateParams);
                bid = await this.bidService.findOne(bid.id).then(value => value.toJSON());
            }
            bids.push(bid);
        }

        // this.log.debug('bids:', JSON.stringify(items, null, 2));

        return this.generateResponse(bids, withRelated);
    }

    private async generateBidData(generateParams: GenerateBidParams): Promise<BidCreateRequest> {
        // this.log.debug('generateBidData, generateParams: ', JSON.stringify(generateParams, null, 2));
        const listingItem: resources.ListingItem = await this.listingItemService.findOne(generateParams.listingItemId).then(value => value.toJSON());

        const bidderIdentity: resources.Identity = await this.identityService.findOneByAddress(generateParams.bidder)
            .then(value => value.toJSON())
            .catch(reason => undefined);
        const sellerIdentity: resources.Identity = await this.identityService.findOneByAddress(generateParams.seller)
            .then(value => value.toJSON())
            .catch(reason => undefined);

        let profileId;

        if (_.isNil(bidderIdentity)) {
            // creating for seller
            profileId = sellerIdentity.Profile.id;
        } else {
            profileId = bidderIdentity.Profile.id;
        }

        const type = generateParams.type ? generateParams.type : MPAction.MPA_BID;
        const bidDatas = [{
            key: 'size',
            value: 'XL'
        }, {
            key: 'color',
            value: 'pink'
        }];

        // TODO: other types
        if (type === MPAction.MPA_BID) {
            bidDatas.push({
                key: ActionMessageObjects.BID_ON_MARKET,
                value: listingItem.market
            });
            bidDatas.push({
                key: ActionMessageObjects.ORDER_HASH,
                value: Faker.random.uuid()
            });
        }

        const bidCreateRequest = {
            listing_item_id: listingItem.id,
            profile_id: profileId,
            parent_bid_id: generateParams.parentBidId,
            type,
            bidder: generateParams.bidder,
            bidDatas,
            generatedAt: +Date.now(),
            msgid: Faker.random.uuid(),
            address: MPAction.MPA_BID === type ? {
                profile_id: profileId,
                firstName: Faker.name.firstName(),
                lastName: Faker.name.lastName(),
                addressLine1: Faker.address.streetAddress(),
                zipCode: Faker.address.zipCode(),
                city: Faker.address.city(),
                state: Faker.address.state(),
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                type: AddressType.SHIPPING_BID
            } as AddressCreateRequest : undefined
        } as BidCreateRequest;

        // TODO: this hash is incorrect and should be fixed.
        // TODO: add market to the hash?
        bidCreateRequest.hash = ConfigurableHasher.hash(bidCreateRequest, new HashableBidCreateRequestConfig([{
            value: listingItem.hash,
            to: HashableBidField.ITEM_HASH
        }, {
            value: EscrowType.MULTISIG,
            to: HashableBidField.PAYMENT_ESCROW_TYPE
        }, {
            value: Cryptocurrency.PART,
            to: HashableBidField.PAYMENT_CRYPTO
        }]));

        return bidCreateRequest;
    }

    // -------------------
    // orders
    private async generateOrders(amount: number, withRelated: boolean = true, generateParams: GenerateOrderParams): Promise<resources.Order[]> {
        const orders: resources.Order[] = [];
        for (let i = amount; i > 0; i--) {
            const orderCreateRequest: OrderCreateRequest = await this.generateOrderData(generateParams);
            const order: resources.Order = await this.orderService.create(orderCreateRequest).then(value => value.toJSON());
            orders.push(order);
        }

        return this.generateResponse(orders, withRelated);
    }

    private async generateOrderData(generateParams: GenerateOrderParams): Promise<OrderCreateRequest> {

        // this.log.debug('generateOrderData, generateParams: ', JSON.stringify(generateParams, null, 2));
        const bid: resources.Bid = await this.bidService.findOne(generateParams.bidId).then(value => value.toJSON());

        const orderCreateParamsForBidder = {
            bids: [bid],
            addressId: bid.ShippingAddress.id,
            status: OrderStatus.PROCESSING,
            buyer: bid.bidder,
            seller: bid.ListingItem.seller,
            generatedAt: +Date.now()
        } as OrderCreateParams;

        const orderCreateRequest: OrderCreateRequest = await this.orderFactory.get(orderCreateParamsForBidder);

        if (!generateParams.generateOrderItem) {
            orderCreateRequest.orderItems = [];
        }

        return orderCreateRequest;
    }

    // -------------------
    // Proposals
    private async generateProposals(amount: number, withRelated: boolean = true, generateParams: GenerateProposalParams): Promise<resources.Proposal[]> {

        // this.log.debug('generateParams: ', JSON.stringify(generateParams, null, 2));

        const items: resources.Proposal[] = [];

        for (let i = amount; i > 0; i--) {
            const proposalCreateRequest: ProposalCreateRequest = await this.generateProposalData(generateParams);

            //  this.log.debug('proposalCreateRequest: ', JSON.stringify(proposalCreateRequest, null, 2));
            let proposal: resources.Proposal = await this.proposalService.create(proposalCreateRequest).then(value => value.toJSON());

            // in case of ITEM_VOTE || MARKET_VOTE, we also need to create the FlaggedItem
            if (ProposalCategory.ITEM_VOTE === proposal.category || ProposalCategory.MARKET_VOTE === proposal.category) {
                await this.proposalAddActionService.createFlaggedItemForProposal(proposal);
                this.log.debug('created FlaggedItem');
            }

            this.log.debug('generating ' + generateParams.voteCount + ' votes...');
            if (generateParams.voteCount > 0) {
                const votes = await this.generateVotesForProposal(generateParams.voteCount, proposal);
            }

            if (generateParams.generateResults) {
                await this.proposalService.createEmptyProposalResult(proposal);
                await this.proposalService.recalculateProposalResult(proposal, true);
            }

            proposal = await this.proposalService.findOne(proposal.id).then(value => value.toJSON());
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
                postedAt: Date.now(),
                receivedAt: Date.now(),
                expiredAt: Date.now() + 100000000
            } as VoteCreateRequest;

            const vote: resources.Vote = await this.voteService.create(voteCreateRequest).then(value => value.toJSON());
            this.log.debug('proposal.id : ' + proposal.id + ' : created vote: ' + vote.voter + ' : '
                + vote.ProposalOption.optionId + ' : ' + vote.ProposalOption.description);
            items.push(vote);
        }
        return items;
    }

    private async generateProposalData(generateParams: GenerateProposalParams): Promise<ProposalCreateRequest> {

        let submitter;
        if (!generateParams.submitter) {
            const defaultProfile: resources.Profile = await this.profileService.getDefault().then(value => value.toJSON());
            const defaultMarket = await this.defaultMarketService.getDefaultForProfile(defaultProfile.id).then(value => value.toJSON());
            submitter = defaultMarket.Identity.address;
        } else {
            submitter = generateParams.submitter;
        }

        let listingItem: resources.ListingItem | undefined;
        if (generateParams.listingItemId && generateParams.listingItemId > 0) {
            listingItem = await this.listingItemService.findOne(generateParams.listingItemId).then(value => value.toJSON());
        }

        const category = listingItem ? ProposalCategory.ITEM_VOTE : ProposalCategory.PUBLIC_VOTE;
        const title = listingItem ? listingItem.hash : Faker.lorem.words(4);
        const item = listingItem ? listingItem.hash : null;
        const description = listingItem ? 'ILLEGAL ITEM' : Faker.lorem.words(20);

        const currentTime = Date.now();

        const timeStart = generateParams.generatePastProposal
            ? _.random(1, (currentTime / 2), false)
            : _.random(currentTime + 10000, currentTime + 100000, false);

        const timeEnd = generateParams.generatePastProposal
            ? _.random((currentTime / 2) + 100, currentTime - 1000, false)
            : _.random(currentTime + 1000000, currentTime + 2000000, false);

        // this.log.debug('generateParams.generatePastProposal: ', generateParams.generatePastProposal);
        // this.log.debug('currentTime: ', currentTime);
        // this.log.debug('timeStart:   ', timeStart);
        // this.log.debug('timeEnd:     ', timeEnd);

        const options: ProposalOptionCreateRequest[] = [];

        if (generateParams.generateOptions) {
            options.push({
                optionId: 0,
                description: ItemVote.KEEP.toString()
            } as ProposalOptionCreateRequest);
            options.push({
                optionId: 1,
                description: ItemVote.REMOVE.toString()
            } as ProposalOptionCreateRequest);
        }

        const proposalCreateRequest = {
            msgid: Faker.random.uuid(),
            market: generateParams.market,
            submitter,
            category,
            target: item,
            title,
            description,
            options,
            timeStart,
            postedAt: timeStart,
            receivedAt: timeStart,
            expiredAt: timeEnd
        } as ProposalCreateRequest;

        // TODO: Generate a random number of proposal options, or a number specified in the generateParams

        // hash the proposal
        let hashableOptions = '';
        for (const option of proposalCreateRequest.options) {
            hashableOptions = hashableOptions + option.optionId + ':' + option.description + ':';
        }
        proposalCreateRequest.hash = ConfigurableHasher.hash(proposalCreateRequest, new HashableProposalCreateRequestConfig([{
            value: hashableOptions,
            to: HashableProposalAddField.PROPOSAL_OPTIONS
        }]));

        // add hashes for the options too
        for (const option of proposalCreateRequest.options) {
            hashableOptions = hashableOptions + option.optionId + ':' + option.description + ':';

            option.hash = ConfigurableHasher.hash(option, new HashableProposalOptionMessageConfig([{
                value: proposalCreateRequest.hash,
                to: HashableProposalOptionField.PROPOSALOPTION_PROPOSAL_HASH
            }]));
        }

        // this.log.debug('proposalCreateRequest: ', JSON.stringify(proposalCreateRequest, null, 2));
        return proposalCreateRequest;
    }

    // -------------------
    // Comments
    private async generateComments(
        amount: number, withRelated: boolean = true,
        generateParams: GenerateCommentParams): Promise<resources.Comment[]> {

        // this.log.debug('generateComments, generateParams: ', generateParams);

        // TODO: add template and item generation
        // generate template
        if (generateParams.generateListingItemTemplate) {
            throw new NotImplementedException();
        }

        // generate item
        if (generateParams.generateListingItem) {
            throw new NotImplementedException();
        }

        const items: resources.Comment[] = [];

        for (let i = amount; i > 0; i--) {
            const commentCreateRequest = await this.generateCommentData(generateParams);
            const comment: resources.Comment = await this.commentService.create(commentCreateRequest).then(value => value.toJSON());
            items.push(comment);
        }

        return this.generateResponse(items, withRelated);
    }

    private async generateCommentData(generateParams: GenerateCommentParams): Promise<CommentCreateRequest> {
        if (generateParams.generateListingItem) {
            throw new NotImplementedException();
        }

        if (generateParams.generateListingItemTemplate) {
            throw new NotImplementedException();
        }

        if (generateParams.generatePastComment) {
            throw new NotImplementedException();
        }

        const currentTime = Date.now();

        // Generate comment in the past
        const timeStart = generateParams.generatePastComment
            ? _.random(1, (currentTime / 2), false)
            : _.random(currentTime + 100, currentTime + 1000, false);

        const timeEnd = generateParams.generatePastComment
            ? _.random((currentTime / 2) + 100, currentTime - 1000, false)
            : _.random(currentTime + 1001, currentTime + 2000, false);


        // TODO: parent comment create?

        const smsgData: any = {
            postedAt: timeStart,
            receivedAt: timeStart,
            expiredAt: timeEnd
        };

        const commentCreateRequest = {
            sender: generateParams.sender,
            receiver: generateParams.receiver,
            type: generateParams.type || CommentType.LISTINGITEM_QUESTION_AND_ANSWERS,
            target: generateParams.target,
            message: Faker.lorem.lines(1),
            parentCommentId: null,
            generatedAt: timeStart,
            ...smsgData
        } as CommentCreateRequest;

        commentCreateRequest.hash = ConfigurableHasher.hash(commentCreateRequest, new HashableCommentCreateRequestConfig());

        return commentCreateRequest;
    }

    // -------------------
    // profiles

    private async generateProfiles(amount: number, withRelated: boolean = true, generateParams: GenerateProfileParams): Promise<resources.Profile[]> {

        const items: resources.Profile[] = [];
        for (let i = amount; i > 0; i--) {
            const profileCreateRequest: ProfileCreateRequest = await this.generateProfileData(generateParams, i);

            // create the Profile
            let profile: resources.Profile = await this.profileService.create(profileCreateRequest).then(value => value.toJSON());

            // create Identity for the Profile
            await this.identityService.createProfileIdentity(profile).then(value => value.toJSON());
            profile = await this.profileService.findOne(profile.id).then(value => value.toJSON());
            items.push(profile);
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

    private async generateProfileData(generateParams: GenerateProfileParams, i: number): Promise<ProfileCreateRequest> {
        // added the i in order to reduce the number of wallets created for testing...
        const name = 'TEST-' + i;

        const shippingAddresses = generateParams.generateShippingAddresses
            ? await this.generateAddressesData(_.random(1, 2))
            : [];

        // todo: these are not really used
        // const cryptocurrencyAddresses = generateParams.generateCryptocurrencyAddresses
        //     ? await this.generateCryptocurrencyAddressesData(_.random(1, 5))
        //     : [];

        const settings = generateParams.generateSettings
            ? await this.generateSettings(_.random(1, 5))
            : [];

        return {
            name,
            shippingAddresses,
            // cryptocurrencyAddresses,
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
/*
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
*/
    private async generateSettings(amount: number): Promise<SettingCreateRequest[]> {
        const settings: SettingCreateRequest[] = [];
        for (let i = amount; i > 0; i--) {
            settings.push({
                key: 'TEST-PROFILE-SETTING-' + i,
                value: Faker.random.word()
            } as SettingCreateRequest);
        }

        settings.push({
            key: SettingValue.APP_DEFAULT_MARKETPLACE_NAME.toString(),
            value: process.env[SettingValue.APP_DEFAULT_MARKETPLACE_NAME]
        } as SettingCreateRequest);
        settings.push({
            key: SettingValue.APP_DEFAULT_MARKETPLACE_PRIVATE_KEY.toString(),
            value: process.env[SettingValue.APP_DEFAULT_MARKETPLACE_PRIVATE_KEY]
        } as SettingCreateRequest);
        settings.push({
            key: SettingValue.APP_DEFAULT_MARKETPLACE_ADDRESS.toString(),
            value: process.env[SettingValue.APP_DEFAULT_MARKETPLACE_ADDRESS]
        } as SettingCreateRequest);
        return settings;
    }

    /**
     *
     * @param {GenerateListingItemParams} generateParams
     * @returns {Promise<ListingItemCreateRequest>}
     */
    private async generateListingItemData(generateParams: GenerateListingItemParams): Promise<ListingItemCreateRequest> {

        this.log.debug('generateParams: ', JSON.stringify(generateParams, null, 2));

        // TODO: refactor this GenerateListingItemParams mess
        const profile: resources.Profile = await this.profileService.getDefault().then(value => value.toJSON());

        let market: resources.Market;
        if (generateParams.soldOnMarketId) {
            market = await this.marketService.findOne(generateParams.soldOnMarketId).then(value => value.toJSON());
        } else {
            market = await this.defaultMarketService.getDefaultForProfile(profile.id).then(value => value.toJSON());
            generateParams.soldOnMarketId = market.id;
        }

        const seller = generateParams.seller ? generateParams.seller : market.Identity.address;

        // this.log.debug('seller: ', seller);
        // this.log.debug('market: ', JSON.stringify(market, null, 2));

        const itemInformation = generateParams.generateItemInformation ? await this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? await this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];

        const listingItemCreateRequest = {
            seller,
            // TODO: signature:
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            market: market.receiveAddress,
            msgid: '' + Date.now(),
            expiryTime: 4,
            postedAt: Date.now(),
            expiredAt: Date.now() + 100000000,
            receivedAt: Date.now(),
            generatedAt: Date.now()
        } as ListingItemCreateRequest;

        listingItemCreateRequest.hash = ConfigurableHasher.hash(listingItemCreateRequest, new HashableListingItemTemplateCreateRequestConfig());
        const message = {
            address: market.Identity.address,
            hash: listingItemCreateRequest.hash
        } as SellerMessage;
        const signature = await this.coreRpcService.signMessage(market.Identity.wallet, market.Identity.address, message);
        listingItemCreateRequest.signature = signature;

        // this.log.debug('listingItemCreateRequest: ', JSON.stringify(listingItemCreateRequest, null, 2));

        // fetch listingItemTemplate if hash was given and set the listing_item_template_id
        if (generateParams.listingItemTemplateHash) {
            const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService
                .findOneByHash(generateParams.listingItemTemplateHash).then(value => value.toJSON());
            listingItemCreateRequest.listing_item_template_id = listingItemTemplate.id;
            listingItemCreateRequest.hash = listingItemTemplate.hash;
            this.log.debug('generateParams.listingItemTemplateHash: ', generateParams.listingItemTemplateHash);
        }

        this.log.debug('listingItemCreateRequest: ', JSON.stringify(listingItemCreateRequest, null, 2));
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
            description: Faker.lorem.paragraph()
/*
    TODO: this should be configurable
            locationMarker: {
                lat: _.random(-50, 50),
                lng: _.random(-50, 50),
                title: Faker.lorem.word(),
                description: Faker.lorem.sentence()
            } as LocationMarkerCreateRequest
*/
        } as ItemLocationCreateRequest;
    }

    private async generateItemImagesData(amount: number): Promise<ItemImageCreateRequest[]> {
        const items: ItemImageCreateRequest[] = [];
        for (let i = amount; i > 0; i--) {
            const fakeHash = Faker.random.uuid();
            const data = await this.generateRandomImage(20, 20);
            const item = {
                hash: fakeHash,
                data: [{
                    dataId: Faker.internet.url(),
                    protocol: ProtocolDSN.LOCAL,
                    imageVersion: ImageVersions.ORIGINAL.propName,
                    encoding: 'BASE64',
                    data
                }] as ItemImageDataCreateRequest[]
            } as ItemImageCreateRequest;
            items.push(item);
        }
        return items;
    }

    private async generateItemInformationData(generateParams: GenerateListingItemParams | GenerateListingItemTemplateParams):
        Promise<ItemInformationCreateRequest> {

        const shippingDestinations = generateParams.generateShippingDestinations
            ? this.generateShippingDestinationsData(_.random(1, 5))
            : [];

        const itemImages = generateParams.generateItemImages
            ? await this.generateItemImagesData(_.random(1, 2))
            : [];

        const itemLocation = generateParams.generateItemLocation
            ? this.generateItemLocationData()
            : undefined;

        // if (!generateParams.categoryId) {
        //    const randomCategory: resources.ItemCategory = await this.getRandomCategory();
        //    generateParams.categoryId = randomCategory.id;
        // }

        const itemInformationCreateRequest = {
            title: Faker.commerce.productAdjective() + Faker.commerce.productName(),
            shortDescription: Faker.commerce.product() + ' ' + Faker.commerce.productAdjective() + ' ' + Faker.commerce.productAdjective() + ' '
                + Faker.commerce.product(),
            longDescription: Faker.lorem.paragraph(),
            item_category_id: generateParams.categoryId,
            itemLocation,
            shippingDestinations,
            itemImages
        } as ItemInformationCreateRequest;

        return itemInformationCreateRequest;
    }

    private async generatePaymentInformationData(generateParams: GenerateListingItemParams | GenerateListingItemTemplateParams):
        Promise<PaymentInformationCreateRequest> {

        // this.log.debug('generateParams: ', JSON.stringify(generateParams, null, 2));

        const address = Faker.finance.bitcoinAddress();
/*
        // todo: fix bid send test data generation
        if (generateParams.soldOnMarketId) {
            address = await this.marketService.findOne(generateParams.soldOnMarketId).then(async value => {
                const market: resources.Market = value.toJSON();
                return (await this.coreRpcService.getNewStealthAddress(market.Identity.wallet)).address;
            });
        } else {
            address = Faker.finance.bitcoinAddress();
        }
*/
        const escrow = generateParams.generateEscrow
            ? {
                type: EscrowType.MAD_CT, // Faker.random.arrayElement(Object.getOwnPropertyNames(EscrowType)),
                ratio: {
                    buyer: 100,     // _.random(1, 100),
                    seller: 100     // _.random(1, 100)
                } as EscrowRatioCreateRequest,
                releaseType: EscrowReleaseType.ANON
            } as EscrowCreateRequest
            : undefined;

        const itemPrice = generateParams.generateItemPrice
            ? {
                currency: Cryptocurrency.PART, // Faker.random.arrayElement(Object.getOwnPropertyNames(Currency)),
                // todo:
                basePrice: toSatoshis(+_.random(0.001, 0.05).toFixed(8)),
                shippingPrice: {
                    domestic: toSatoshis(+_.random(0.001, 0.05).toFixed(8)),
                    international: toSatoshis(+_.random(0.001, 0.05).toFixed(8))
                } as ShippingPriceCreateRequest,
                cryptocurrencyAddress: {
                    type: CryptoAddressType.STEALTH,
                    address
                } as CryptocurrencyAddressCreateRequest
            } as ItemPriceCreateRequest
            : undefined;

        const paymentInformationCreateRequest = {
            type: SaleType.SALE, // Faker.random.arrayElement(Object.getOwnPropertyNames(SaleType)),
            escrow,
            itemPrice
        } as PaymentInformationCreateRequest;

        return paymentInformationCreateRequest;
    }

    private generateMessagingInformationData(): MessagingInformationCreateRequest[] {

        const messagingInformations: MessagingInformationCreateRequest[] = [{
            protocol: MessagingProtocol.SMSG,
            publicKey: 'pubkey-testdata'                     // todo: sellers pubkey should be added here
        }] as MessagingInformationCreateRequest[];
        return messagingInformations;
    }

    // todo: fix, old and doesnt pass validation anymore
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

        let profileId;

        // this.log.debug('generateListingItemTemplateData(), generateParams: ', JSON.stringify(generateParams, null, 2));
        if (generateParams.generateListingItem) {
            const sellerMarket: resources.Market = await this.marketService.findOne(generateParams.soldOnMarketId).then(value => value.toJSON());
            profileId = sellerMarket.Profile.id;
        } else {
            profileId = generateParams.profileId;
        }

        // this.log.debug('generateListingItemTemplateData(), profileId: ', JSON.stringify(profileId, null, 2));

        const itemInformation = generateParams.generateItemInformation ? await this.generateItemInformationData(generateParams) : {};
        // this.log.debug('generateListingItemTemplateData(), itemInformation: ', JSON.stringify(itemInformation, null, 2));
        const paymentInformation = generateParams.generatePaymentInformation ? await this.generatePaymentInformationData(generateParams) : {};
        // this.log.debug('generateListingItemTemplateData(), paymentInformation: ', JSON.stringify(paymentInformation, null, 2));
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        // this.log.debug('generateListingItemTemplateData(), messagingInformation: ', JSON.stringify(messagingInformation, null, 2));
        const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];
        // this.log.debug('generateListingItemTemplateData(), listingItemObjects: ', JSON.stringify(listingItemObjects, null, 2));

        const listingItemTemplateCreateRequest = {
            generatedAt: +Date.now(),
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            profile_id: profileId
        } as ListingItemTemplateCreateRequest;

        // this.log.debug('generateListingItemTemplateData(), listingItemTemplateCreateRequest: ', JSON.stringify(listingItemTemplateCreateRequest, null, 2));

        return listingItemTemplateCreateRequest;
    }

    // -------------------
    // SmsgMessages
    private async generateSmsgMessages(amount: number, withRelated: boolean = true,
                                       generateParams: GenerateSmsgMessageParams): Promise<resources.SmsgMessage[]> {

        this.log.debug('generateSmsgMessages, generateParams: ', JSON.stringify(generateParams, null, 2));

        const items: resources.SmsgMessage[] = [];

        for (let i = amount; i > 0; i--) {
            const smsgMessageCreateRequest: SmsgMessageCreateRequest = await this.generateSmsgMessageData(generateParams);
            this.log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
            const smsgMessage: resources.SmsgMessage = await this.smsgMessageService.create(smsgMessageCreateRequest).then(value => value.toJSON());
            items.push(smsgMessage);
        }

        return this.generateResponse(items, withRelated);
    }

    private async generateSmsgMessageData(generateParams: GenerateSmsgMessageParams): Promise<SmsgMessageCreateRequest> {

        const from = generateParams.from;
        const to = generateParams.to;

        const target = Faker.finance.bitcoinAddress();
        const msgid = Faker.random.uuid();

        let action: ActionMessageInterface;

        let text: string;

        if (generateParams.text) {
            text = generateParams.text;
        } else {
            switch (generateParams.type) {
                case MPAction.MPA_LISTING_ADD: {
                    const marketplaceMessage = await this.listingItemAddMessageFactory.get(generateParams.messageParams);
                    action = marketplaceMessage.action;
                    break;
                }
                case MPAction.MPA_BID: {
                    throw new MessageException('Not implemented');
                }
                case GovernanceAction.MPA_PROPOSAL_ADD: {
                    throw new MessageException('Not implemented');
                }
                case GovernanceAction.MPA_VOTE: {
                    throw new MessageException('Not implemented');
                }
                case CommentAction.MPA_COMMENT_ADD: {
                    throw new MessageException('Not implemented');
                }
                default: {
                    throw new MessageException('Not implemented');
                }
            }

            text = JSON.stringify({
                version: ompVersion(),
                action
            } as MarketplaceMessage);
        }

        const smsgMessageCreateRequest = {
            type: generateParams.type,
            status: generateParams.status,
            direction: generateParams.direction,
            read: generateParams.read,
            paid: generateParams.paid,
            received: generateParams.received,
            sent: generateParams.sent,
            expiration: generateParams.expiration,
            daysretention: generateParams.daysretention,
            from,
            to,
            text,
            target,
            msgid,
            version: '0201',
            payloadsize: Faker.random.number(1000)
        } as SmsgMessageCreateRequest;

        return smsgMessageCreateRequest;
    }

    // -------------------
    // Blacklists

    private async generateBlacklists(
        amount: number, withRelated: boolean = true,
        generateParams: GenerateBlacklistParams): Promise<resources.Blacklist[]> {

        // this.log.debug('generateBlacklists, generateParams: ', generateParams);

        const items: resources.Blacklist[] = [];

        for (let i = amount; i > 0; i--) {
            const blacklistCreateRequest = await this.generateBlacklistData(generateParams);
            const blacklist: resources.Blacklist = await this.blacklistService.create(blacklistCreateRequest).then(value => value.toJSON());
            items.push(blacklist);
        }

        return this.generateResponse(items, withRelated);
    }

    private async generateBlacklistData(generateParams: GenerateBlacklistParams): Promise<BlacklistCreateRequest> {

        const type = generateParams.type ? generateParams.type : Faker.random.arrayElement(Object.getOwnPropertyNames(BlacklistType));
        const blacklistCreateRequest = {
            type,
            target: Faker.random.uuid()
        } as BlacklistCreateRequest;

        return blacklistCreateRequest;
    }

}
