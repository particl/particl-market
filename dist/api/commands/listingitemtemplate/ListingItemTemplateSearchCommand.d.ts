import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemTemplateSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItemTemplate>> {
    Logger: typeof LoggerType;
    private listingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemTemplateService: ListingItemTemplateService);
    /**
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: profile id
     *  [4]: category, number|string, if string, try to search using key, can be null
     *  [5]: searchString, string, can be null
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<ListingItemTemplate>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
