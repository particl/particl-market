// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { CommandEnumType, Commands } from './CommandEnumType';
import { Command } from './Command';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MissingParamException } from '../exceptions/MissingParamException';
import { InvalidParamException } from '../exceptions/InvalidParamException';
import {Logger as LoggerType} from '../../core/Logger';

export interface ParamValidationRule {
    name: string;
    required: boolean;
    type: string;
}

export interface CommandParamValidationRules {
    parameters: ParamValidationRule[];
}

export abstract class BaseCommand {

    public log: LoggerType;

    public commands: CommandEnumType;
    public command: Command;
    protected paramValidationRules: CommandParamValidationRules;

    constructor(command: Command) {
        this.command = command;
        this.commands = Commands;
    }

    /**
     * execute the next command in data.params
     *
     * @param request
     * @param commandFactory
     * @returns {Promise<BaseCommand>}
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
        await this.validateRequiredParamsExist(data);
        await this.validateRequiredTypes(data);
        return data;
    }

    public abstract help(): string;

    public abstract usage(): string;

    public abstract description(): string;

    public abstract example(): string;

    public getName(): string {
        return this.command.commandName;
    }

    public getCommand(): Command {
        return this.command;
    }

    public async validateRequiredParamsExist(data: RpcRequest): Promise<RpcRequest> {
        if (this.paramValidationRules
            && this.paramValidationRules.parameters
            && this.paramValidationRules.parameters.length > 0) {

            for (let i = 0; i < this.paramValidationRules.parameters.length; i++) {
                const paramValidationRule = this.paramValidationRules.parameters[i];
                if (paramValidationRule) {
                    this.log.debug('validateRequiredParamsExist(): ' + paramValidationRule.name
                        + ', required: ' + paramValidationRule.required);
                        // + ', value: ' + data.params[i]);

                    if (paramValidationRule.required && _.isNil(data.params[i])) {
                        throw new MissingParamException(paramValidationRule.name);
                    }
                }
            }
        }
        return data;
    }

    public async validateRequiredTypes(data: RpcRequest): Promise<RpcRequest> {
        if (this.paramValidationRules
            && this.paramValidationRules.parameters
            && this.paramValidationRules.parameters.length > 0) {

            for (let i = 0; i < data.params.length; i++) {
                const currentParamValue = data.params[i];
                const requiredType = this.paramValidationRules.parameters[i].type;
                const parameterName = this.paramValidationRules.parameters[i].name;

                this.log.debug('validateRequiredTypes(): ' + parameterName
                    + ', requiredType: ' + requiredType
                    + ', matches: ' + (typeof currentParamValue === requiredType));

                if (!_.isNil(currentParamValue) && !_.isNil(requiredType) && typeof currentParamValue !== requiredType) {
                    throw new InvalidParamException(parameterName, requiredType);
                }
            }
        }

        return data;
    }

}
