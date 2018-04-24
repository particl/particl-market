import { CommandEnumType } from './CommandEnumType';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
export declare class BaseCommand {
    commands: CommandEnumType;
    command: Command;
    constructor(command: Command);
    getName(): string;
    getCommand(): Command;
    /**
     * returns the child Commands of this command
     * @returns {Command[]}
     */
    getChildCommands(): Command[];
    /**
     * execute the next command in data.params
     *
     * @param rpcCommandFactory
     * @param data
     * @returns {Promise<Bookshelf.Model<any>>}
     */
    executeNext(request: RpcRequest, commandFactory: RpcCommandFactory): Promise<any>;
    help(): string;
    usage(): string;
    description(): string;
    example(): any;
}
