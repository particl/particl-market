import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidMessage } from '../messages/BidMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { MessageException } from '../exceptions/MessageException';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import * as resources from 'resources';
import {AddressCreateRequest} from '../requests/AddressCreateRequest';
import {BidDataCreateRequest} from '../requests/BidDataCreateRequest';

export class BidFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {BidMessageType} bidMessageType
     * @param {string} itemHash
     * @param {any[]} idValuePairObjects { id: 'objectid', value: 'objectvalue' }
     * @returns {Promise<BidMessage>}
     */
    public async getMessage(bidMessageType: BidMessageType, itemHash: string, idValuePairObjects?: any[]): Promise<BidMessage> {

        const message = {
            action: bidMessageType.toString(),
            item: itemHash,
            objects: idValuePairObjects
        } as BidMessage;

        return message;
    }

    /**
     * create a BidCreateRequest
     *
     * @param {BidMessage} bidMessage
     * @param {number} listingItemId
     * @param {string} bidder
     * @param {"resources".Bid} latestBid
     * @returns {Promise<BidCreateRequest>}
     */
    public async getModel(bidMessage: BidMessage, listingItemId: number, bidder: string, latestBid?: resources.Bid): Promise<BidCreateRequest> {

        if (!listingItemId) {
            throw new MessageException('Invalid listingItemId.');
        }

        // todo: implement part address validator and validate
        if (!bidder && typeof bidder !== 'string') {
            throw new MessageException('Invalid bidder.');
        }

        // check that the bidAction is valid, throw if not
        if (this.checkBidMessageActionValidity(bidMessage, latestBid)) {

            // it was, so create the bidData field
            const bidDatas: BidDataCreateRequest[] = _.map(bidMessage.objects, (value) => {
                return _.assign({}, {
                    dataId: value['id'],
                    dataValue: value['value']
                } as BidDataCreateRequest);
            });

            const firstName = this.getValueFromBidDatas('ship.firstName', bidDatas);
            const lastName = this.getValueFromBidDatas('ship.lastName', bidDatas);
            const addressLine1 = this.getValueFromBidDatas('ship.addressLine1', bidDatas);
            const addressLine2 = this.getValueFromBidDatas('ship.addressLine2', bidDatas);
            const city = this.getValueFromBidDatas('ship.city', bidDatas);
            const state = this.getValueFromBidDatas('ship.state', bidDatas);
            const zipCode = this.getValueFromBidDatas('ship.zipCode', bidDatas);

            // create and return the request that can be used to create the bid
            const bidCreateRequest = {
                address: {
                    firstName, lastName, addressLine1, addressLine2, city, state, zipCode
                } as AddressCreateRequest,
                listing_item_id: listingItemId,
                action: bidMessage.action,
                bidder,
                bidDatas
            } as BidCreateRequest;

            return bidCreateRequest;

        } else {
            throw new MessageException('Invalid BidMessageType.');
        }
    }

    /**
     * Checks if the action in the given BidMessage is valid for the latest bid
     *
     * @param bidMessage
     * @param latestBid
     * @returns {boolean}
     */
    private checkBidMessageActionValidity(bidMessage: BidMessage, latestBid?: resources.Bid): boolean {

        if (latestBid) {
            switch (latestBid.action) {
                case BidMessageType.MPA_BID:
                    // if the latest bid was allready bidded on, then the message needs to be something else
                    return bidMessage.action !== BidMessageType.MPA_BID;
                case BidMessageType.MPA_ACCEPT:
                    // latest bid was allready accepted, any bid is invalid
                    return false;
                case BidMessageType.MPA_CANCEL:
                    // latest bid was cancelled, so we allow only new bids
                    return bidMessage.action === BidMessageType.MPA_BID;
                case BidMessageType.MPA_REJECT:
                    // latest bid was rejected, so we allow only new bids
                    return bidMessage.action === BidMessageType.MPA_BID;
            }
        } else if (bidMessage.action === BidMessageType.MPA_BID) {
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
