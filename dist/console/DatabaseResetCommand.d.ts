import { AbstractCommand } from './lib/AbstractCommand';
/**
 * DatabaseResetCommand rollback all current migrations and
 * then migrate to the latest one.
 *
 * @export
 * @class DatabaseResetCommand
 */
export declare class DatabaseResetCommand extends AbstractCommand {
    static command: string;
    static description: string;
    run(): Promise<void>;
}
