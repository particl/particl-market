/**
 * MakeRequestCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
export declare class MakeRequestCommand extends AbstractMakeCommand {
    static command: string;
    static description: string;
    type: string;
    suffix: string;
    prefix: string;
    template: string;
    target: string;
    constructor(context: any, prefix?: string);
}
