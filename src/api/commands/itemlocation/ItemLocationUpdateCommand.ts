import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemLocationService } from '../../services/ItemLocationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemLocationUpdateRequest } from '../../requests/ItemLocationUpdateRequest';
import { ItemLocation } from '../../models/ItemLocation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import * as _ from 'lodash';
import { MessageException } from '../../exceptions/MessageException';

export class ItemLocationUpdateCommand implements RpcCommandInterface<ItemLocation> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) public itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'updateitemlocation';
    }

    /**
     * data.params[]:
     * [0]: listing_item_template_id
     * [1]: region (Country)
     * [2]: address
     * [3]: gps marker title
     * [4]: gps marker description
     * [5]: gps marker latitude
     * [6]: gps marker longitude
     *
     * @param data
     * @returns {Promise<ItemLocation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemLocation> {
        const itemInformation = await this.getItemInformation(data);

        // ItemLocation cannot be updated if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
        if (itemInformation.listingItemId) {
            throw new MessageException('ItemLocation cannot be updated because the item has allready been posted!');
        } else {
            // set body to update
            const body = {
                item_information_id: itemInformation.id,
                region: data.params[1],
                address: data.params[2],
                locationMarker: {
                    markerTitle: data.params[3],
                    markerText: data.params[4],
                    lat: data.params[5],
                    lng: data.params[6]
                }
            };
            // update item location
            return this.itemLocationService.update(itemInformation.ItemLocation.id, body as ItemLocationUpdateRequest);
        }
    }

    public help(): string {
        return 'ItemLocationUpdateCommand: TODO: Fill in help string.';
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
