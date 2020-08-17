// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { DSN } from 'omp-lib/dist/interfaces/dsn';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';
import { ListingItemImageAddMessageFactory } from './ListingItemImageAddMessageFactory';
import { MarketImageAddMessage } from '../../messages/action/MarketImageAddMessage';
import { MarketImageAddRequest } from '../../requests/action/MarketImageAddRequest';
import { MissingParamException } from '../../exceptions/MissingParamException';

export class MarketImageAddMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemImageAddMessageFactory) private listingItemImageAddMessageFactory: ListingItemImageAddMessageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @returns {Promise<MarketImageAddMessage>}
     * @param actionRequest
     */
    public async get(actionRequest: MarketImageAddRequest): Promise<MarketImageAddMessage> {

        if (!actionRequest.image) {
            throw new MissingParamException('image');
        }

        if (!actionRequest.market) {
            throw new MissingParamException('market');
        }

        // hash should have been calculated when image was created
        const data: DSN[] = await this.listingItemImageAddMessageFactory.getDSNs(actionRequest.image.ItemImageDatas, actionRequest.withData);

        const message = {
            type: MPActionExtended.MPA_MARKET_IMAGE_ADD,
            hash: actionRequest.image.hash,
            data,
            target: actionRequest.market.hash,
            generated: Date.now()
        } as MarketImageAddMessage;

        return message;
    }

}
