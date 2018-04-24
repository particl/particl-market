import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
export declare class MakeSeedCommand extends AbstractMakeCommand {
    static command: string;
    static description: string;
    target: string;
    type: string;
    suffix: string;
    template: string;
    updateTargets: boolean;
    parseName(suffix?: string, prefix?: string): (name: string) => string;
}
