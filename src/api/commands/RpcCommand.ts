import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { RpcRequest } from '../requests/RpcRequest';
import { NotFoundException } from '../exceptions/NotFoundException';

export class RpcCommand<T> {
    public log: LoggerType;
    public name: string;

    @validate()
    public async execute(data: RpcRequest): Promise<T> {
        throw new NotFoundException('This command shouldn\'t ever be run');
    }

    public help(): string {
        return 'TODO: RpcCommand help string';
    }
}
