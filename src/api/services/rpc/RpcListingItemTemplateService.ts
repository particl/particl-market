import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplateSearchParams } from '../../requests/ListingItemTemplateSearchParams';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';

export class RpcListingItemTemplateService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async findAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return this.listingItemTemplateService.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id to fetch
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<ListingItemTemplate> {
        return this.listingItemTemplateService.findOne(data.params[0]);
    }

    /**
     * data.params[]:
     *  [0]: profile_id
     *
     *  itemInformation
     *  [1]: title
     *  [2]: short description
     *  [3]: long description
     *  [4]: category
     *
     *  paymentInformation
     *  [5]: payment type
     *  [6]: currency
     *  [7]: base price
     *  [8]: domestic shipping price
     *  [9]: international shipping price
     *  [10]: payment address
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<ListingItemTemplate> {
        if (data.params[1] && data.params[2] && data.params[3] && data.params[4]) {
            return this.listingItemTemplateService.create({
                profile_id: data.params[0],
                itemInformation: {
                    title: data.params[1],
                    shortDescription: data.params[2],
                    longDescription: data.params[3],
                    itemCategory: {
                        key: data.params[4]
                    }
                },
                paymentInformation: {
                    type: data.params[5],
                    itemPrice: {
                        currency: data.params[6],
                        basePrice: data.params[7],
                        shippingPrice: {
                            domestic: data.params[8],
                            international: data.params[9]
                        },
                        address: {
                            type: 'address-type',
                            address: data.params[10]
                        }
                    }
                },
                messagingInformation: {}
            });
        } else {
            return this.listingItemTemplateService.create({
                profile_id: data.params[0]
            });
        }
    }

    /**
     * data.params[]:
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async update( @request(RpcRequest) data: any): Promise<ListingItemTemplate> {
        return this.listingItemTemplateService.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ListingItemTemplateUpdateRequest
        });
    }

    /**
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: profile id
     *  [4]: category, number|string, if string, try to find using key, can be null
     *  [5]: searchString, string, can be null
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async search( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return this.listingItemTemplateService.search({
            page: data.params[0] || 1,
            pageLimit: data.params[1] || 5,
            order: data.params[2] || 'ASC',
            profileId: data.params[3],
            category: data.params[4],
            searchString: data.params[5] || ''
        } as ListingItemTemplateSearchParams);
    }

    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return this.listingItemTemplateService.destroy(data.params[0]);
    }
}
