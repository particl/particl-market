import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { BidMessage } from '../messages/BidMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { Bid } from '../models/Bid';
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
     *
     * @param bidMessage
     * @param listingItemId
     * @param latestBid
     * @returns {{}}
     */
    public async getModel(bidMessage: BidMessage, listingItemId: number, latestBid?: resources.Bid): Promise<BidCreateRequest> {

        // check that the bidAction is valid, throw if not
        if (this.checkBidMessageActionValidity(bidMessage, latestBid)) {

            // it was, so create and return the request
            return {
                listing_item_id: listingItemId,
                status: bidMessage.action
            } as BidCreateRequest;

        } else {
            throw new MessageException('Invalid BidMessageType.');
        }




        switch (bidMessage.action) {
            case BidMessageType.MPA_BID:
                return await this.getBidModel(bidMessage, escrow, address);

                // setting the bid relation with listingItem
                bidCreateRequest.listing_item_id = listingItem.id;

                // set the bidData fields
                const bidData = _.map(bidMessage.objects, (value) => {
                return _.assign({}, {
                        dataId: value['id'],
                        dataValue: value['value']
                    });
                });

                bidCreateRequest = {
                    status: BidMessageType.MPA_BID,
                    bidData
                };
                break;

            case BidMessageType.MPA_CANCEL:
                if (this.checkValidBid(BidMessageType.MPA_CANCEL, latestBid)) {
                    bidCreateRequest['status'] = BidMessageType.MPA_CANCEL;
                }
                break;

            case BidMessageType.MPA_REJECT:
                if (this.checkValidBid(BidMessageType.MPA_REJECT, latestBid)) {
                    bidCreateRequest['status'] = BidMessageType.MPA_REJECT;
                }
                break;

            case BidMessageType.MPA_ACCEPT:
                if (this.checkValidBid(BidMessageType.MPA_ACCEPT, latestBid)) {
                    bidCreateRequest['status'] = BidMessageType.MPA_ACCEPT;
                }
                break;
        }
        // setting the bid relation with listingItem
        bidCreateRequest['listing_item_id'] = listingItemId;

        return bidCreateRequest;
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

        // TODO: this wont work
        switch (latestBid.status) {
            case BidMessageType.MPA_BID:      // only active bid can be bidded on
                return bidMessage.action === BidMessageType.MPA_BID;
            case BidMessageType.MPA_ACCEPT:    // latest bid was allready accepted
                return false;
            case BidMessageType.MPA_CANCEL:   // latest bid was cancelled, so we allow new bids
                return bidMessage.action === BidMessageType.MPA_BID;
            case BidMessageType.MPA_REJECT:    // latest bid was rejected, so we allow new bids
                return bidMessage.action === BidMessageType.MPA_BID;
        }
    }

}
