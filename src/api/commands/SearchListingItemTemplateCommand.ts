import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemTemplateService } from '../services/ListingItemTemplateService';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import {RpcCommand} from './RpcCommand';
import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';

export class SearchListingItemTemplateCommand implements RpcCommand<Bookshelf.Collection<ListingItemTemplate>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'searchlistingitemtemplate';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return this.listingItemTemplateService.search({
            page: data.params[0] || 1,
            pageLimit: data.params[1] || 5,
            order: data.params[2] || 'ASC',
            profileId: data.params[3],
            category: data.params[4],
            searchString: data.params[5] || ''
        } as ListingItemTemplateSearchParams);
    }

    public help(): string {
        return 'SearchListingItemTemplateCommand: TODO: Fill in help string.';
    }
}
