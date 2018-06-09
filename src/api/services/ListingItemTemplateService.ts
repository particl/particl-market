import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';

import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { ListingItemTemplateRepository } from '../repositories/ListingItemTemplateRepository';

import { ItemInformationService } from './ItemInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { MessagingInformationService } from './MessagingInformationService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { ListingItemObjectService } from './ListingItemObjectService';

import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';

import { ListingItemTemplateCreateRequest } from '../requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../requests/ListingItemTemplateUpdateRequest';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../requests/ItemInformationUpdateRequest';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../requests/PaymentInformationUpdateRequest';
import { MessagingInformationCreateRequest } from '../requests/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../requests/MessagingInformationUpdateRequest';
import { ListingItemObjectCreateRequest } from '../requests/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../requests/ListingItemObjectUpdateRequest';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../enums/HashableObjectType';
import { HashableListingItem } from '../../core/helpers/HashableListingItem';

export class ListingItemTemplateService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemTemplateRepository) public listingItemTemplateRepo: ListingItemTemplateRepository,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.ListingItemObjectService) public listingItemObjectService: ListingItemObjectService,
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
     * search ListingItemTemplates using given ListingItemTemplateSearchParams
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
    public async create( @request(ListingItemTemplateCreateRequest) data: ListingItemTemplateCreateRequest,
                         timestampedHash: boolean = false): Promise<ListingItemTemplate> {

        // TODO: need to add transactions and rollback in case of failure

        const body = JSON.parse(JSON.stringify(data));

        body.hash = ObjectHash.getHash(body, HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST, timestampedHash);

        this.log.debug('create template, body:', JSON.stringify(body, null, 2));

        // extract and remove related models from request
        const itemInformation = body.itemInformation;
        delete body.itemInformation;
        const paymentInformation = body.paymentInformation;
        delete body.paymentInformation;
        const messagingInformation = body.messagingInformation || [];
        delete body.messagingInformation;
        const listingItemObjects = body.listingItemObjects || [];
        delete body.listingItemObjects;

        // If the request body was valid we will create the listingItemTemplate
        const listingItemTemplate: any = await this.listingItemTemplateRepo.create(body);

        // create related models
        if (!_.isEmpty(itemInformation)) {
            itemInformation.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.itemInformationService.create(itemInformation as ItemInformationCreateRequest);
            this.log.debug('itemInformation, result:', JSON.stringify(result, null, 2));
        }
        if (!_.isEmpty(paymentInformation)) {
            paymentInformation.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.paymentInformationService.create(paymentInformation as PaymentInformationCreateRequest);
            this.log.debug('paymentInformation, result:', JSON.stringify(result, null, 2));
        }

        for (const msgInfo of messagingInformation) {
            msgInfo.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.messagingInformationService.create(msgInfo as MessagingInformationCreateRequest);
            this.log.debug('msgInfo, result:', JSON.stringify(result, null, 2));
        }

        for (const object of listingItemObjects) {
            object.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.listingItemObjectService.create(object as ListingItemObjectCreateRequest);
            this.log.debug('object, result:', JSON.stringify(result, null, 2));
        }

        // finally find and return the created listingItemTemplate
        return await this.findOne(listingItemTemplate.Id);

    }

    @validate()
    public async update(id: number, @request(ListingItemTemplateUpdateRequest) data: ListingItemTemplateUpdateRequest): Promise<ListingItemTemplate> {
        const body = JSON.parse(JSON.stringify(data));

        body.hash = ObjectHash.getHash(body, HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST);

        // find the existing one without related
        const listingItemTemplate = await this.findOne(id, false);
        // set new values
        listingItemTemplate.Hash = body.hash;

        // update listingItemTemplate record
        const updatedListingItemTemplate = await this.listingItemTemplateRepo.update(id, listingItemTemplate.toJSON());

        // if the related one exists allready, then update. if it doesnt exist, create. and if the related one is missing, then remove.
        // Item-information
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
        const listingItemTemplateModel = await this.findOne(id);
        if (!listingItemTemplateModel) {
            throw new NotFoundException('ListingItemTemplate does not exist. id = ' + id);
        }
        const listingItemTemplate = listingItemTemplateModel.toJSON();
        this.log.debug('delete listingItemTemplate:', listingItemTemplate.id);

        if (_.isEmpty(listingItemTemplate.ListingItems)) {
            await this.listingItemTemplateRepo.destroy(id);
        } else {
            throw new MessageException('ListingItemTemplate has ListingItems.');
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
}
