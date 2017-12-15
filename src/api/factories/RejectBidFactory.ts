import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidMessage } from '../messages/BidMessage';

export class RejectBidFactory {

    public log: LoggerType;
    // private let rejectBids;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        // this.rejectBids.push(someRejectBid);
    }

    public get(data: BidMessage): void {
        // return listingItemHash
        return {
            hash: data.item
        } as any;
    }

}
