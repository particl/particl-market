// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../../core/Logger';
import { Core, Types } from '../../../../constants';
import { BidMessage } from '../../../messages/action/BidMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MessageFactoryInterface } from '../MessageFactoryInterface';
import { BidMessageCreateParams } from '../MessageCreateParams';
import { BuyerData, PaymentData } from 'omp-lib/dist/interfaces/omp';
import { HashableBidMessageConfig } from 'omp-lib/dist/hasher/config/bid';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';

export class BidMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * NOTE! even if its basicly possible, this should not be used to generate new BidMessages,
     * but to regenarate the already received ones.
     * todo: we could actually also just get the already received and stored smsgmessage and use that,
     * todo: but before we do that, we should move (some of) the factories to omp-lib
     *
     * @param params
     *      config: BidConfiguration
     *          shippingAddress: ShippingAddress
     *          cryptocurrency: Cryptocurrency
     *          escrow: EscrowType
     *          objects?: KVS[]
     *      itemHash: string
     *      generated: number
     * @returns {Promise<BidMessage>}
     */
    public async get(params: BidMessageCreateParams): Promise<BidMessage> {

        // we need to be able to pass the generated timestamp to be able to recreate messages
        const generated = params.generated ? params.generated : +new Date().getTime();

        const message = {
            type: MPAction.MPA_BID,
            generated,                          // timestamp, when the bidder generated this bid
            item: params.itemHash,              // item hash
            buyer: {
                shippingAddress: params.config.shippingAddress,
                payment: {
                    // todo
                } as PaymentData                     // payment data will be added later by the omp transactionbuilder
            } as BuyerData,                     // buyer payment and other purchase details like shipping address

            objects: params.config.objects,
            hash: 'recalculateandvalidate'
        } as BidMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableBidMessageConfig());
        return message;
    }

}
