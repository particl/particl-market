// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { MarketAddMessage } from '../../messages/action/MarketAddMessage';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { MarketImageAddMessageFactory } from './MarketImageAddMessageFactory';
import { MarketAddRequest } from '../../requests/action/MarketAddRequest';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableMarketAddMessageConfig } from '../hashableconfig/message/HashableMarketAddMessageConfig';
import { ContentReference, DSN } from 'omp-lib/dist/interfaces/dsn';
import { ListingItemImageAddMessageFactory } from './ListingItemImageAddMessageFactory';
import { BaseMessageFactory } from './BaseMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';

export class MarketAddMessageFactory extends BaseMessageFactory {

    public log: LoggerType;

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Factory) @named(Targets.Factory.message.MarketImageAddMessageFactory) private marketImageAddMessageFactory: MarketImageAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemImageAddMessageFactory) private listingItemImageAddMessageFactory: ListingItemImageAddMessageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        super();
        this.log = new Logger(__filename);
    }

    /**
     * Creates a MarketAddMessage from given parameters
     *
     * @param actionRequest
     * @returns {Promise<MarketplaceMessage>}
     */

    public async get(actionRequest: MarketAddRequest): Promise<MarketplaceMessage> {

        if (!actionRequest.market) {
            throw new MissingParamException('market');
        }

        let image: ContentReference | undefined;
        if (!_.isNil(actionRequest.market.Image)) {
            const imageData: DSN[] = await this.listingItemImageAddMessageFactory.getDSNs(actionRequest.market.Image.ImageDatas, false);
            image = {
                hash: actionRequest.market.Image.hash,
                data: imageData
            } as ContentReference;
        }

        const message = {
            name: actionRequest.market.name,
            description: actionRequest.market.description || '',
            type: MPActionExtended.MPA_MARKET_ADD,
            marketType: actionRequest.market.type,
            region: actionRequest.market.region,
            receiveKey: actionRequest.market.receiveKey,
            publishKey: actionRequest.market.publishKey,
            image,
            generated: Date.now(),
            hash: 'recalculateandvalidate'
        } as MarketAddMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableMarketAddMessageConfig());

        return await this.getMarketplaceMessage(message);
    }
}
