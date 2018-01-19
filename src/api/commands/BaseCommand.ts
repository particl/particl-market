import { CommandEnumType } from './CommandEnumType';
import { Command } from './Command';

export class BaseCommand {

    public commands: CommandEnumType = new CommandEnumType();
    public command: Command;

    constructor(command: Command) {
        this.command = command;
        this.commands = new CommandEnumType();
    }

    public getName(): string {
        return this.command.commandName;
    }

    public getCommand(): Command {
        return this.command;
    }

    public getChildCommands(): Command[] {
        return this.command.childCommands;
    }

}
