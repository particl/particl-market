import { CommandEnumType, Commands } from './CommandEnumType';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';

export class BaseCommand {

    public commands: CommandEnumType;
    public command: Command;

    constructor(command: Command) {
        this.command = command;
        this.commands = Commands;
    }

    public getName(): string {
        return this.command.commandName;
    }

    public getCommand(): Command {
        return this.command;
    }

    /**
     * returns the child Commands of this command
     * @returns {Command[]}
     */
    public getChildCommands(): Command[] {
        return this.command.childCommands;
    }

    /**
     * execute the next command in data.params
     *
     * @param rpcCommandFactory
     * @param data
     * @returns {Promise<Bookshelf.Model<any>>}
     */
    public async executeNext(request: RpcRequest, commandFactory: RpcCommandFactory): Promise<any> {
        const commandName = request.params.shift();
        const rpcCommand = commandFactory.get(commandName);
        return await rpcCommand.execute(request, commandFactory);
    }

    public help(): string {
        return ' <TODO: Command.help()>';
    }

    public description(): string {
        return 'TODO: Command.description()';
    }

    public example(): any {
        return null;
    }

}
