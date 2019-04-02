// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidMessage } from '../../messages/actions/BidMessage';
import { MessageException } from '../../exceptions/MessageException';
import { BidCreateRequest } from '../../requests/BidCreateRequest';
import { AddressCreateRequest } from '../../requests/AddressCreateRequest';
import { BidDataCreateRequest } from '../../requests/BidDataCreateRequest';
import { BidDataValue } from '../../enums/BidDataValue';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { BidCreateParams } from './ModelCreateParams';
import { BidAcceptMessage } from '../../messages/actions/BidAcceptMessage';
import { BidRejectMessage } from '../../messages/actions/BidRejectMessage';
import { BidCancelMessage } from '../../messages/actions/BidCancelMessage';

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
     *
     * @param bidMessage
     * @param smsgMessage
     * @param params
     */
    public async get(bidMessage: BidMessageTypes, params: BidCreateParams, smsgMessage?: resources.SmsgMessage): Promise<BidCreateRequest> {

        if (!params.listingItemId) {
            throw new MessageException('Invalid listingItemId.');
        }

        // todo: implement part address validator and validate
        if (!params.bidder && typeof params.bidder !== 'string') {
            throw new MessageException('Invalid bidder.');
        }

        // check that the bidAction is valid, throw if not
        if (this.checkBidMessageActionValidity(bidMessage, params.latestBid)) {
            const bidDataValues = {};

            // copy the existing key-value pairs from latestBid.BidDatas
            if (params.latestBid && params.latestBid.BidDatas) {
                for (const bidData of params.latestBid.BidDatas) {
                    bidDataValues[bidData.dataId] = bidData.dataValue;
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
                    dataId: key,
                    dataValue: bidDataValues[key]
                } as BidDataCreateRequest;
            });

            // this.log.debug('bidDatas:', JSON.stringify(bidDatas, null, 2));

            let address;
            if (bidMessage.type === MPAction.MPA_BID) {
                const firstName = this.getValueFromBidDatas(BidDataValue.SHIPPING_ADDRESS_FIRST_NAME, bidDatas);
                const lastName = this.getValueFromBidDatas(BidDataValue.SHIPPING_ADDRESS_LAST_NAME, bidDatas);
                const addressLine1 = this.getValueFromBidDatas(BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1, bidDatas);
                const addressLine2 = this.getValueFromBidDatas(BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2, bidDatas);
                const city = this.getValueFromBidDatas(BidDataValue.SHIPPING_ADDRESS_CITY, bidDatas);
                const state = this.getValueFromBidDatas(BidDataValue.SHIPPING_ADDRESS_STATE, bidDatas);
                const zipCode = this.getValueFromBidDatas(BidDataValue.SHIPPING_ADDRESS_ZIP_CODE, bidDatas);
                const country = this.getValueFromBidDatas(BidDataValue.SHIPPING_ADDRESS_COUNTRY, bidDatas);

                address = {
                    firstName, lastName, addressLine1, addressLine2, city, state, zipCode, country
                } as AddressCreateRequest;
            }

            let hash = '';
            if (bidMessage.type === MPAction.MPA_BID) {
                hash = bidMessage.hash;
            }

            // create and return the request that can be used to create the bid
            const bidCreateRequest = {
                type: bidMessage.type,
                hash,
                address,
                listing_item_id: params.listingItemId,
                bidder: params.bidder,
                bidDatas
            } as BidCreateRequest;

            return bidCreateRequest;

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
                case MPAction.MPA_BID.toString():
                    // if the latest bid was allready bidded on, then the message needs to be something else
                    return bidMessage.type !== MPAction.MPA_BID.toString();
                case MPAction.MPA_ACCEPT.toString():
                    // latest bid was allready accepted, any bid is invalid
                    return false;
                case MPAction.MPA_CANCEL.toString():
                    // latest bid was cancelled, so we allow only new bids
                    return bidMessage.type === MPAction.MPA_BID.toString();
                case MPAction.MPA_REJECT.toString():
                    // latest bid was rejected, so we allow only new bids
                    return bidMessage.type === MPAction.MPA_BID.toString();
                default:
                    throw new MessageException('Unknown BidMessage.type');
            }
        } else if (bidMessage.type === MPAction.MPA_BID.toString()) {
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
        const value = bidDatas.find(kv => kv.dataId === key);
        if ( value ) {
            return value.dataValue;
        } else {
            this.log.error('Missing BidData value for key: ' + key);
            throw new MessageException('Missing BidData value for key: ' + key);
        }
    }

}
