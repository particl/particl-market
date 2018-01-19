import { Enum, EnumValue } from 'ts-enums';

export class Command extends EnumValue {

    constructor(uniqueName: string, private name: string, private root: boolean = true, private children: Command[] = []) {
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

}
