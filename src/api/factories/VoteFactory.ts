import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { VoteMessage } from '../messages/VoteMessage';
import { VoteMessageType } from '../enums/VoteMessageType';

export class VoteFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {VoteMessageType} voteMessageType
     * @param {string} itemHash
     * @param {IdValuePair[]} idValuePairObjects
     * @returns {Promise<VoteMessage>}
     */
    public async getMessage(voteMessageType: VoteMessageType, data?: any[]): Promise<VoteMessage> {
        const message = {
            action: voteMessageType,
            objects: data
        } as VoteMessage;

        return message;
    }
}
