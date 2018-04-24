/**
 * MakeIntegrationTestCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
export declare class MakeIntegrationTestCommand extends AbstractMakeCommand {
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
