// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ItemInformationCreateRequest } from '../../requests/model/ItemInformationCreateRequest';
import { LocationMarkerCreateRequest } from '../../requests/model/LocationMarkerCreateRequest';
import { ImageCreateRequest } from '../../requests/model/ImageCreateRequest';
import { ItemLocationCreateRequest } from '../../requests/model/ItemLocationCreateRequest';
import { ImageDataService } from '../../services/model/ImageDataService';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { ItemInfo, Location, LocationMarker } from 'omp-lib/dist/interfaces/omp';
import { ShippingDestinationCreateRequest } from '../../requests/model/ShippingDestinationCreateRequest';
import { ContentReference, DSN } from 'omp-lib/dist/interfaces/dsn';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { ImageCreateParams, ListingItemCreateParams } from '../ModelCreateParams';
import { ImageFactory } from './ImageFactory';
import { ImageService } from '../../services/model/ImageService';
// tslint:enable:max-line-length


export class ItemInformationFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.model.ImageFactory) private imageFactory: ImageFactory,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) public imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ItemInformationCreateRequest
     *
     * @param params
     */
    public async get(params: ListingItemCreateParams): Promise<ItemInformationCreateRequest> {
        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;
        const information: ItemInfo = listingItemAddMessage.item.information;

        let itemLocation: ItemLocationCreateRequest | undefined;
        let shippingDestinations: ShippingDestinationCreateRequest[] | undefined;
        let images: ImageCreateRequest[] | undefined;

        if (information.location) {
            itemLocation = await this.getModelLocation(params);
        }

        if (information.shippingDestinations) {
            shippingDestinations = await this.getModelShippingDestinations(params);
        }

        if (information.images) {
            images = await this.getImageCreateRequests(params);
        }

        return {
            title: information.title,
            shortDescription: information.shortDescription,
            longDescription: information.longDescription,
            // itemCategory,
            item_category_id: params.categoryId,
            itemLocation,
            shippingDestinations,
            images
        } as ItemInformationCreateRequest;
    }

    private async getModelLocation(params: ListingItemCreateParams): Promise<ItemLocationCreateRequest> {

        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;

        const location: Location | undefined = listingItemAddMessage.item.information.location;

        let locationMarker: LocationMarkerCreateRequest | undefined;
        if (!_.isNil(location) && !_.isNil(location.gps)) {
            locationMarker = await this.getModelLocationMarker(params);
        }

        return {
            country: (location && location.country) ? location.country : undefined,
            address: (location && location.address) ? location.address : undefined,
            locationMarker
        } as ItemLocationCreateRequest;
    }

    private async getModelLocationMarker(params: ListingItemCreateParams): Promise<LocationMarkerCreateRequest | undefined> {

        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;
        const smsgMessage = params.smsgMessage;

        const location: Location | undefined = listingItemAddMessage.item.information.location;

        if (!_.isNil(location) && !_.isNil(location.gps)) {
            const gps: LocationMarker = location.gps;
            return {
                lat: gps.lat,
                lng: gps.lng,
                title: gps.title ? gps.title : undefined,
                description: gps.description ? gps.description : undefined
            } as LocationMarkerCreateRequest;
        }
        return undefined;
    }

    private async getModelShippingDestinations(params: ListingItemCreateParams): Promise<ShippingDestinationCreateRequest[]> {

        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;
        const smsgMessage = params.smsgMessage;

        const shippingDestinations: string[] = listingItemAddMessage.item.information.shippingDestinations || [];

        const destinations: ShippingDestinationCreateRequest[] = [];
        for (const destination of shippingDestinations) {

            let shippingAvailability = ShippingAvailability.SHIPS;
            let country = destination;

            if (destination.charAt(0) === '-') {
                shippingAvailability = ShippingAvailability.DOES_NOT_SHIP;
                country = destination.substring(1);
            }

            destinations.push({
                country,
                shippingAvailability
            } as ShippingDestinationCreateRequest);
        }

        return destinations;
    }

    private async getImageCreateRequests(params: ListingItemCreateParams): Promise<ImageCreateRequest[]> {

        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;
        const smsgMessage = params.smsgMessage;

        const imageCreateRequests: ImageCreateRequest[] = [];

        const images: ContentReference[] = listingItemAddMessage.item.information.images || [];
        for (const image of images) {

            const createRequest: ImageCreateRequest = await this.imageFactory.get({
                smsgMessage,
                actionMessage: image
            } as ImageCreateParams);
            imageCreateRequests.push(createRequest);
        }
        return imageCreateRequests;
    }
}
