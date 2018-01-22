import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { FavoriteItemService } from '../../services/FavoriteItemService';
import { ListingItemService } from '../../services/ListingItemService';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { FavoriteSearchParams } from '../../requests/FavoriteSearchParams';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { InternalServerException } from '../../exceptions/InternalServerException';
import { FavoriteItemCreateRequest } from '../../requests/FavoriteItemCreateRequest';

/*
 * Get a list of all favorites for profile
 */
export class FavoriteListCommand implements RpcCommandInterface<Bookshelf.Collection<FavoriteItem>> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;
    public descriptionStr: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'list';
        this.helpStr = 'list <profileId>\n'
            + '    <profileId>                     - Numeric - The ID of the profile we\n'
            + '                                       want to associate this favorite with.';
        this.descriptionStr = 'Get a list of all favorites for profile';
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<FavoriteItem>> {
        throw new InternalServerException('Not implemented');
    }

    public help(): string {
        return this.helpStr;
    }
}
