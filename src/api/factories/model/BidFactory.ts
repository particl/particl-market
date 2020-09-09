// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidMessage } from '../../messages/action/BidMessage';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { BidDataCreateRequest } from '../../requests/model/BidDataCreateRequest';
import { HashableBidField, MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { BidCreateParams } from './ModelCreateParams';
import { BidAcceptMessage } from '../../messages/action/BidAcceptMessage';
import { BidRejectMessage } from '../../messages/action/BidRejectMessage';
import { BidCancelMessage } from '../../messages/action/BidCancelMessage';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidCreateRequestConfig } from '../hashableconfig/createrequest/HashableBidCreateRequestConfig';
import { EscrowLockMessage } from '../../messages/action/EscrowLockMessage';
import { EscrowReleaseMessage } from '../../messages/action/EscrowReleaseMessage';
import { EscrowRefundMessage } from '../../messages/action/EscrowRefundMessage';
import { EscrowCompleteMessage } from '../../messages/action/EscrowCompleteMessage';
import { HashableBidBasicCreateRequestConfig } from '../hashableconfig/createrequest/HashableBidBasicCreateRequestConfig';
import { HashableBidReleaseField } from '../hashableconfig/HashableField';
import { OrderItemShipMessage } from '../../messages/action/OrderItemShipMessage';

export type BidMessageTypes = BidMessage | BidAcceptMessage | BidRejectMessage | BidCancelMessage
    | EscrowLockMessage | EscrowReleaseMessage | EscrowRefundMessage | EscrowCompleteMessage | OrderItemShipMessage;

export type BidMessageTypesWithParentBid = BidAcceptMessage | BidRejectMessage | BidCancelMessage
    | EscrowLockMessage | EscrowReleaseMessage | EscrowRefundMessage | EscrowCompleteMessage | OrderItemShipMessage;

export class BidFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    /**
     * create a BidCreateRequest
     *
     * @param params
     */
    public async get(params: BidCreateParams): Promise<BidCreateRequest> {

        const actionMessage: BidMessageTypes = params.actionMessage;
        const smsgMessage: resources.SmsgMessage | undefined = params.smsgMessage;
        const bidDataValues = {};

        // copy the existing key-value pairs from parentBid.BidDatas
        if (params.parentBid && params.parentBid.BidDatas) {
            for (const bidData of params.parentBid.BidDatas) {
                bidDataValues[bidData.key] = bidData.value;
            }
        }

        if (params.parentBid && params.parentBid.ChildBids) {
            for (const childBid of params.parentBid.ChildBids) {
                if (childBid.BidDatas) {
                    for (const bidData of childBid.BidDatas) {
                        bidDataValues[bidData.key] = bidData.value;
                    }
                }
            }
        }

        // copy the new key-value pairs from bidMessage overriding the old if some exist
        if (actionMessage.objects) {
            for (const bidData of actionMessage.objects) {
                bidDataValues[bidData.key] = bidData.value;
            }
        }

        // create bidDataCreateRequests
        const bidDatas = Object.keys(bidDataValues).map((key) => {
            return {
                key,
                value: bidDataValues[key]
            } as BidDataCreateRequest;
        });

        const createRequest = {
            // profile_id: params.profile.id,
            identity_id: params.identity.id,
            listing_item_id: params.listingItem.id,

            generatedAt: actionMessage.generated,
            type: actionMessage.type,
            bidder: params.identity.address,
            address: params.address,
            bidDatas,
            hash: 'recalculateandvalidate',

            msgid: smsgMessage ? smsgMessage.msgid : undefined,
            postedAt: smsgMessage ? smsgMessage.sent : undefined,
            expiredAt: smsgMessage ? smsgMessage.expiration : undefined,
            receivedAt: smsgMessage ? smsgMessage.received : undefined
        } as BidCreateRequest;

        if (params.parentBid) {
            createRequest.parent_bid_id = params.parentBid.id;
        }

        if (MPAction.MPA_BID === createRequest.type) {
            // pass the values not included directly in BidCreateRequest, but needed for hashing, as extra config values to the hasher
            createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableBidCreateRequestConfig([{
                value: params.listingItem.hash,
                to: HashableBidField.ITEM_HASH
            }, {
                value: params.listingItem.PaymentInformation.Escrow.type,
                to: HashableBidField.PAYMENT_ESCROW_TYPE
            }, {
                value: params.listingItem.PaymentInformation.ItemPrice.currency,
                to: HashableBidField.PAYMENT_CRYPTO
            }]));
        } else {
            createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableBidBasicCreateRequestConfig([{
                value: (actionMessage as BidMessageTypesWithParentBid).bid,
                to: HashableBidReleaseField.BID_HASH
            }]));
        }

        // this.log.debug('get(), createRequest: ', JSON.stringify(createRequest, null, 2));
        this.log.debug('get(), bidMessage.hash:', actionMessage.hash);
        this.log.debug('get(), createRequest.hash:', createRequest.hash);

        return createRequest;
    }
}
