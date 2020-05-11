// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidMessage } from '../../messages/action/BidMessage';
import { MessageException } from '../../exceptions/MessageException';
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
     * @param bidMessage
     * @param smsgMessage
     */
    public async get(params: BidCreateParams, bidMessage: BidMessageTypes, smsgMessage: resources.SmsgMessage): Promise<BidCreateRequest> {

        // check that the bidAction is valid
        if (this.checkBidMessageActionValidity(bidMessage, params.parentBid)) {
            const bidDataValues = {};

            // copy the existing key-value pairs from parentBid.BidDatas
            if (params.parentBid && params.parentBid.BidDatas) {
                for (const bidData of params.parentBid.BidDatas) {
                    bidDataValues[bidData.key] = bidData.value;
                }
            }

            // copy the new key-value pairs from bidMessage overriding the old if some exist
            if (bidMessage.objects) {
                for (const bidData of bidMessage.objects) {
                    bidDataValues[bidData.key] = bidData.value;
                }
            }

            // create bidDataCreateRequests
            const bidDatas = Object.keys(bidDataValues).map( (key) => {
                return {
                    key,
                    value: bidDataValues[key]
                } as BidDataCreateRequest;
            });

            // create and return the request that can be used to create the bid
            const createRequest = {
                msgid: smsgMessage.msgid,
                listing_item_id: params.listingItem.id,
                generatedAt: bidMessage.generated,
                type: bidMessage.type,
                bidder: params.bidder,
                address: params.address,
                bidDatas,
                hash: 'recalculateandvalidate'
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
                    value: (bidMessage as BidMessageTypesWithParentBid).bid,
                    to: HashableBidReleaseField.BID_HASH
                }]));
            }

            this.log.debug('get(), createRequest: ', JSON.stringify(createRequest, null, 2));
            this.log.debug('bidMessage.hash:', bidMessage.hash);
            this.log.debug('createRequest.hash:', createRequest.hash);

            // todo: when called from beforePost(), we dont have the bidMessage.hash
            // validate that the createRequest.hash should have a matching hash with the incoming or outgoing message
            // if (bidMessage.hash !== createRequest.hash) {
            //    const error = new HashMismatchException('BidCreateRequest', bidMessage.hash, createRequest.hash);
            //    this.log.error(error.getMessage());
            //    throw error;
            // }

            return createRequest;

        } else {
            this.log.error('Invalid MPAction.');
            throw new MessageException('Invalid MPAction.');
        }
    }

    /**
     * Checks if the type in the given BidMessage is valid for the latest bid
     *
     * @param bidMessage
     * @param parentBid
     * @returns {boolean}
     */
    private checkBidMessageActionValidity(bidMessage: BidMessageTypes, parentBid?: resources.Bid): boolean {

        if (parentBid) {
            // todo: might be that parentBid is always MPAction.MPA_BID, this might need to be fixed
            switch (parentBid.type) {
                case MPAction.MPA_BID:
                    // if the parent bid was already bidded on, then the message needs to be something else
                    return bidMessage.type !== MPAction.MPA_BID;
                case MPAction.MPA_ACCEPT:
                    // parent bid was already accepted, any bid is invalid
                    return false;
                case MPAction.MPA_CANCEL:
                    // parent bid was cancelled, so we allow only new bids
                    return bidMessage.type === MPAction.MPA_BID;
                case MPAction.MPA_REJECT:
                    // parent bid was rejected, so we allow only new bids
                    return bidMessage.type === MPAction.MPA_BID;
                default:
                    const exception = new MessageException('Unknown BidMessage.type');
                    this.log.error(exception.getMessage());
                    throw exception;
            }
        } else if (bidMessage.type === MPAction.MPA_BID) {
            // if no existing bid and message is MPA_BID -> true
            return true;
        }
        return false;
    }

}
