import { inject, named } from 'inversify';
import { validate } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import {ActionMessageInterface} from "../messages/ActionMessageInterface";

export class TestMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async process( message: ActionMessageInterface ): Promise<void> {
        //
    }

}
