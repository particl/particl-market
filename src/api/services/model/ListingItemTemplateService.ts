// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { ListingItemTemplateRepository } from '../../repositories/ListingItemTemplateRepository';
import { ListingItemTemplateSearchParams } from '../../requests/search/ListingItemTemplateSearchParams';
import { ListingItemTemplateCreateRequest } from '../../requests/model/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../../requests/model/ListingItemTemplateUpdateRequest';
import { ItemInformationCreateRequest } from '../../requests/model/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../../requests/model/ItemInformationUpdateRequest';
import { PaymentInformationCreateRequest } from '../../requests/model/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../../requests/model/PaymentInformationUpdateRequest';
import { MessagingInformationCreateRequest } from '../../requests/model/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../../requests/model/MessagingInformationUpdateRequest';
import { ListingItemObjectCreateRequest } from '../../requests/model/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../../requests/model/ListingItemObjectUpdateRequest';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { ImageProcessing } from '../../../core/helpers/ImageProcessing';
import { ItemImageDataCreateRequest } from '../../requests/model/ItemImageDataCreateRequest';
import { MessageSize } from '../../responses/MessageSize';
import { ListingItemFactory } from '../../factories/model/ListingItemFactory';
import { ImageFactory } from '../../factories/ImageFactory';
import { ItemImage } from '../../models/ItemImage';
import {EscrowType, ompVersion} from 'omp-lib/dist/omp';
import { ListingItemAddMessageFactory } from '../../factories/message/ListingItemAddMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { ItemInformationService } from './ItemInformationService';
import { ItemImageDataService } from './ItemImageDataService';
import { ItemImageService } from './ItemImageService';
import { PaymentInformationService } from './PaymentInformationService';
import { MessagingInformationService } from './MessagingInformationService';
import { ListingItemObjectService } from './ListingItemObjectService';
import { ListingItemAddMessageCreateParams } from '../../requests/message/ListingItemAddMessageCreateParams';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import {CryptoAddressType} from 'omp-lib/dist/interfaces/crypto';

export class ListingItemTemplateService {

    public static MAX_SMSG_SIZE = 524288;  // https://github.com/particl/particl-core/blob/master/src/smsg/smessage.h#L78

