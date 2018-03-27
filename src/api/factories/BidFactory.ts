import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidMessage } from '../messages/BidMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { MessageException } from '../exceptions/MessageException';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import * as resources from 'resources';

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
     * @param bidMessage
     * @param listingItemId
     * @param latestBid
     * @returns {Promise<BidCreateRequest>}
     */
    public async getModel(bidMessage: BidMessage, listingItemId: number, latestBid?: resources.Bid): Promise<BidCreateRequest> {

        if (!listingItemId) {
            throw new MessageException('Invalid listingItemId.');
        }

        // check that the bidAction is valid, throw if not
        if (this.checkBidMessageActionValidity(bidMessage, latestBid)) {

            // it was, so create the bidData field
            const bidData = _.map(bidMessage.objects, (value) => {
                return _.assign({}, {
                    dataId: value['id'],
                    dataValue: value['value']
                });
            });

            // create and return the request that can be used to create the bid
            const bidCreateRequest = new BidCreateRequest();
            bidCreateRequest.listing_item_id = listingItemId;
            bidCreateRequest.action = bidMessage.action;
            bidCreateRequest.bidData = bidData;
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

}
