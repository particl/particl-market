import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/ItemImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommand } from '../RpcCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ItemImageRemoveCommand implements RpcCommand<void> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'removeitemimage';
    }

    /**
     *
     * data.params[]:
     *  [0]: ItemImage.Id
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        // find itemImage
        const itemImage = await this.itemImageService.findOne(data.params[0]);

        // find related itemInformation
        const itemInformation = itemImage.related('ItemInformation').toJSON();

        // check if item already been posted
        if (itemInformation.listingItemId) {
            throw new MessageException(`Can't delete itemImage because the item has allready been posted!`);
        }
        return this.itemImageService.destroy(data.params[0]);
    }

    public help(): string {
        return 'ItemImageRemoveCommand: TODO: Fill in help string.';
    }
}
