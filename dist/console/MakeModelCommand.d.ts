import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
import { MakeMigrationCommand } from './MakeMigrationCommand';
export declare class MakeModelCommand extends AbstractMakeCommand {
    static command: string;
    static description: string;
    type: string;
    suffix: string;
    template: string;
    target: string;
    makeMigrationCommand: MakeMigrationCommand;
    run(): Promise<void>;
    write(): Promise<void>;
    private askMetaData(context);
}
