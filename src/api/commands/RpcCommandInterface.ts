import { RpcRequest } from '../requests/RpcRequest';
import { Command } from './Command';
import { CommandEnumType } from './CommandEnumType';

export interface RpcCommandInterface<T> {

    commands: CommandEnumType;
    command: Command;

    execute(data: RpcRequest): Promise<T>;
    getName(): string;
    getCommand(): Command;
    getChildCommands(): Command[];
    help(): string;
    example(): any;
}