    private static IMG_BOUNDING_WIDTH = 600;
    private static IMG_BOUNDING_HEIGHT = 600;
    private static FRACTION_LOWEST_COMPRESSION = 0.8;

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemTemplateRepository) public listingItemTemplateRepo: ListingItemTemplateRepository,
        @inject(Types.Service) @named(Targets.Service.model.ItemInformationService) public itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageService) public itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.model.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.model.MessagingInformationService) public messagingInformationService: MessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemObjectService) public listingItemObjectService: ListingItemObjectService,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemFactory) private listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemAddMessageFactory) private listingItemAddMessageFactory: ListingItemAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.ImageFactory) private imageFactory: ImageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return this.listingItemTemplateRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemTemplate> {
        const listingItemTemplate = await this.listingItemTemplateRepo.findOne(id, withRelated);
        if (listingItemTemplate === null) {
            this.log.warn(`ListingItemTemplate with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItemTemplate;
    }

    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItemTemplate>}
     */
    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<ListingItemTemplate> {
        const listingItemTemplate = await this.listingItemTemplateRepo.findOneByHash(hash, withRelated);
        if (listingItemTemplate === null) {
            this.log.warn(`ListingItemTemplate with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return listingItemTemplate;
    }

    /**
     * searchBy ListingItemTemplates using given ListingItemTemplateSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemTemplate>>}
     */
    @validate()
    public async search(
        @request(ListingItemTemplateSearchParams) options: ListingItemTemplateSearchParams): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return await this.listingItemTemplateRepo.search(options);
    }

    @validate()
    public async create( @request(ListingItemTemplateCreateRequest) data: ListingItemTemplateCreateRequest): Promise<ListingItemTemplate> {
        // this.log.debug('listingItemTemplate, data:', JSON.stringify(data, null, 2));
        const body: ListingItemTemplateCreateRequest = JSON.parse(JSON.stringify(data));

        // extract and remove related models from request
        const itemInformation = body.itemInformation;
        delete body.itemInformation;
        const paymentInformation = body.paymentInformation;
        delete body.paymentInformation;
        const messagingInformation = body.messagingInformation || [];
        delete body.messagingInformation;
        const listingItemObjects = body.listingItemObjects || [];
        delete body.listingItemObjects;

        // then create the listingItemTemplate
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateRepo.create(body)
            .then(value => value.toJSON());

        // create related models
        if (!_.isEmpty(itemInformation)) {
            itemInformation.listing_item_template_id = listingItemTemplate.id;
            const createdItemInfo: resources.ItemInformation = await this.itemInformationService.create(itemInformation)
                .then(value => value.toJSON());
            // this.log.debug('itemInformation, result:', JSON.stringify(result, null, 2));
        }

        if (!_.isEmpty(paymentInformation)) {
            paymentInformation.listing_item_template_id = listingItemTemplate.id;
            const createdPaymentInfo: resources.PaymentInformation = await this.paymentInformationService.create(paymentInformation)
                .then(value => value.toJSON());
            // this.log.debug('paymentInformation, result:', JSON.stringify(result, null, 2));
        }

        if (!_.isEmpty(messagingInformation)) {
            for (const msgInfo of messagingInformation) {
                msgInfo.listing_item_template_id = listingItemTemplate.id;
                const createdMsgInfo: resources.MessagingInformation = await this.messagingInformationService.create(msgInfo)
                    .then(value => value.toJSON());
                // this.log.debug('msgInfo, result:', JSON.stringify(result, null, 2));
            }
        }

        if (!_.isEmpty(listingItemObjects)) {
            for (const object of listingItemObjects) {
                object.listing_item_template_id = listingItemTemplate.id;
                const createdListingItemObject: resources.ListingItemObject = await this.listingItemObjectService.create(object)
                    .then(value => value.toJSON());
                // this.log.debug('object, result:', JSON.stringify(result, null, 2));
            }
        }

        return await this.findOne(listingItemTemplate.id);
    }

    @validate()
    public async update(id: number, @request(ListingItemTemplateUpdateRequest) data: ListingItemTemplateUpdateRequest): Promise<ListingItemTemplate> {
        const body = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const listingItemTemplate = await this.findOne(id, false);

        // ListingItemTemplates with a hash are not supposed to be modified anymore
        if (!_.isEmpty(listingItemTemplate.Hash) || !_.isEmpty(listingItemTemplate.ListingItems)) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        // update listingItemTemplate record
        const updatedListingItemTemplate = await this.listingItemTemplateRepo.update(id, listingItemTemplate.toJSON());

        // if the related one exists already, then update. if it doesnt exist, create. and if the related one is missing, then remove.
        let itemInformation = updatedListingItemTemplate.related('ItemInformation').toJSON() || {};

        if (!_.isEmpty(body.itemInformation)) {
            if (!_.isEmpty(itemInformation)) {
                const itemInformationId = itemInformation.id;
                itemInformation = body.itemInformation;
                itemInformation.listing_item_template_id = id;
                await this.itemInformationService.update(itemInformationId, itemInformation as ItemInformationUpdateRequest);
            } else {
                itemInformation = body.itemInformation;
                itemInformation.listing_item_template_id = id;
                await this.itemInformationService.create(itemInformation as ItemInformationCreateRequest);
            }
        } else if (!_.isEmpty(itemInformation)) {
            await this.itemInformationService.destroy(itemInformation.id);
        }

        // payment-information
        let paymentInformation = updatedListingItemTemplate.related('PaymentInformation').toJSON() || {};

        if (!_.isEmpty(body.paymentInformation)) {
            if (!_.isEmpty(paymentInformation)) {
                const paymentInformationId = paymentInformation.id;
                paymentInformation = body.paymentInformation;
                paymentInformation.listing_item_template_id = id;
                await this.paymentInformationService.update(paymentInformationId, paymentInformation as PaymentInformationUpdateRequest);
            } else {
                paymentInformation = body.paymentInformation;
                paymentInformation.listing_item_template_id = id;
                await this.paymentInformationService.create(paymentInformation as PaymentInformationCreateRequest);
            }
        } else if (!_.isEmpty(paymentInformation)) {
            await this.paymentInformationService.destroy(paymentInformation.id);
        }

        // find related record and delete it and recreate related data
        const existintMessagingInformation = updatedListingItemTemplate.related('MessagingInformation').toJSON() || [];

        const newMessagingInformation = body.messagingInformation || [];

        // delete MessagingInformation if not exist with new params
        for (const msgInfo of existintMessagingInformation) {
            if (!await this.checkExistingObject(newMessagingInformation, 'id', msgInfo.id)) {
                await this.messagingInformationService.destroy(msgInfo.id);
            }
        }

        // update or create messaging itemInformation
        for (const msgInfo of newMessagingInformation) {
            msgInfo.listing_item_template_id = id;
            const message = await this.checkExistingObject(existintMessagingInformation, 'id', msgInfo.id);
            delete msgInfo.id;
            if (message) {
                message.protocol = msgInfo.protocol;
                message.publicKey = msgInfo.publicKey;
                await this.messagingInformationService.update(message.id, msgInfo as MessagingInformationUpdateRequest);
            } else {
                await this.messagingInformationService.create(msgInfo as MessagingInformationCreateRequest);
            }
        }

        const newListingItemObjects = body.listingItemObjects || [];
        // find related listingItemObjects
        const existingListingItemObjects = updatedListingItemTemplate.related('ListingItemObjects').toJSON() || [];

        // find highestOrderNumber
        const highestOrderNumber = await this.findHighestOrderNumber(newListingItemObjects);

        const objectsToBeUpdated = [] as any;
        for (const object of existingListingItemObjects) {
            // check if order number is greter than highestOrderNumber then delete
            if (object.order > highestOrderNumber) {
                await this.listingItemObjectService.destroy(object.id);
            } else {
                objectsToBeUpdated.push(object);
            }
        }

        // create or update listingItemObjects
        for (const object of newListingItemObjects) {
            object.listing_item_template_id = id;
            const itemObject = await this.checkExistingObject(objectsToBeUpdated, 'order', object.order);

            if (itemObject) {
                await this.listingItemObjectService.update(itemObject.id, object as ListingItemObjectUpdateRequest);
            } else {
                await this.listingItemObjectService.create(object as ListingItemObjectCreateRequest);
            }
        }

        // finally find and return the updated listingItem
        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {
        const listingItemTemplate: resources.ListingItemTemplate = await this.findOne(id).then(value => value.toJSON());

        if (!_.isEmpty(listingItemTemplate.ListingItems)) {
            throw new MessageException('ListingItemTemplate has ListingItems.');
        }

        this.log.debug('deleting listingItemTemplate:', listingItemTemplate.id);
        await this.listingItemTemplateRepo.destroy(id);
    }

    public async updateHash(id: number, hash: string): Promise<ListingItemTemplate> {
        const listingItemTemplate = await this.findOne(id, false);
        listingItemTemplate.Hash = hash;
        const updated = await this.listingItemTemplateRepo.update(id, listingItemTemplate.toJSON());
        this.log.debug('updated ListingItemTemplate ' + id + ' hash to: ' + updated.Hash);
        return updated;
    }

    public async isModifiable(id: number): Promise<boolean> {
        const listingItemTemplate: resources.ListingItemTemplate = await this.findOne(id, true)
            .then(value => value.toJSON());

        // ListingItemTemplates which have a related ListingItems or ChildListingItems can not be modified
        // this.log.debug('listingItemTemplate.ListingItems: ' + listingItemTemplate.ListingItems);
        // this.log.debug('listingItemTemplate.ChildListingItemTemplate: ' + listingItemTemplate.ChildListingItemTemplate);

        const isModifiable = (_.isEmpty(listingItemTemplate.ListingItems) && _.isEmpty(listingItemTemplate.ChildListingItemTemplate));

        this.log.debug('isModifiable: ' + isModifiable);
        return isModifiable;
    }

    /**
     * creates resized versions of the template images, so that all of them fit in one smsgmessage
     *
     * @param {"resources".ListingItemTemplate} listingItemTemplate
     * @returns {Promise<"resources".ListingItemTemplate>}
     */
    public async createResizedTemplateImages(listingItemTemplate: resources.ListingItemTemplate): Promise<ListingItemTemplate> {
        const startTime = new Date().getTime();

        // ItemInformation has ItemImages, which is an array.
        const itemImages = listingItemTemplate.ItemInformation.ItemImages;
        const originalImageDatas: resources.ItemImageData[] = [];

        for (const itemImage of itemImages) {
            const itemImageDataOriginal: resources.ItemImageData | undefined = _.find(itemImage.ItemImageDatas, (imageData) => {
                return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
            });
            const itemImageDataResized: resources.ItemImageData | undefined = _.find(itemImage.ItemImageDatas, (imageData) => {
                return imageData.imageVersion === ImageVersions.RESIZED.propName;
            });

            if (!itemImageDataOriginal) {
                // there's something wrong with the ItemImage if original image doesnt have data
                throw new MessageException('Error while resizing: Original image data not found.');
            }

            if (!itemImageDataResized) {
                // Only need to process if the resized image does not exist
                originalImageDatas.push(itemImageDataOriginal);
            }
        }

        for (const originalImageData of originalImageDatas) {
            const compressedImage = await this.getResizedImage(originalImageData.imageHash, ListingItemTemplateService.FRACTION_LOWEST_COMPRESSION * 100);
            // save the resized image
            const imageDataCreateRequest: ItemImageDataCreateRequest = await this.imageFactory.getImageDataCreateRequest(
                originalImageData.itemImageId, ImageVersions.RESIZED, originalImageData.imageHash, originalImageData.protocol, compressedImage,
                originalImageData.encoding, originalImageData.originalMime, originalImageData.originalName);
            await this.itemImageDataService.create(imageDataCreateRequest);
        }

        this.log.debug('listingItemTemplateService.createResizedTemplateImages: ' + (new Date().getTime() - startTime) + 'ms');

        return await this.findOne(listingItemTemplate.id);
    }

    /**
     * calculates the size of the MarketplaceMessage for given ListingItemTemplate.
     * used to determine whether the MarketplaceMessage fits in the SmsgMessage size limits.
     *
     * @param listingItemTemplate
     */
    public async calculateMarketplaceMessageSize(listingItemTemplate: resources.ListingItemTemplate): Promise<MessageSize> {

        // TODO: move to actionservice?

        // template might not have a payment address (CryptocurrencyAddress) yet, so in that case we'll
        // add some data to get a more realistic result
        if (_.isEmpty(listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress)) {
            if (EscrowType.MAD_CT === listingItemTemplate.PaymentInformation.Escrow.type) {
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.address
                    = 'TetbeNoZDWJ6mMzMBy745BXQ84KntsNch58GWz53cqG6X5uupqNojqcoC7vmEguRPfC5QkpJsdbBnEcdXMLgJG2dAtoAinSdKNFWtB';
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.type = CryptoAddressType.STEALTH;
            } else {
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.address = 'pmnK6L2iZx9zLA6GAmd3BUWq6yKa53Lb8H';
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.type = CryptoAddressType.NORMAL;
            }
        }

        // convert the template to message
        const action = await this.listingItemAddMessageFactory.get({
            listingItem: listingItemTemplate
        } as ListingItemAddMessageCreateParams);

        const marketplaceMessage = {
            version: ompVersion(),
            action
        } as MarketplaceMessage;

        // this.log.debug('marketplacemessage: ', JSON.stringify(marketPlaceMessage, null, 2));

        let imageDataSize = 0;
        if (action.item.information.images) {
            for (const image of action.item.information.images) {
                imageDataSize = imageDataSize + image.data[0].data.length;
                this.log.debug('imageDataSize: ', image.data[0].data.length);
            }
        }
        const messageDataSize = JSON.stringify(marketplaceMessage).length - imageDataSize;
        const spaceLeft = ListingItemTemplateService.MAX_SMSG_SIZE - messageDataSize - imageDataSize;
        const fits = spaceLeft > 0;

        return {
            messageData: messageDataSize,
            imageData: imageDataSize,
            spaceLeft,
            fits
        } as MessageSize;
    }

    /**
     * sets the featured image for the ListingItemTemlate
     *
     * @param listingItemTemplate
     * @param imageId
     *
     */
    public async setFeaturedImage(listingItemTemplate: resources.ListingItemTemplate, imageId: number): Promise<ItemImage> {
        const itemImages = listingItemTemplate.ItemInformation.ItemImages;
        if (!_.isEmpty(itemImages)) {
            // find image and set it to featured
            const found = itemImages.find((img) => img.id === imageId && !img.featured);
            if (found) {
                await this.itemImageService.updateFeatured(found.id, true);
            }

            // check if other images are set to featured, unset as featured
            const notFound = itemImages.filter((img) => img.id !== imageId && img.featured);
            if (notFound.length) {
                notFound.forEach( async (img) => await this.itemImageService.updateFeatured(img.id, false));
            }

            this.log.info('Successfully set featured image');
            return await this.itemImageService.findOne(imageId);
        } else {
            this.log.error('ListingItemTemplate has no ItemImages.');
            throw new MessageException('ListingItemTemplate has no Images.');
        }
    }

    // check if object is exist in a array
    private async checkExistingObject(objectArray: string[], fieldName: string, value: string | number): Promise<any> {
        return await _.find(objectArray, (object) => {
            return (object[fieldName] === value);
        });
    }

    // find highest order number from listingItemObjects
    private async findHighestOrderNumber(listingItemObjects: string[]): Promise<any> {
        const highestOrder = await _.maxBy(listingItemObjects, (itemObject) => {
            return itemObject['order'];
        });
        return highestOrder ? highestOrder['order'] : 0;
    }

    /**
     *  Reads ORIGINAL version of an image from file (throws exception if file cannot be read), resizes and reduces quality,
     *  returning the modified image value.
     *
     * @param {string} imageHash
     * @param {boolean} qualityFactor
     * @returns {Promise<string>}
     */
    private async getResizedImage(imageHash: string, qualityFactor: number): Promise<string> {
        if (qualityFactor <= 0) {
            return '';
        }
        const originalItemImage = await this.itemImageDataService.loadImageFile(imageHash, ImageVersions.ORIGINAL.propName);

        let compressedImage = await ImageProcessing.resizeImageToFit(
            originalItemImage,
            ListingItemTemplateService.IMG_BOUNDING_WIDTH,
            ListingItemTemplateService.IMG_BOUNDING_HEIGHT
        );
        compressedImage = await ImageProcessing.downgradeQuality(
            compressedImage,
            qualityFactor
        );
        return compressedImage;
    }
}
