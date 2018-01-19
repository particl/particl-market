import { CommandEnumType } from './CommandEnumType';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';

export class BaseCommand {

    public commands: CommandEnumType = new CommandEnumType();
    public command: Command;

    constructor(command: Command, protected rpcCommandFactory: RpcCommandFactory) {
        this.command = command;
        this.commands = new CommandEnumType();
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
    public async executeNext(data: RpcRequest): Promise<any> {
        const commandName = data.params.shift();
        const rpcCommand = this.rpcCommandFactory.get(this.command);
        return await rpcCommand.execute(data);
    }
}
