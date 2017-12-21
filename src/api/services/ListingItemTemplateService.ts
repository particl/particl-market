import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ListingItemTemplateRepository } from '../repositories/ListingItemTemplateRepository';
import { ItemInformationService } from './ItemInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { MessagingInformationService } from './MessagingInformationService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { ListingItemTemplateCreateRequest } from '../requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../requests/ListingItemTemplateUpdateRequest';
import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';

export class ListingItemTemplateService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemTemplateRepository) public listingItemTemplateRepo: ListingItemTemplateRepository,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
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
     * search ListingItemTemplates using given ListingItemTemplateSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemTemplate>>}
     */
    @validate()
    public async search(
        @request(ListingItemTemplateSearchParams) options: ListingItemTemplateSearchParams): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return this.listingItemTemplateRepo.search(options);
    }

    @validate()
    public async create( @request(ListingItemTemplateCreateRequest) data: ListingItemTemplateCreateRequest): Promise<ListingItemTemplate> {

        // this.log.debug('ListingItemTemplateService.create, data:', JSON.stringify(data, null, 2));

        const body = JSON.parse(JSON.stringify(data));

        // extract and remove related models from request
        const itemInformation = body.itemInformation;
        delete body.itemInformation;
        const paymentInformation = body.paymentInformation;
        delete body.paymentInformation;
        const messagingInformation = body.messagingInformation;
        delete body.messagingInformation;
        const listingItemObjects = body.listingItemObjects;
        delete body.listingItemObjects;

        // this.log.debug('itemInformation to save: ', JSON.stringify(itemInformation, null, 2));
        // this.log.debug('paymentInformation to save: ', JSON.stringify(paymentInformation, null, 2));
        // this.log.debug('messagingInformation to save: ', JSON.stringify(messagingInformation, null, 2));

        // If the request body was valid we will create the listingItemTemplate
        const listingItemTemplate = await this.listingItemTemplateRepo.create(body)
            .catch(reason => {
                this.log.error('ERROR: ', reason);
            });

        if (!_.isEmpty(itemInformation)) {
            itemInformation.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.itemInformationService.create(itemInformation);
            // this.log.debug('saved itemInformation ' + listingItemTemplate.Id + ': ', result.toJSON());
        }
        if (!_.isEmpty(paymentInformation)) {
            paymentInformation.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.paymentInformationService.create(paymentInformation);
            // this.log.debug('saved paymentInformation ' + listingItemTemplate.Id + ': ', result.toJSON());
        }
        if (!_.isEmpty(messagingInformation)) {
            messagingInformation.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.messagingInformationService.create(messagingInformation);
            // this.log.debug('saved messagingInformation ' + listingItemTemplate.Id + ': ', result.toJSON());
        }
        if (!_.isEmpty(listingItemObjects)) {
            // TODO: implement
        }

        // finally find and return the created listingItemTemplate
        const newListingItemTemplate = await this.findOne(listingItemTemplate.Id);
        // this.log.debug('newListingItemTemplate: ', JSON.stringify(newListingItemTemplate.toJSON(), null, 2));
        return newListingItemTemplate;

    }

    @validate()
    public async update(id: number, @request(ListingItemTemplateUpdateRequest) data: ListingItemTemplateUpdateRequest): Promise<ListingItemTemplate> {

        const body = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const listingItemTemplate = await this.findOne(id, false);

        // set new values
        listingItemTemplate.Hash = body.hash;

        // update listingItemTemplate record
        const updatedListingItemTemplate = await this.listingItemTemplateRepo.update(id, listingItemTemplate.toJSON());
        // this.log.debug('updatedListingItemTemplate.toJSON():', updatedListingItemTemplate.toJSON());

        // find related record and delete it and recreate related data
        const itemInformation = updatedListingItemTemplate.related('ItemInformation').toJSON();
        const paymentInformation = updatedListingItemTemplate.related('PaymentInformation').toJSON();
        const messagingInformation = updatedListingItemTemplate.related('MessagingInformation').toJSON();
        const listingItemObjects = updatedListingItemTemplate.related('ListingItemObjects').toJSON();

        if (!_.isEmpty(itemInformation)) {
            body.itemInformation.listing_item_template_id = id;
            await this.itemInformationService.update(body.itemInformation.id, body.itemInformation);
        }

        if (!_.isEmpty(paymentInformation)) {
            body.paymentInformation.listing_item_template_id = id;
            await this.paymentInformationService.update(body.paymentInformation.id, body.paymentInformation);
        }

        if (!_.isEmpty(messagingInformation)) {
            body.messagingInformation.listing_item_template_id = id;
            await this.messagingInformationService.update(body.messagingInformation.id, body.messagingInformation);
        }

        if (!_.isEmpty(listingItemObjects)) {
            // TODO: implement
        }

        // finally find and return the updated listingItem
        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {

        const listingItemTemplate = await this.findOne(id);
        const relatedCryptocurrencyAddress = listingItemTemplate
            .related('PaymentInformation')
            .related('ItemPrice')
            .related('CryptocurrencyAddress')
            .toJSON();
        // this.log.debug('relatedCryptocurrencyAddress: ', JSON.stringify(relatedCryptocurrencyAddress, null, 2));

        await this.listingItemTemplateRepo.destroy(id);
        // if we have cryptoaddress and it's not related to profile -> delete
        if (!_.isEmpty(relatedCryptocurrencyAddress) && relatedCryptocurrencyAddress.profileId === null) {
            await this.cryptocurrencyAddressService.destroy(relatedCryptocurrencyAddress.id);
        }

    }

}
