import { Enum, EnumValue } from 'ts-enums';
import { EnvironmentType } from '../../core/helpers/Environment';

export class Command extends EnumValue {

    constructor(uniqueName: string, private name: string, private root: boolean = true, private children: Command[] = [],
                private theCommandType: EnvironmentType = EnvironmentType.ALL) {
        super(uniqueName);
    }

    get commandName(): string {
        return this.name;
    }

    get isRoot(): boolean {
        return this.root;
    }

    get childCommands(): Command[] {
        return this.children;
    }

    get commandType(): EnvironmentType {
        return this.theCommandType;
    }
}
