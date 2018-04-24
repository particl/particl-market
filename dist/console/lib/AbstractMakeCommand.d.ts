export interface MakeCommand {
    context: any;
    type: string;
    suffix: string;
    template: string;
    target: string;
    updateTargets: boolean;
    run(): Promise<void>;
    write(): Promise<void>;
}
export declare class AbstractMakeCommand {
    static command: string;
    static description: string;
    static action(command: MakeCommand): Promise<void>;
    context: any;
    type: string;
    suffix: string;
    prefix: string;
    template: string;
    target: string;
    updateTargets: boolean;
    isTest: boolean;
    constructor(context?: any);
    run(): Promise<void>;
    write(): Promise<void>;
    buildFilePath: (targetPath: string, fileName: string, isTest?: boolean, extension?: string) => string;
    parseName(suffix?: string, prefix?: string): (name: string) => string;
    askFileName(context: any, name: string, suffix: string, prefix: string): Promise<any>;
}
