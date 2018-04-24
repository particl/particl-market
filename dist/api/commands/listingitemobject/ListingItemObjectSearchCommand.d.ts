import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemObjectService } from '../../services/ListingItemObjectService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemObject } from '../../models/ListingItemObject';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemObjectSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItemObject>> {
    Logger: typeof LoggerType;
    listingItemObjectService: ListingItemObjectService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemObjectService: ListingItemObjectService);
    /**
     * data.params[]:
     *  [0]: searchString, string
     *
     * @param data
     * @returns {Promise<ListingItemObject>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<ListingItemObject>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
