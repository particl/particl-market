// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { DSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageDataService } from '../../services/model/ImageDataService';
import { ListingItemImageAddMessageFactory } from './ListingItemImageAddMessageFactory';
import { MarketImageAddMessage } from '../../messages/action/MarketImageAddMessage';
import { MarketImageAddRequest } from '../../requests/action/MarketImageAddRequest';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { BaseMessageFactory } from './BaseMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';

export class MarketImageAddMessageFactory extends BaseMessageFactory {

    public log: LoggerType;

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemImageAddMessageFactory) private listingItemImageAddMessageFactory: ListingItemImageAddMessageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        super();
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param actionRequest
     * @returns {Promise<MarketplaceMessage>}
     */
    public async get(actionRequest: MarketImageAddRequest): Promise<MarketplaceMessage> {

        if (!actionRequest.image) {
            throw new MissingParamException('image');
        }

        if (!actionRequest.market) {
            throw new MissingParamException('market');
        }

        // hash should have been calculated when image was created
        const data: DSN[] = await this.listingItemImageAddMessageFactory.getDSNs(actionRequest.image.ImageDatas, actionRequest.withData);

        const message = {
            type: MPActionExtended.MPA_MARKET_IMAGE_ADD,
            hash: actionRequest.image.hash,
            data,
            target: actionRequest.market.hash,
            generated: Date.now()
        } as MarketImageAddMessage;

        return await this.getMarketplaceMessage(message);
    }
}
