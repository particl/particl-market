// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { RpcRequest } from '../requests/RpcRequest';
import { Command } from './Command';
import { CommandEnumType } from './CommandEnumType';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';

export interface RpcCommandInterface<T> {

    commands: CommandEnumType;
    command: Command;

    execute(data: RpcRequest, rpcCommandFactory?: RpcCommandFactory): Promise<T>;
    validate(data: RpcRequest): Promise<RpcRequest>;
    getName(): string;
    getCommand(): Command;
    getChildCommands(): Command[];

    help(): string;
    usage(): string;
    example(): any;
    description(): string;
}
