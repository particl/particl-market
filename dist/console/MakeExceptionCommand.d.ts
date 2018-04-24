/**
 * MakeExceptionCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
export declare class MakeExceptionCommand extends AbstractMakeCommand {
    static command: string;
    static description: string;
    type: string;
    suffix: string;
    template: string;
    target: string;
}
