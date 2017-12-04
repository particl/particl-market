import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import { ItemLocation } from '../../models/ItemLocation';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemLocationService } from './../ItemLocationService';
import { ListingItemTemplateService } from './../ListingItemTemplateService';
import * as _ from 'lodash';


export class RpcItemLocationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) public itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
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
    public async update(@request(RpcRequest) data: any): Promise<ItemLocation> {

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
            return this.itemLocationService.update(itemInformation.ItemLocation.id, body);
        }
    }

    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        const itemInformation = await this.getItemInformation(data);

        // ItemLocation cannot be removed if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
        if (itemInformation.listingItemId) {
            throw new MessageException('ItemLocation cannot be removed because the item has allready been posted!');
        } else {
            return this.itemLocationService.destroy(itemInformation.ItemLocation.id);
        }
    }

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
