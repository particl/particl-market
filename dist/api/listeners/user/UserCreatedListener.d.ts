import { Logger as LoggerType } from '../../../core/Logger';
export declare class UserCreatedListener implements interfaces.Listener {
    static Event: symbol;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    act(user: any): void;
}
