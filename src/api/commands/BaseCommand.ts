// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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

    /**
     * execute the next command in data.params
     *
     * @param rpcCommandFactory
     * @param data
     * @returns {Promise<Bookshelf.Model<any>>}
     */
    public async executeNext(request: RpcRequest, commandFactory: RpcCommandFactory): Promise<BaseCommand> {
        const commandName = request.params.shift();
        // find a matching command from current commands childCommands
        const commandType = _.find(this.getChildCommands(), command => command.commandName === commandName);
        if (commandType) {
            const rpcCommand = commandFactory.get(commandType);
            // validate
            const newRpcRequest = await rpcCommand.validate(request);
            request = newRpcRequest ? newRpcRequest : request;
            // execute
            return await rpcCommand.execute(request, commandFactory);
        } else {
            throw new NotFoundException('Unknown subcommand: ' + commandName + '\n');
        }
    }

    /**
     * returns the child Commands of this command
     * @returns {Command[]}
     */
    public getChildCommands(): Command[] {
        return this.command.childCommands;
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        return data;
    }

    public help(): string {
        return ' <TODO: Command.help()>';
    }

    public usage(): string {
        return '<TODO: Command.usage()>';
    }

    public description(): string {
        return 'TODO: Command.description()';
    }

    public example(): any {
        return null;
    }

    public getName(): string {
        return this.command.commandName;
    }

    public getCommand(): Command {
        return this.command;
    }

}
