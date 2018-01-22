import { CommandEnumType, Commands } from './CommandEnumType';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import * as _ from 'lodash';
import { NotFoundException } from '../exceptions/NotFoundException';

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
        // find a matching command from current commands childCommands
        const commandType = _.find(this.getChildCommands(), command => command.commandName === commandName);
        if (commandType) {
            const rpcCommand = commandFactory.get(commandType);
            // execute
            return await rpcCommand.execute(request, commandFactory);
        } else {
            throw new NotFoundException('Unknown subcommand: ' + commandName + '\n');
        }
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
