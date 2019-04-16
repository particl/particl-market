// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidMessage } from '../../messages/action/BidMessage';
import { MessageException } from '../../exceptions/MessageException';
import { BidCreateRequest } from '../../requests/BidCreateRequest';
import { AddressCreateRequest } from '../../requests/AddressCreateRequest';
import { BidDataCreateRequest } from '../../requests/BidDataCreateRequest';
import { BidDataValue } from '../../enums/BidDataValue';
import {HashableBidField, MPAction} from 'omp-lib/dist/interfaces/omp-enums';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { BidCreateParams } from './ModelCreateParams';
import { BidAcceptMessage } from '../../messages/action/BidAcceptMessage';
import { BidRejectMessage } from '../../messages/action/BidRejectMessage';
import { BidCancelMessage } from '../../messages/action/BidCancelMessage';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {ConfigurableHasher} from 'omp-lib/dist/hasher/hash';
import {HashableBidMessageConfig} from 'omp-lib/dist/hasher/config/bid';
import {HashMismatchException} from '../../exceptions/HashMismatchException';
import {HashableBidCreateRequestConfig} from '../../messages/hashable/config/HashableBidCreateRequestConfig';

export type BidMessageTypes = BidMessage | BidAcceptMessage | BidRejectMessage | BidCancelMessage;

export class BidFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    /**
     * create a BidCreateRequest
     * todo: implement part address validator and validate
     *
     * @param bidMessage
     * @param smsgMessage
     * @param params
     */
    public async get(bidMessage: BidMessageTypes, params: BidCreateParams, smsgMessage?: resources.SmsgMessage): Promise<BidCreateRequest> {

        // check that the bidAction is valid, throw if not
        if (this.checkBidMessageActionValidity(bidMessage, params.latestBid)) {
            const bidDataValues = {};

            // TODO: get rid of this, afaik bidDatas are not currently supported
            // copy the existing key-value pairs from latestBid.BidDatas
            if (params.latestBid && params.latestBid.BidDatas) {
                for (const bidData of params.latestBid.BidDatas) {
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

            // this.log.debug('bidDatas:', JSON.stringify(bidDatas, null, 2));

            let address;
            if (bidMessage.type === MPAction.MPA_BID) {
                address = {
                    firstName: params.address.firstName,
                    lastName: params.address.lastName,
                    addressLine1: params.address.addressLine1,
                    addressLine2: params.address.addressLine2,
                    city: params.address.city,
                    state: params.address.state,
                    zipCode: params.address.zipCode,
                    country: params.address.country
                } as AddressCreateRequest;
            }

            // create and return the request that can be used to create the bid
            const createRequest = {
                listing_item_id: params.listingItem.id,
                generatedAt: bidMessage.generated,
                type: bidMessage.type,
                bidder: params.bidder,
                address,
                bidDatas,
                hash: 'recalculateandvalidate'
            } as BidCreateRequest;

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

            // validate that the createRequest.hash should have a matching hash with the incoming or outgoing message
            if (bidMessage.hash !== createRequest.hash) {
                throw new HashMismatchException('ListingItemCreateRequest');
            }

            return createRequest;

        } else {
            throw new MessageException('Invalid MPAction.');
        }
    }

    /**
     * Checks if the type in the given BidMessage is valid for the latest bid
     *
     * @param bidMessage
     * @param latestBid
     * @returns {boolean}
     */
    private checkBidMessageActionValidity(bidMessage: BidMessageTypes, latestBid?: resources.Bid): boolean {

        if (latestBid) {
            switch (latestBid.type) {
                case MPAction.MPA_BID:
                    // if the latest bid was already bidded on, then the message needs to be something else
                    return bidMessage.type !== MPAction.MPA_BID;
                case MPAction.MPA_ACCEPT:
                    // latest bid was already accepted, any bid is invalid
                    return false;
                case MPAction.MPA_CANCEL:
                    // latest bid was cancelled, so we allow only new bids
                    return bidMessage.type === MPAction.MPA_BID;
                case MPAction.MPA_REJECT:
                    // latest bid was rejected, so we allow only new bids
                    return bidMessage.type === MPAction.MPA_BID;
                default:
                    throw new MessageException('Unknown BidMessage.type');
            }
        } else if (bidMessage.type === MPAction.MPA_BID) {
            // if no existing bid and message is MPA_BID -> true
            return true;
        }
        return false;
    }

    /**
     * todo: refactor duplicate code
     * @param {string} key
     * @param {"resources".BidData[]} bidDatas
     * @returns {any}
     */
    private getValueFromBidDatas(key: string, bidDatas: BidDataCreateRequest[]): string {
        const value = bidDatas.find(kv => kv.key === key);
        if ( value ) {
            return value.value;
        } else {
            this.log.error('Missing BidData value for key: ' + key);
            throw new MessageException('Missing BidData value for key: ' + key);
        }
    }

}
