import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
import { MakeRequestCommand } from './MakeRequestCommand';
import { MakeIntegrationTestCommand } from './MakeIntegrationTestCommand';
export declare class MakeResourceCommand extends AbstractMakeCommand {
    static command: string;
    static description: string;
    type: string;
    suffix: string;
    prefix: string;
    context: any;
    properties: any[];
    makeModelCommand: AbstractMakeCommand;
    makeRepoCommand: AbstractMakeCommand;
    makeServiceCommand: AbstractMakeCommand;
    makeCommandCommand: AbstractMakeCommand;
    makeCreateRequestCommand: MakeRequestCommand;
    makeUpdateRequestCommand: MakeRequestCommand;
    makeIntegrationTestCommand: MakeIntegrationTestCommand;
    run(): Promise<void>;
    write(): Promise<void>;
}
