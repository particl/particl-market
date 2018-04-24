import { EnumValue } from 'ts-enums';
import { EnvironmentType } from '../../core/helpers/Environment';
export declare class Command extends EnumValue {
    private name;
    private root;
    private children;
    private theCommandType;
    constructor(uniqueName: string, name: string, root?: boolean, children?: Command[], theCommandType?: EnvironmentType);
    readonly commandName: string;
    readonly isRoot: boolean;
    readonly childCommands: Command[];
    readonly commandType: EnvironmentType;
}
