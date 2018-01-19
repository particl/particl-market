import { RpcRequest } from '../requests/RpcRequest';
import { Command } from './Command';

export interface RpcCommandInterface<T> {

    command: Command;

    execute(data: RpcRequest): Promise<T>;
    help(): string;
}
