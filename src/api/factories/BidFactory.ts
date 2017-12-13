import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { Bid } from '../models/Bid';
import { BidMessage } from '../messages/BidMessage';
import { BidStatus } from '../enums/BidStatus';
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

    public get(data: BidMessage): Promise<Bid> {

        // set dataId and dataValue
        const bidData = _.map(data.objects, (value) => {
            return _.assign({}, {
                dataId: value['id'],
                dataValue: value['value']
            });
        });

        // return bid object
        return {
            status: BidStatus.ACTIVE,
            listing_item_id: data.item,
            bidData
        } as any;
    }

}
