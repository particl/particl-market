import { inject, named } from 'inversify';
import { Types, Core } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';

export class ServerStartedListener implements interfaces.Listener {

    public static Event = Symbol('ServerStartedListenerEvent');

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public act(payload: any): void {
        this.log.info('Receive event ServerStartedListenerEvent', payload);

        // todo: later seed the default categories here

    }

}
