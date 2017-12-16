import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ListingItemTemplateRepository } from '../repositories/ListingItemTemplateRepository';
import { ItemInformationService } from '../services/ItemInformationService';
import { PaymentInformationService } from '../services/PaymentInformationService';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { ListingItemTemplateCreateRequest } from '../requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../requests/ListingItemTemplateUpdateRequest';
import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';
import { MessagingInformationService } from './MessagingInformationService';

export class ListingItemTemplateService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemTemplateRepository) public listingItemTemplateRepo: ListingItemTemplateRepository,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
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
    public async create( @request(ListingItemTemplateCreateRequest) data: any): Promise<ListingItemTemplate> {
        const body = JSON.parse(JSON.stringify(data));

        // extract and remove related models from request
        const itemInformation = body.itemInformation;
        delete body.itemInformation;
        const paymentInformation = body.paymentInformation;
        delete body.paymentInformation;
        const messagingInformation = body.messagingInformation || [];
        delete body.messagingInformation;

        // this.log.info('save itemInformation: ', itemInformation);
        // this.log.info('save paymentInformation: ', paymentInformation);
        // this.log.info('save messagingInformation: ', messagingInformation);

        // If the request body was valid we will create the listingItemTemplate
        const listingItemTemplate = await this.listingItemTemplateRepo.create(body);
        this.log.info('saved listingItemTemplate.Id: ', listingItemTemplate.Id);


        if (itemInformation) {
            itemInformation.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.itemInformationService.create(itemInformation);
            // this.log.info('saved itemInformation: ', result.toJSON());
        }
        if (paymentInformation) {
            paymentInformation.listing_item_template_id = listingItemTemplate.Id;
            const result = await this.paymentInformationService.create(paymentInformation);
           // this.log.info('saved paymentInformation: ', result.toJSON());
        }
        for (const msgInfo of messagingInformation) {
            msgInfo.listing_item_template_id = listingItemTemplate.Id;
            await this.messagingInformationService.create(msgInfo);
        }

        // finally find and return the created listingItemTemplate
        const newListingItemTemplate = await this.findOne(listingItemTemplate.Id);
        // this.log.info('newListingItemTemplate: ', newListingItemTemplate.toJSON());
        return newListingItemTemplate;
    }

    @validate()
    public async update(id: number, @request(ListingItemTemplateUpdateRequest) data: any): Promise<ListingItemTemplate> {

        const body = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const listingItemTemplate = await this.findOne(id, false);

        // set new values
        listingItemTemplate.Hash = body.hash;

        this.log.info('listingItemTemplate.toJSON():', listingItemTemplate.toJSON());
        // update listingItemTemplate record
        const updatedListingItemTemplate = await this.listingItemTemplateRepo.update(id, listingItemTemplate.toJSON());

        // find related record and delete it and recreate related data
        const itemInformation = updatedListingItemTemplate.related('ItemInformation').toJSON();
        await this.itemInformationService.destroy(itemInformation.id);
        body.itemInformation.listing_item_template_id = id;
        await this.itemInformationService.create(body.itemInformation);

        // find related record and delete it and recreate related data
        const paymentInformation = updatedListingItemTemplate.related('PaymentInformation').toJSON();
        await this.paymentInformationService.destroy(paymentInformation.id);
        body.paymentInformation.listing_item_template_id = id;
        await this.paymentInformationService.create(body.paymentInformation);

        // find related record and delete it and recreate related data
        let messagingInformation = updatedListingItemTemplate.related('MessagingInformation').toJSON() || [];
        for (const msgInfo of messagingInformation) {
            msgInfo.listing_item_template_id = id;
            await this.messagingInformationService.destroy(msgInfo.id);
        }
        // add new
        messagingInformation = body.messagingInformation || [];
        for (const msgInfo of messagingInformation) {
            msgInfo.listing_item_template_id = id;
            await this.messagingInformationService.create(msgInfo);
        }

        // finally find and return the updated listingItem
        const newListingItemTemplate = await this.findOne(id);
        return newListingItemTemplate;
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemTemplateRepo.destroy(id);
    }

}
