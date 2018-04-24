import { AbstractCommand } from './lib/AbstractCommand';
export declare class UpdateTargetsCommand extends AbstractCommand {
    static command: string;
    static description: string;
    template: string;
    targetFile: string;
    run(): Promise<void>;
    private getFiles();
    private divideFilePath(filePath);
    private parseFilePath(filePath);
}
