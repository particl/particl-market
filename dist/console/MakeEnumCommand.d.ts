import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
export declare class MakeEnumCommand extends AbstractMakeCommand {
    static command: string;
    static description: string;
    type: string;
    suffix: string;
    template: string;
    target: string;
    updateTargets: boolean;
    run(): Promise<void>;
    write(): Promise<void>;
    private askMetaData(context);
    private askProperties(name);
}
