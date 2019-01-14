// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemLocationService } from '../../services/ItemLocationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemLocationCreateRequest } from '../../requests/ItemLocationCreateRequest';
import { ItemLocation } from '../../models/ItemLocation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import * as _ from 'lodash';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import * as resources from 'resources';
import {LocationMarkerCreateRequest} from '../../requests/LocationMarkerCreateRequest';

export class ItemLocationAddCommand extends BaseCommand implements RpcCommandInterface<ItemLocation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) private itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMLOCATION_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: listingItemTemplateId
     * [1]: countryCode
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
        const countryCode = data.params[1];
        const address = data.params[2];

        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();

        let locationMarker: LocationMarkerCreateRequest | undefined;

        const allGpsMarketDataParamsExist = data.params[3] && data.params[4] && data.params[5] && data.params[6];
        if (allGpsMarketDataParamsExist) {
            locationMarker = {
                markerTitle: data.params[3],
                markerText: data.params[4],
                lat: data.params[5],
                lng: data.params[6]
            } as LocationMarkerCreateRequest;
        }

        const itemLocation = {
            item_information_id: listingItemTemplate.ItemInformation.id,
            region: countryCode,
            address,
            locationMarker
        } as ItemLocationCreateRequest;

        return this.itemLocationService.create(itemLocation);
    }

    /**
     * data.params[]:
     * [0]: listingItemTemplateId
     * [1]: region (country/countryCode)
     * [2]: address, optional
     * [3]: gps marker title, optional
     * [4]: gps marker description, optional
     * [5]: gps marker latitude, optional
     * [6]: gps marker longitude, optional
     *
     * @param data
     * @returns {Promise<ItemLocation>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 2) {
            throw new MessageException('Missing params.');
        }
        if (data.params.length > 3 && data.params.length !== 7) {
            throw new MessageException('Missing gps marker data.');
        }

        if (typeof data.params[0] !== 'number') {
            throw new MessageException('Invalid listingItemTemplateId.');
        }

        if (typeof data.params[1] !== 'string') {
            throw new MessageException('Invalid region.');
        } else {
            // If countryCode is country, convert to countryCode.
            // If countryCode is country code, validate, and possibly throw error.
            data.params[1] = ShippingCountries.convertAndValidate(data.params[1]);
        }

        if (typeof data.params[2] !== 'string') { // address should be string
            throw new MessageException('Invalid address.');
        }

        const allGpsMarketDataParamsExist = data.params[3] && data.params[4] && data.params[5] && data.params[6];
        if (allGpsMarketDataParamsExist) {

            if (typeof data.params[3] !== 'string') {
                throw new MessageException('Invalid title.');
            }
            if (typeof data.params[4] !== 'string') {
                throw new MessageException('Invalid description.');
            }

            if (typeof data.params[5] !== 'number') {
                throw new MessageException('Invalid latitude.');
            }
            if (typeof data.params[6] !== 'number') {
                throw new MessageException('Invalid longitude.');
            }
        }

        // ItemLocation cannot be created if there's a ListingItem related to ItemInformations ItemLocation.
        // (the item has allready been posted)
        const listingItemTemplateId = data.params[0];
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();

        if (_.size(listingItemTemplate.ListingItems) > 0) { // listingitems exist
            throw new MessageException(`ListingItem(s) for the listingItemTemplateId=${listingItemTemplateId} allready exist!`);
        }

        if (!_.isEmpty(listingItemTemplate.ItemInformation.ItemLocation)) { // templates itemlocation exist
            throw new MessageException(`ItemLocation for the listingItemTemplateId=${listingItemTemplateId} already exists!`);
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <region> [<address> [<gpsMarkerTitle> <gpsMarkerDescription> <gpsMarkerLatitude>'
            + ' <gpsMarkerLongitude>]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template we want \n'
            + '                                to associate with this item location. \n'
            + '    <region>                 - String - Region, i.e. country or country code. \n'
            + '    <address>                - String - Address [TODO, what kind of address?]. \n'
            + '    <gpsMarkerTitle>         - String - Gps marker title. \n'
            + '    <gpsMarkerDescription>   - String - Gps marker text. \n'
            + '    <gpsMarkerLatitude>      - Numeric - Marker latitude position. \n'
            + '    <gpsMarkerLongitude>     - Numeric - Marker longitude position. ';
    }

    public description(): string {
        return 'Command for adding an ItemLocation to your ListingItemTemplate, identified by listingItemTemplateId.';
    }

    public example(): string {
        return '';
        // 'location ' + this.getName() + ' 1 \'United States\' CryptoAddr? [TODO]';
    }

}
