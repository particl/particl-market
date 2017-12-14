import { RpcRequest } from '../requests/RpcRequest';

export interface RpcCommandInterface<T> {

    name: string;

    execute(data: RpcRequest): Promise<T>;
    help(): string;
}
