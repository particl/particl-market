// Copyright (c) 2017-2019, The Particl Market developers
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
import { BidDataCreateRequest } from '../requests/model/BidDataCreateRequest';
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
import { ItemCategoryUpdateRequest } from '../requests/model/ItemCategoryUpdateRequest';
import { SettingCreateRequest } from '../requests/model/SettingCreateRequest';
import { ItemVote } from '../enums/ItemVote';
import { ShippingDestinationCreateRequest } from '../requests/model/ShippingDestinationCreateRequest';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { EscrowType, HashableBidField, MessagingProtocol, MPAction, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
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
import { ListingItemAddMessageFactory } from '../factories/message/ListingItemAddMessageFactory';
import { ListingItemAddMessageCreateParams } from '../requests/message/ListingItemAddMessageCreateParams';
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
        @inject(Types.Service) @named(Targets.Service.action.ProposalAddActionService) private proposalAddActionService: ProposalAddActionService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) private voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.model.OrderFactory) private orderFactory: OrderFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemAddMessageFactory) private listingItemAddMessageFactory: ListingItemAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
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
            // seed the default Profile
            const defaultProfile: resources.Profile = await this.defaultProfileService.seedDefaultProfile()
                .then(value => value.toJSON())
                .catch( reason => {
                    this.log.debug('failed seeding default profile: ' + reason);
                });

            await this.defaultSettingService.saveDefaultProfileSettings(defaultProfile);

            // seed the default market
            const defaultMarket: resources.Market = await this.defaultMarketService.seedDefaultMarket(defaultProfile)
                .then(value => value.toJSON())
                .catch( reason => {
                    this.log.debug('failed seeding default market: ' + reason);
                });

            // seed the default categories
            await this.defaultItemCategoryService.seedDefaultCategories(defaultMarket.receiveAddress)
                .catch( reason => {
                    this.log.debug('failed seeding default categories: ' + reason);
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
            default: {
                throw new MessageException('Not implemented');
            }
        }
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
     * clean up the db
     *
     * @returns {Promise<void>}
     */
    private async cleanDb(): Promise<void> {

        // by default ignore these
        this.log.info('cleaning up the db, ignoring tables: ', this.ignoreTables);
        this.log.debug('ignoreTables: ', this.ignoreTables);

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
            'profiles',
            'shopping_cart_item',
            'shopping_cart',
            'item_categories',
            'markets',
            'wallets',
            'settings',
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

            // this.log.debug('listingItemTemplateCreateRequest:', JSON.stringify(listingItemTemplateCreateRequest, null, 2));

            let listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.create(listingItemTemplateCreateRequest)
                .then(value => value.toJSON());

            // this.log.debug('created listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));
            // this.log.debug('created listingItemTemplate, hash: ', listingItemTemplate.hash);
            // this.log.debug('generateParams.generateListingItem: ', generateParams.generateListingItem);

            // generate a ListingItem with the same data
            if (generateParams.generateListingItem) {

                this.log.debug('listingItemTemplate.Profile.id: ', listingItemTemplate.Profile.id);
                const market: resources.Market = generateParams.marketId === undefined || generateParams.marketId === null
                    ? await this.marketService.getDefaultForProfile(listingItemTemplate.Profile.id).then(value => value.toJSON())
                    : await this.marketService.findOne(generateParams.marketId).then(value => value.toJSON());

                const listingItemCreateRequest = {
                    seller: listingItemTemplate.Profile.address,
                    market: market.receiveAddress,
                    listing_item_template_id: listingItemTemplate.id,
                    itemInformation: listingItemTemplateCreateRequest.itemInformation,
                    paymentInformation: listingItemTemplateCreateRequest.paymentInformation,
                    messagingInformation: listingItemTemplateCreateRequest.messagingInformation,
                    listingItemObjects: listingItemTemplateCreateRequest.listingItemObjects,
                    msgid: '' + new Date().getTime(),
                    expiryTime: 10,
                    postedAt: new Date().getTime(),
                    expiredAt: new Date().getTime() + 60 * 1000 * 60 * 24 * 10,
                    receivedAt: new Date().getTime(),
                    generatedAt: listingItemTemplateCreateRequest.generatedAt
                } as ListingItemCreateRequest;

                listingItemCreateRequest.hash = ConfigurableHasher.hash(listingItemCreateRequest, new HashableListingItemTemplateCreateRequestConfig());

                // this.log.debug('listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

                const listingItem: resources.ListingItem = await this.listingItemService.create(listingItemCreateRequest)
                    .then(value => value.toJSON());
                // this.log.debug('listingItem:', JSON.stringify(listingItem, null, 2));
                // this.log.debug('created listingItem, hash: ', listingItem.hash);

                listingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplate.id).then(value => value.toJSON());

            }
            items.push(listingItemTemplate);
        }
        this.log.debug('generated ' + items.length + ' listingItemTemplates');
        return await this.generateResponse(items, withRelated);
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
            // const market: resources.Market = await this.marketService.getDefaultForProfile().then(value => value.toJSON());

            this.log.debug('create listingitem start');
            const savedListingItem: resources.ListingItem = await this.listingItemService.create(listingItemCreateRequest)
                .then(value => value.toJSON());
            // TODO: make this optional/configurable
            const savedSmsgMessage: resources.SmsgMessage = await this.createListingItemSmsgMessage(savedListingItem);
            this.log.debug('create listingitem end');

            items.push(savedListingItem);
        }
        // this.log.debug('items: ', items);

        this.log.debug('generateListingItems end');

        return await this.generateResponse(items, withRelated);
    }

    private async createListingItemSmsgMessage(listingItem: resources.ListingItem): Promise<resources.SmsgMessage> {

        const listingItemAddMessage: ListingItemAddMessage = await this.listingItemAddMessageFactory.get({
            listingItem
        } as ListingItemAddMessageCreateParams);

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

        this.log.debug('generateBids, generateParams: ', generateParams);
        const listingItemTemplateGenerateParams = new GenerateListingItemTemplateParams();
        const listingItemGenerateParams = new GenerateListingItemParams();

        // TODO: implement listingitem and template generation

        /*
        const listingItemTemplateGenerateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            false,   // generateMessagingInformation
            false,   // generateListingItemObjects
            false,   // generateObjectDatas
            generateParams.listingItemSeller, // profileId
            false,   // generateListingItem
            0,       // marketId
            0       // categoryId
        ]).toParamsArray();

        const listingItemGenerateParams = new GenerateListingItemParams([
            true,                               // generateItemInformation
            true,                               // generateItemLocation
            true,                               // generateShippingDestinations
            false,                              // generateItemImages
            true,                               // generatePaymentInformation
            true,                               // generateEscrow
            true,                               // generateItemPrice
            true,                               // generateMessagingInformation
            true,                               // generateListingItemObjects
            false,                              // generateObjectDatas
            createdListingItemTemplate.hash,    // listingItemTemplateHash
            sellerProfile.address               // seller
        ]).toParamsArray();
*/

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
            listingItemGenerateParams.seller = generateParams.listingItemSeller ? generateParams.listingItemSeller : '';

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
            const bidCreateRequest = await this.generateBidData(generateParams);
            const result: resources.Bid = await this.bidService.create(bidCreateRequest).then(value => value.toJSON());
            items.push(result);
        }

        // this.log.debug('bids:', JSON.stringify(items, null, 2));

        return this.generateResponse(items, withRelated);
    }

    private async generateBidData(generateParams: GenerateBidParams): Promise<BidCreateRequest> {

        const bidder = generateParams.bidder ? generateParams.bidder : await this.coreRpcService.getNewAddress();
        const type = generateParams.type ? generateParams.type : MPAction.MPA_BID;

        // TODO: generate biddatas
        const bidDatas = [
            {key: 'size', value: 'XL'},
            {key: 'color', value: 'pink'}
        ] as BidDataCreateRequest[];

        const bidCreateRequest = {
            parent_bid_id: generateParams.parentBidId,
            type,
            bidder,
            bidDatas,
            generatedAt: +new Date().getTime(),
            msgid: Faker.random.uuid()
        } as BidCreateRequest;

        if (MPAction.MPA_BID === type) {
            const addresses = await this.generateAddressesData(1);
            // this.log.debug('Generated addresses = ' + JSON.stringify(addresses, null, 2));
            const address = addresses[0];

            // TODO: defaultProfile might not be the correct one
            const defaultProfile: resources.Profile = await this.profileService.getDefault().then(value => value.toJSON());
            address.profile_id = defaultProfile.id;
            bidCreateRequest.address = address;
        }

        bidCreateRequest.hash = ConfigurableHasher.hash(bidCreateRequest, new HashableBidCreateRequestConfig([{
            value: generateParams.listingItemHash,
            to: HashableBidField.ITEM_HASH
        }, {
            value: EscrowType.MULTISIG,
            to: HashableBidField.PAYMENT_ESCROW_TYPE
        }, {
            value: Cryptocurrency.PART,
            to: HashableBidField.PAYMENT_CRYPTO
        }]));

        // if we have a hash, fetch the listingItem and set the relation
        if (generateParams.listingItemHash) {
            const listingItemModel = await this.listingItemService.findOneByHash(generateParams.listingItemHash);
            const listingItem = listingItemModel ? listingItemModel.toJSON() : null;
            if (listingItem) {
                bidCreateRequest.listing_item_id = listingItem.id;
            }
        }

        this.log.debug('bidCreateRequest: ' + JSON.stringify(bidCreateRequest, null, 2));

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
            this.log.debug('generating Bid...');

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

            // set the bid_id for order generation
            generateParams.bidId = bid.id;

        } else {
            bid = await this.bidService.findOne(generateParams.bidId).then(value => value.toJSON());
        }

        const items: resources.Order[] = [];
        for (let i = amount; i > 0; i--) {
            const orderCreateRequest = await this.generateOrderData(generateParams);

            this.log.debug('orderCreateRequest:', JSON.stringify(orderCreateRequest, null, 2));
            const result: resources.Order = await this.orderService.create(orderCreateRequest).then(value => value.toJSON());
            items.push(result);
        }

        return this.generateResponse(items, withRelated);
    }

    private async generateOrderData(generateParams: GenerateOrderParams): Promise<OrderCreateRequest> {

        this.log.debug('generateOrderData, generateParams: ', generateParams);

        // get the bid
        const bid: resources.Bid = await this.bidService.findOne(generateParams.bidId).then(value => value.toJSON());

        // then generate ordercreaterequest with some orderitems
        const orderCreateParams = {
            bids: [bid],
            addressId: bid.ShippingAddress.id,
            status: OrderStatus.PROCESSING,
            buyer: bid.bidder,
            seller: bid.ListingItem.seller,
            generatedAt: +new Date().getTime()
        } as OrderCreateParams;

        const orderCreateRequest = await this.orderFactory.get(orderCreateParams);

        if (!generateParams.generateOrderItem) {
            orderCreateRequest.orderItems = [];
        }
        return orderCreateRequest;
    }

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

            this.log.debug('proposalCreateRequest: ', JSON.stringify(proposalCreateRequest, null, 2));
            let proposal: resources.Proposal = await this.proposalService.create(proposalCreateRequest).then(value => value.toJSON());

            this.log.debug('generating ' + generateParams.voteCount + ' votes...');
            if (generateParams.voteCount > 0) {
                const votes = await this.generateVotesForProposal(generateParams.voteCount, proposal);
            }

            // create and update ProposalResult
            let proposalResult = await this.proposalService.createEmptyProposalResult(proposal);
            proposalResult = await this.proposalService.recalculateProposalResult(proposal, true);
            this.log.debug('updated proposalResult: ', JSON.stringify(proposalResult, null, 2));

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
            : _.random(currentTime, currentTime + 1, false);

        const timeEnd = generateParams.generatePastProposal
            ? _.random((currentTime / 2) + 100, currentTime - 1000, false)
            : _.random(currentTime + 1000000, currentTime + 2000000, false);

        // this.log.debug('generateParams.generatePastProposal: ', generateParams.generatePastProposal);
        // this.log.debug('currentblock: ', currentblock);
        // this.log.debug('blockStart: ', blockStart);
        // this.log.debug('blockEnd: ', blockEnd);

        const options: ProposalOptionCreateRequest[] = [];
        options.push({
            optionId: 0,
            description: ItemVote.KEEP.toString()
        } as ProposalOptionCreateRequest);
        options.push({
            optionId: 1,
            description: ItemVote.REMOVE.toString()
        } as ProposalOptionCreateRequest);

        const proposalCreateRequest = {
            submitter,
            category,
            item,
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

        this.log.debug('generateComments, generateParams: ', generateParams);

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

        const defaultProfile = await this.profileService.getDefault();

        let sender;
        if (!generateParams.sender) {
            const profile = defaultProfile.toJSON();
            sender = profile.address;
        } else {
            sender = generateParams.sender;
        }

        let receiver;
        if (!generateParams.receiver) {
            const defaultMarket = await this.marketService.getDefaultForProfile(defaultProfile.id);
            const market = defaultMarket.toJSON();
            receiver = market.receiveAddress;
        } else {
            receiver = generateParams.sender;
        }

        const target = generateParams.target;

        const type = generateParams.type || CommentType.LISTINGITEM_QUESTION_AND_ANSWERS;

        const currentTime = new Date().getTime();

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
            sender,
            receiver,
            type,
            target,
            message: Faker.lorem.lines(1),
            parentCommentId: null,
            ...smsgData
        } as CommentCreateRequest;

        commentCreateRequest.hash = ConfigurableHasher.hash(commentCreateRequest, new HashableCommentCreateRequestConfig());

        return commentCreateRequest;
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
            settings.push({
                key: SettingValue.DEFAULT_MARKETPLACE_NAME.toString(),
                value: process.env[SettingValue.DEFAULT_MARKETPLACE_NAME]
            } as SettingCreateRequest);
            settings.push({
                key: SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY.toString(),
                value: process.env[SettingValue.DEFAULT_MARKETPLACE_PRIVATE_KEY]
            } as SettingCreateRequest);
            settings.push({
                key: SettingValue.DEFAULT_MARKETPLACE_ADDRESS.toString(),
                value: process.env[SettingValue.DEFAULT_MARKETPLACE_ADDRESS]
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
        const defaultMarket: resources.Market = await this.marketService.getDefaultForProfile(defaultProfile.id)
            .then(value => value.toJSON());

        // set seller to given address or get a new one
        const seller = generateParams.seller ? generateParams.seller : await this.coreRpcService.getNewAddress();

        const itemInformation = generateParams.generateItemInformation ? await this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? await this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];

        const listingItemCreateRequest = {
            seller,
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            market: defaultMarket.receiveAddress,
            msgid: '' + new Date().getTime(),
            expiryTime: 4,
            postedAt: new Date().getTime(),
            expiredAt: new Date().getTime() + 100000000,
            receivedAt: new Date().getTime(),
            generatedAt: new Date().getTime()
        } as ListingItemCreateRequest;

        listingItemCreateRequest.hash = ConfigurableHasher.hash(listingItemCreateRequest, new HashableListingItemTemplateCreateRequestConfig());

        // this.log.debug('listingItemCreateRequest: ', JSON.stringify(listingItemCreateRequest, null, 2));

        // fetch listingItemTemplate if hash was given and set the listing_item_template_id
        if (generateParams.listingItemTemplateHash) {
            const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService
                .findOneByHash(generateParams.listingItemTemplateHash)
                .then(value => value.toJSON());
            listingItemCreateRequest.listing_item_template_id = listingItemTemplate.id;
            listingItemCreateRequest.hash = listingItemTemplate.hash;
        }

        this.log.debug('generateParams.listingItemTemplateHash: ', generateParams.listingItemTemplateHash);
        // this.log.debug('listingItemCreateRequest: ', JSON.stringify(listingItemCreateRequest, null, 2));
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
                type: EscrowType.MAD_CT, // Faker.random.arrayElement(Object.getOwnPropertyNames(EscrowType)),
                ratio: {
                    buyer: 100,     // _.random(1, 100),
                    seller: 100     // _.random(1, 100)
                } as EscrowRatioCreateRequest
            } as EscrowCreateRequest
            : undefined;

        const itemPrice = generateParams.generateItemPrice
            ? {
                currency: Cryptocurrency.PART, // Faker.random.arrayElement(Object.getOwnPropertyNames(Currency)),
                // todo:
                basePrice: toSatoshis(+_.random(0.1, 1.00).toFixed(8)),
                shippingPrice: {
                    domestic: toSatoshis(+_.random(0.01, 0.10).toFixed(8)),
                    international: toSatoshis(+_.random(0.10, 0.20).toFixed(8))
                } as ShippingPriceCreateRequest,
                cryptocurrencyAddress: {
                    type: CryptoAddressType.STEALTH,
                    address: (await this.coreRpcService.getNewStealthAddress()).address
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
        const itemInformation = generateParams.generateItemInformation ? await this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? await this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];

        // todo: use undefined
        const profile: resources.Profile = generateParams.profileId === null || generateParams.profileId === undefined
            ? await this.profileService.getDefault().then(value => value.toJSON())
            : await this.profileService.findOne(generateParams.profileId).then(value => value.toJSON());

        const listingItemTemplateCreateRequest = {
            generatedAt: +new Date().getTime(),
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            profile_id: profile.id
        } as ListingItemTemplateCreateRequest;

        this.log.debug('listingItemTemplateCreateRequest', JSON.stringify(listingItemTemplateCreateRequest, null, 2));
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

    // -------------------
    // SmsgMessages
    private async generateSmsgMessages(
        amount: number, withRelated: boolean = true,
        generateParams: GenerateSmsgMessageParams): Promise<resources.SmsgMessage[]> {

        this.log.debug('generateSmsgMessages, generateParams: ', generateParams);

        const items: resources.SmsgMessage[] = [];

        for (let i = amount; i > 0; i--) {
            const smsgMessageCreateRequest = await this.generateSmsgMessageData(generateParams);
            const smsgMessage: resources.SmsgMessage = await this.smsgMessageService.create(smsgMessageCreateRequest).then(value => value.toJSON());
            items.push(smsgMessage);
        }

        return this.generateResponse(items, withRelated);
    }

    private async generateSmsgMessageData(generateParams: GenerateSmsgMessageParams): Promise<SmsgMessageCreateRequest> {

        const defaultProfile = await this.profileService.getDefault();

        let from: string;
        if (!generateParams.from) {
            const profile = defaultProfile.toJSON();
            from = profile.address;
        } else {
            from = generateParams.from;
        }

        let to;
        if (!generateParams.to) {
            const market: resources.Market = await this.marketService.getDefaultForProfile(defaultProfile.id).then(value => value.toJSON());
            to = market.receiveAddress;
        } else {
            to = generateParams.to;
        }

        const target = Faker.finance.bitcoinAddress();
        const msgid = Faker.random.uuid();

        let action: ActionMessageInterface;

        let text: string;

        if (generateParams.text) {
            text = generateParams.text;
        } else {
            switch (generateParams.type) {
                case MPAction.MPA_LISTING_ADD: {
                    action = await this.listingItemAddMessageFactory.get(generateParams.messageParams as ListingItemAddMessageCreateParams);
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
            payloadsize: 500
        } as SmsgMessageCreateRequest;

        return smsgMessageCreateRequest;
    }

}
