import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { BidMessage } from '../messages/BidMessage';
import { BidStatus } from '../enums/BidStatus';
import { Bid } from '../models/Bid';
import { MessageException } from '../exceptions/MessageException';

import * as _ from 'lodash';

export class BidFactory {

    public log: LoggerType;
    // private let bids;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        // this.bids.push(someBid);
    }

    /**
     * data:
     * action: data.action
     * item: data.item
     * object?: data.object
     */

    public get(data: BidMessage, listingItemId: number, latestBid?: Bid): Promise<Bid> {
        let returnData = {};

        switch (data.action) {
            case 'MPA_BID':
                // set the bidData fields
                const bidData = _.map(data.objects, (value) => {
                return _.assign({}, {
                        dataId: value['id'],
                        dataValue: value['value']
                    });
                });

                returnData = {
                    status: BidStatus.ACTIVE,
                    bidData
                };
                break;

            case 'MPA_CANCEL':
                if (this.checkValidBid(BidStatus.CANCELLED, latestBid)) {
                    returnData['status'] = BidStatus.CANCELLED;
                }
                break;

            case 'MPA_REJECT':
                if (this.checkValidBid(BidStatus.REJECTED, latestBid)) {
                    returnData['status'] = BidStatus.REJECTED;
                }
                break;

            case 'MPA_ACCEPT':
                if (this.checkValidBid(BidStatus.ACCEPTED, latestBid)) {
                    returnData['status'] = BidStatus.ACCEPTED;
                }
                break;
        }
        // setting the bid relation with listingItem
        returnData['listing_item_id'] = listingItemId;

        return returnData as any;
    }

    private checkValidBid(action: string, latestBid?: Bid): boolean {
        // if bid not found for the given listing item hash
        if (!latestBid) {
            this.log.warn(`Bid with the listing Item was not found!`);
            throw new MessageException('Bid with the listing Item was not found!');

        } else if (latestBid.Status !== BidStatus.ACTIVE) {
           throw new MessageException(`Bid can not be ${action} because it was already been ${latestBid.Status}`);
        }
        return true;
    }
}
