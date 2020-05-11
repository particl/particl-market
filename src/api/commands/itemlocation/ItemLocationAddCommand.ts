// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemLocationService } from '../../services/model/ItemLocationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemLocationCreateRequest } from '../../requests/model/ItemLocationCreateRequest';
import { ItemLocation } from '../../models/ItemLocation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { LocationMarkerCreateRequest } from '../../requests/model/LocationMarkerCreateRequest';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import {ModelNotModifiableException} from '../../exceptions/ModelNotModifiableException';

export class ItemLocationAddCommand extends BaseCommand implements RpcCommandInterface<ItemLocation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemLocationService) private itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMLOCATION_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate, resources.ListingItemTemplate
     *  [1]: country (country/countryCode)
     *  [2]: address, optional
     *  [3]: gpsMarkerTitle, optional
     *  [4]: gpsMarkerDescription, optional
     *  [5]: gpsMarkerLatitude, optional
     *  [6]: gpsMarkerLongitude, optional
     *
     * @param data
     * @returns {Promise<ItemLocation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemLocation> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const countryCode = data.params[1];
        const address = data.params[2];

        let locationMarker: LocationMarkerCreateRequest | undefined;

        const allGpsMarketDataParamsExist = data.params[3] && data.params[4] && data.params[5] && data.params[6];
        if (allGpsMarketDataParamsExist) {
            locationMarker = {
                title: data.params[3],
                description: data.params[4],
                lat: data.params[5],
                lng: data.params[6]
            } as LocationMarkerCreateRequest;
        }

        const itemLocation = {
            item_information_id: listingItemTemplate.ItemInformation.id,
            country: countryCode,
            address,
            locationMarker
        } as ItemLocationCreateRequest;

        return this.itemLocationService.create(itemLocation);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: country (country/countryCode)
     *  [2]: address, optional
     *  [3]: gpsMarkerTitle, optional
     *  [4]: gpsMarkerDescription, optional
     *  [5]: gpsMarkerLatitude, optional
     *  [6]: gpsMarkerLongitude, optional
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('country');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('country', 'string');
        } else if (data.params[2] && typeof data.params[2] !== 'string') {
            throw new InvalidParamException('address', 'string');
        }

        if (data.params.length > 3 && data.params.length !== 7) {
            if (data.params.length < 5) {
                throw new MissingParamException('gpsMarkerDescription');
            } else if (data.params.length < 6) {
                throw new MissingParamException('gpsMarkerLatitude');
            } else if (data.params.length < 7) {
                throw new MissingParamException('gpsMarkerLongitude');
            }

            if (typeof data.params[3] !== 'string') {
                throw new InvalidParamException('gpsMarkerTitle', 'string');
            } else if (typeof data.params[4] !== 'string') {
                throw new InvalidParamException('gpsMarkerDescription', 'string');
            } else if (typeof data.params[5] !== 'number') {
                throw new InvalidParamException('gpsMarkerLatitude', 'number');
            } else if (typeof data.params[6] !== 'number') {
                throw new InvalidParamException('gpsMarkerLongitude', 'number');
            }
        }

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        data.params[1] = ShippingCountries.convertAndValidate(data.params[1]);

        // make sure ListingItemTemplate with the id exists
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });

        // make sure ItemInformation exists
        if (_.isEmpty(listingItemTemplate.ItemInformation)) {
            throw new ModelNotFoundException('ItemInformation');
        }

        // can't add if ItemLocation already exists
        if (!_.isEmpty(listingItemTemplate.ItemInformation.ItemLocation)) { // templates itemlocation exist
            throw new MessageException(`ItemLocation for the listingItemTemplateId=${listingItemTemplate.id} already exists!`);
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        data.params[0] = listingItemTemplate;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <country> [<address> [<gpsMarkerTitle> <gpsMarkerDescription> <gpsMarkerLatitude>'
            + ' <gpsMarkerLongitude>]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template we want \n'
            + '                                to associate with this item location. \n'
            + '    <country>                 - String - Country, i.e. country or country code. \n'
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
