// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ListingItemImageAddMessage } from '../../messages/action/ListingItemImageAddMessage';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { DSN, ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../../exceptions/MessageException';
import { ImageDataService } from '../../services/model/ImageDataService';
import { ListingItemImageAddRequest } from '../../requests/action/ListingItemImageAddRequest';
import { CoreRpcService } from '../../services/CoreRpcService';
import { BaseMessageFactory } from './BaseMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { VerifiableMessage } from './ListingItemAddMessageFactory';

// todo: move
export interface ImageAddMessage extends VerifiableMessage {
    address: string;            // seller address
    hash: string;               // image hash being added
    target: string;             // listing hash the image is related to
}

export class ListingItemImageAddMessageFactory extends BaseMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super();
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param actionRequest
     * @returns {Promise<MarketplaceMessage>}
     */
    public async get(actionRequest: ListingItemImageAddRequest): Promise<MarketplaceMessage> {

        // hash should have been calculated when image was created
        // and signature have already been calculated, we just need the dsns

        const signature = await this.signImageMessage(actionRequest.sendParams.wallet, actionRequest.sellerAddress, actionRequest.image.hash,
            actionRequest.listingItem.hash);

        const data: DSN[] = await this.getDSNs(actionRequest.image.ImageDatas, actionRequest.withData);

        const message = {
            type: MPActionExtended.MPA_LISTING_IMAGE_ADD,
            seller: actionRequest.sellerAddress,
            signature,
            hash: actionRequest.image.hash,
            data,
            target: actionRequest.listingItem.hash,
            featured: actionRequest.image.featured
        } as ListingItemImageAddMessage;

        // this.log.debug('message:', JSON.stringify(message, null, 2));

        return await this.getMarketplaceMessage(message);
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
    public async getDSNs(itemImageDatas: resources.ImageData[], withData: boolean = true): Promise<DSN[]> {
        const dsns: DSN[] = [];
        const imageData: resources.ImageData = await this.getPostableImageData(itemImageDatas);

        let data;
        const protocol = ProtocolDSN.SMSG;

        // this.log.debug('withData:', withData);

        if (withData) {
            // load the actual image data
            // we're not sending the image data anymore when posting the ListingItem
            data = await this.imageDataService.loadImageFile(imageData.imageHash, imageData.imageVersion);
        }

        dsns.push({
            protocol,
            encoding: withData ? imageData.encoding : undefined,
            dataId: withData ? imageData.dataId : undefined,
            data
        } as DSN);

        return dsns;
    }

    /**
     * return the resized data, or if that doesnt exist, the original one
     * @param itemImageDatas
     */
    private async getPostableImageData(itemImageDatas: resources.ImageData[]): Promise<resources.ImageData> {
        let imageData = _.find(itemImageDatas, (value) => {
            return value.imageVersion === ImageVersions.RESIZED.propName;
        });

        if (!imageData) {
            // if theres no resized version, then ORIGINAL can be used
            imageData = _.find(itemImageDatas, (value) => {
                return value.imageVersion === ImageVersions.ORIGINAL.propName;
            });

            if (!imageData) {
                // there's something wrong with the Image if original image doesnt have data
                throw new MessageException('Data for ImageVersions.ORIGINAL not found.');
            }
        }
        return imageData;
    }

    /**
     * signs message containing sellers address and ListingItem hash, proving the message is sent by the seller and with intended contents
     *
     * @param wallet
     * @param address
     * @param hash
     * @param target
     */
    private async signImageMessage(wallet: string, address: string, hash: string, target: string): Promise<string> {
        const message = {
            address,            // sellers address
            hash,               // image hash
            target              // item hash
        } as ImageAddMessage;

        return await this.coreRpcService.signMessage(wallet, address, message);
    }
}
