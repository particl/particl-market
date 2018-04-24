import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
export declare class MakeMigrationCommand extends AbstractMakeCommand {
    static command: string;
    static description: string;
    target: string;
    type: string;
    suffix: string;
    template: string;
    updateTargets: boolean;
    run(): Promise<void>;
    private getTimestamp();
}
