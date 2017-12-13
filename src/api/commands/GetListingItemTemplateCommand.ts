import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemTemplateService } from '../services/ListingItemTemplateService';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import {RpcCommand} from './RpcCommand';

export class GetListingItemTemplateCommand implements RpcCommand<ListingItemTemplate> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'getlistingitemtemplate';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ListingItemTemplate> {
        return this.listingItemTemplateService.findOne(data.params[0]);
    }

    public help(): string {
        return 'GetListingItemTemplateCommand: TODO: Fill in help string.';
    }
}
