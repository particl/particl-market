export interface Command {
    run(): Promise<void>;
}
export declare class AbstractCommand {
    static command: string;
    static description: string;
    static action(command: Command): Promise<void>;
    context: any;
    constructor(context?: any);
    run(): Promise<void>;
}
