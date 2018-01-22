import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemLocationService } from '../../services/ItemLocationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import * as _ from 'lodash';
import { MessageException } from '../../exceptions/MessageException';
import {CommandEnumType, Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class ItemLocationRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) public itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMLOCATION_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     * [0]: id
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        const itemInformation = await this.getItemInformation(data);

        // ItemLocation cannot be removed if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
        if (itemInformation.listingItemId) {
            throw new MessageException('ItemLocation cannot be removed because the item has allready been posted!');
        } else {
            return this.itemLocationService.destroy(itemInformation.ItemLocation.id);
        }
    }

    public help(): string {
        return 'removeitemlocation <itemLocationId>\n'
            + '    <itemLocationId>           - Numeric - [TODO]';
    }

    public example(): any {
        return null;
    }

    /*
     * TODO: NOTE: This function may be duplicated between commands.
     */
    private async getItemInformation(data: any): Promise<any> {
        // find the existing listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]);

        // find the related ItemInformation
        const ItemInformation = listingItemTemplate.related('ItemInformation').toJSON();

        // Through exception if ItemInformation or ItemLocation does not exist
        if (_.size(ItemInformation) === 0 || _.size(ItemInformation.ItemLocation) === 0) {
            this.log.warn(`Item Information or Item Location with the listing template id=${data.params[0]} was not found!`);
            throw new MessageException(`Item Information or Item Location with the listing template id=${data.params[0]} was not found!`);
        }

        return ItemInformation;
    }
}
