import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { FlaggedItemService } from '../../services/FlaggedItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { FlaggedItemCreateRequest } from '../../requests/FlaggedItemCreateRequest';
import { FlaggedItem } from '../../models/FlaggedItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ListingItemFlagCommand extends BaseCommand implements RpcCommandInterface<FlaggedItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.FlaggedItemService) public flaggedItemService: FlaggedItemService
    ) {
        super(Commands.ITEM_FLAG);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemId or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<FlaggedItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<FlaggedItem> {

        let listingItem;
        // if listingItemId is number then findById, else findOneByHash
        if (typeof data.params[0] === 'number') {
            listingItem = await this.listingItemService.findOne(data.params[0]);
        } else {
            listingItem = await this.listingItemService.findOneByHash(data.params[0]);
        }

        // check if item already flagged
        const isFlagged = await this.listingItemService.isItemFlagged(listingItem);

        if (isFlagged) {
            throw new MessageException('Item already beeing flagged!');
        } else {
            // create FlaggedItem
            return await this.flaggedItemService.create({
                listingItemId: listingItem.id
            } as FlaggedItemCreateRequest);
        }
    }

    public usage(): string {
        return this.getName() + ' [<listingItemId>|<hash>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>     - [optional] Numeric - The ID of the listing item we want to flag. \n'

            + '    <hash>             - [optional] String - The hash of the listing item we want to flag. \n';
    }

    public description(): string {
        return 'Flag a listing item via given listingItemId or hash.';
    }
}
