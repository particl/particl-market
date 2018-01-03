import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidMessage } from '../messages/BidMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { MessageException } from '../exceptions/MessageException';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import { BidMessageType } from '../enums/BidMessageType';
import * as resources from 'resources';

export class BidFactory {

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
     * @param listingItemId
     * @param latestBid
     * @returns {Promise<BidCreateRequest>}
     */
    public async getModel(bidMessage: BidMessage, listingItemId: number, latestBid?: resources.Bid): Promise<BidCreateRequest> {

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
            return {
                listing_item_id: listingItemId,
                action: bidMessage.action,
                bidData
            } as BidCreateRequest;

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

        // if no existing bid and message is not MPA_BID -> error
        if (_.isEmpty(latestBid) && bidMessage.action !== BidMessageType.MPA_BID) {
            throw new MessageException('Invalid BidMessageType.');
        }

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
    }

}
