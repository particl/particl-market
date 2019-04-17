// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemLocationService } from '../../services/model/ItemLocationService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemLocationUpdateRequest } from '../../requests/model/ItemLocationUpdateRequest';
import { ItemLocation } from '../../models/ItemLocation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import {LocationMarkerUpdateRequest} from '../../requests/model/LocationMarkerUpdateRequest';

export class ItemLocationUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemLocation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemLocationService) public itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMLOCATION_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: listing_item_template_id
     * [1]: country (country/countryCode)
     * [2]: address, optional
     * [3]: gps marker title, optional
     * [4]: gps marker description, optional
     * [5]: gps marker latitude, optional
     * [6]: gps marker longitude, optional
     *
     * @param data
     * @returns {Promise<ItemLocation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemLocation> {
        const listingItemTemplateId = data.params[0];
        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        if (data.params[1]) {
            let countryCode: string = data.params[1];
            countryCode = ShippingCountries.convertAndValidate(countryCode);

            const itemInformation = await this.getItemInformation(listingItemTemplateId);

            // ItemLocation cannot be updated if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
            if (itemInformation.listingItemId) {
                throw new MessageException('ItemLocation cannot be updated because the item has allready been posted!');
            } else {
                const updateRequest = {
                    item_information_id: itemInformation.id,
                    country: countryCode,
                    address: data.params[2]
                } as ItemLocationUpdateRequest;

                if (data.params[5] && data.params[6]) {
                    updateRequest.locationMarker = {
                        markerTitle: data.params[3],
                            markerText: data.params[4],
                            lat: data.params[5],
                            lng: data.params[6]
                    } as LocationMarkerUpdateRequest;
                }

                // update item location
                return this.itemLocationService.update(itemInformation.ItemLocation.id, updateRequest);
            }
        } else {
            throw new MessageException('Country code can\'t be blank.');
        }
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <country> <address> <gpsMarkerTitle>'
            + ' <gpsMarkerDescription> <gpsMarkerLatitude> <gpsMarkerLongitude> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template we want. \n'
            + '    <country>                 - String - Country, i.e. country or country code. \n'
            + '    <address>                - String - Address. \n'
            + '    <gpsMarkerTitle>         - String - Gps marker title. \n'
            + '    <gpsMarkerDescription>   - String - Gps marker text. \n'
            + '    <gpsMarkerLatitude>      - Numeric - Marker latitude position. \n'
            + '    <gpsMarkerLongitude>     - Numeric - Marker longitude position. ';
    }

    public description(): string {
        return 'Update the details of an item location given by listingItemTemplateId.';
    }

    /*
     * TODO: NOTE: This function may be duplicated between commands.
     */
    private async getItemInformation(listingItemTemplateId: number): Promise<any> {
        // find the existing listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId);

        // find the related ItemInformation
        const ItemInformation = listingItemTemplate.related('ItemInformation').toJSON();

        // Through exception if ItemInformation or ItemLocation does not exist
        if (_.size(ItemInformation) === 0 || _.size(ItemInformation.ItemLocation) === 0) {
            this.log.warn(`Item Information or Item Location with the listing template id=${listingItemTemplateId} was not found!`);
            throw new MessageException(`Item Information or Item Location with the listing template id=${listingItemTemplateId} was not found!`);
        }

        return ItemInformation;
    }
}
