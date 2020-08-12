// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { ListingItemImageAddMessage } from '../../messages/action/ListingItemImageAddMessage';
import { ListingItemImageAddMessageCreateParams } from '../../requests/message/ListingItemImageAddMessageCreateParams';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { DSN, ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../../exceptions/MessageException';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';

export class MarketImageAddMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @returns {Promise<ListingItemImageAddMessage>}
     * @param params
     */
    public async get(params: ListingItemImageAddMessageCreateParams): Promise<ListingItemImageAddMessage> {

        // hash should have been calculated when image was created
        // and signature have already been calculated, we just need the dsns

        const data: DSN[] = await this.getDSNs(params.image.ItemImageDatas, params.withData);

        const message = {
            type: MPActionExtended.MPA_MARKET_IMAGE_ADD,
            signature: params.signature,
            hash: params.image.hash,
            data,
            target: params.listingItem.hash // TODO: we could remove this later on...
        } as ListingItemImageAddMessage;

        return message;
    }

    /**
     * ContentReference (an image)
     *   - hash: string, the image hash
     *   - data: DSN[], image data sources, currently we support just one per image
     *      - protocol: ProtocolDSN,
     *          - LOCAL, for locally stored
     *          - SMSG, when sending and expecting to receive image through smsg
     *          - URL, not supported yet
     *          - IPFS, not supported yet
     *      - encoding: BASE64, although doesn't seem to be used
     *      - data: optional, the actual image data
     *      - dataId: optional, identifier for the data
     *   - featured: boolean, whether the image is the featured one or not
     *
     * TODO: refactor the image add command params
     *
     * @param itemImageDatas
     * @param withData
     */
    public async getDSNs(itemImageDatas: resources.ItemImageData[], withData: boolean = true): Promise<DSN[]> {
        const dsns: DSN[] = [];
        const imageData: resources.ItemImageData = await this.getPostableImageData(itemImageDatas);

        let data;
        let protocol = ProtocolDSN.LOCAL;

        if (withData) {
            // load the actual image data
            // we're not sending the image data anymore when posting the ListingItem
            data = await this.itemImageDataService.loadImageFile(imageData.imageHash, imageData.imageVersion);
            protocol = ProtocolDSN.SMSG;
        }

        dsns.push({
            protocol,
            encoding: imageData.encoding,
            dataId: imageData.dataId,
            data
        } as DSN);

        return dsns;
    }

    /**
     * return the resized data, or if that doesnt exist, the original one
     * @param itemImageDatas
     */
    private async getPostableImageData(itemImageDatas: resources.ItemImageData[]): Promise<resources.ItemImageData> {
        let imageData = _.find(itemImageDatas, (value) => {
            return value.imageVersion === ImageVersions.RESIZED.propName;
        });

        if (!imageData) {
            // if theres no resized version, then ORIGINAL can be used
            imageData = _.find(itemImageDatas, (value) => {
                return value.imageVersion === ImageVersions.ORIGINAL.propName;
            });

            if (!imageData) {
                // there's something wrong with the ItemImage if original image doesnt have data
                throw new MessageException('Data for ImageVersions.ORIGINAL not found.');
            }
        }
        return imageData;
    }

}
