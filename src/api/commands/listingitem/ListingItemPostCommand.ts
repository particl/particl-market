import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemPostRequest } from '../../requests/ListingItemPostRequest';
import {CommandEnumType, Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class ListingItemPostCommand extends BaseCommand implements RpcCommandInterface<ListingItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.DATA_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: marketId, may be optional
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        return this.listingItemService.post({
            listingItemTemplateId: data.params[0],
            marketId: data.params[1] || undefined
        } as ListingItemPostRequest);

    }

    public help(): string {
        return 'ListingItemPostCommand: TODO: Fill in help string.';
    }

    public example(): any {
        return null;
    }

}
