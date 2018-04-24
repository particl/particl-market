/**
 * MakeApiTestCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
export declare class MakeApiTestCommand extends AbstractMakeCommand {
    static command: string;
    static description: string;
    target: string;
    type: string;
    suffix: string;
    template: string;
    updateTargets: boolean;
    isTest: boolean;
    run(): Promise<void>;
    write(): Promise<void>;
}
