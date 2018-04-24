import { AbstractCommand } from './lib/AbstractCommand';
/**
 * DatabaseSeedCommand
 *
 * @export
 * @class DatabaseResetCommand
 */
export declare class DatabaseSeedCommand extends AbstractCommand {
    static command: string;
    static description: string;
    run(): Promise<void>;
}
