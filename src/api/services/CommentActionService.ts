import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';


export class CommentActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    /**
     * Send a public Comment
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {module:resources.Profile} bidderProfile
     * @param {any[]} additionalParams
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send(@request(CommentCreateRequest) data: CommentCreateRequest): Promise<SmsgSendResponse> {
        // validate
        // create
        // send
    }
}
