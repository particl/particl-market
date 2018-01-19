import { CommandEnumType } from './CommandEnumType';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';

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

    /**
     * execute the next command in data.params
     *
     * @param rpcCommandFactory
     * @param data
     * @returns {Promise<Bookshelf.Model<any>>}
     */
    public async executeNext(rpcCommandFactory: RpcCommandFactory, data: RpcRequest): Promise<any> {
        const commandName = data.params.shift();
        const rpcCommand = rpcCommandFactory.get(commandName);
        return await rpcCommand.execute(data);
    }
}
