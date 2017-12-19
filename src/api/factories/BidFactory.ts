import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { BidMessage } from '../messages/BidMessage';
import { BidStatus } from '../enums/BidStatus';
import { Bid } from '../models/Bid';

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

    public get(data: BidMessage): Promise<Bid> {
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
                returnData['status'] = BidStatus.CANCELLED;
                break;

            case 'MPA_REJECT':
                returnData['status'] = BidStatus.REJECTED;
                break;

            case 'MPA_ACCEPT':
                returnData['status'] = BidStatus.ACCEPTED;
                break;
        }

        return returnData as any;
    }
}
