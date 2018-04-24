import * as Bookshelf from 'bookshelf';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';
export declare class ListingItemTemplateRepository {
    ListingItemTemplateModel: typeof ListingItemTemplate;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ListingItemTemplateModel: typeof ListingItemTemplate, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ListingItemTemplate>>;
    findOne(id: number, withRelated?: boolean): Promise<ListingItemTemplate>;
    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItemTemplate>}
     */
    findOneByHash(hash: string, withRelated?: boolean): Promise<ListingItemTemplate>;
    /**
     * todo: optionally fetch withRelated
     *
     * @param options, ListingItemSearchParams
     * @returns {Promise<Bookshelf.Collection<ListingItemTemplate>>}
     */
    search(options: ListingItemTemplateSearchParams): Promise<Bookshelf.Collection<ListingItemTemplate>>;
    create(data: any): Promise<ListingItemTemplate>;
    update(id: number, data: any): Promise<ListingItemTemplate>;
    destroy(id: number): Promise<void>;
}
