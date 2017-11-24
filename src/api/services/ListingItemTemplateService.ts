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
import { RpcRequest } from '../requests/RpcRequest';


export class ListingItemTemplateService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemTemplateRepository) public listingItemTemplateRepo: ListingItemTemplateRepository,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
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
    public async create( @request(ListingItemTemplateCreateRequest) body: any): Promise<ListingItemTemplate> {
        // extract and remove related models from request
        const itemInformation = body.itemInformation;
        delete body.itemInformation;

        const paymentInformation = body.paymentInformation;
        delete body.paymentInformation;
        // If the request body was valid we will create the listingItemTemplate
        const listingItemTemplate = await this.listingItemTemplateRepo.create(body);

        if (itemInformation) {
            itemInformation.listing_item_template_id = listingItemTemplate.Id;
            await this.itemInformationService.create(itemInformation);
        }

        if (paymentInformation) {
            paymentInformation.listing_item_template_id = listingItemTemplate.Id;
            await this.paymentInformationService.create(paymentInformation);
        }

        // finally find and return the created listingItemTemplate
        const newListingItemTemplate = await this.findOne(listingItemTemplate.Id);
        return newListingItemTemplate;
    }

    @validate()
    public async update(id: number, @request(ListingItemTemplateUpdateRequest) body: any): Promise<ListingItemTemplate> {

        // find the existing one without related
        const listingItemTemplate = await this.findOne(id, false);

        // set new values

        // update listingItemTemplate record
        const updatedListingItemTemplate = await this.listingItemTemplateRepo.update(id, listingItemTemplate.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let listingItemTemplateRelated = updatedListingItemTemplate.related('ListingItemTemplateRelated').toJSON();
        // await this.listingItemTemplateService.destroy(listingItemTemplateRelated.id);

        // TODO: recreate related data
        // listingItemTemplateRelated = body.listingItemTemplateRelated;
        // listingItemTemplateRelated._id = listingItemTemplate.Id;
        // const createdListingItemTemplate = await this.listingItemTemplateService.create(listingItemTemplateRelated);

        // TODO: finally find and return the updated listingItemTemplate
        // const newListingItemTemplate = await this.findOne(id);
        // return newListingItemTemplate;

        return updatedListingItemTemplate;
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemTemplateRepo.destroy(id);
    }

}
