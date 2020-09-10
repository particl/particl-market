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
import { Logger as LoggerType } from '../../core/Logger';


export type ValidationFunction = (value: any, index: number, allValues: any[]) => boolean;

export interface ParamValidationRule {
    name: string;
    required: boolean;
    type: string;
    defaultValue: any;
    customValidate: ValidationFunction;
}

export interface CommandParamValidationRules {
    parameters: ParamValidationRule[];
}

export abstract class BaseCommand {

    public log: LoggerType;

    public commands: CommandEnumType;
    public command: Command;

    constructor(command: Command) {
        this.command = command;
        this.commands = Commands;
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            parameters: [] as ParamValidationRule[]
        } as CommandParamValidationRules;
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

    /**
     *
     * @param data
     * @param rules
     */
    public async validate(data: RpcRequest, rules?: CommandParamValidationRules): Promise<RpcRequest> {
        rules = rules ? rules : this.getCommandParamValidationRules();
        await this.setDefaults(data, rules);
        await this.validateRequiredParamsExist(data, rules);
        await this.validateRequiredTypes(data, rules);
        await this.validateValues(data, rules);
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

    /**
     * set default values if such are set
     * @param data
     * @param rules
     */
    public async setDefaults(data: RpcRequest, rules: CommandParamValidationRules): Promise<RpcRequest> {
        if (rules && rules.parameters && rules.parameters.length > 0) {

            for (let i = 0; i < data.params.length; i++) {
                const currentParamValue = data.params[i];
                const defaultValue = rules.parameters[i].defaultValue;

                if (!_.isNil(defaultValue) && _.isNil(currentParamValue)) {
                    // defaultValue exists and currentParamValue doesnt
                    data.params[i] = defaultValue;
                }
            }
        }
        return data;
    }

    /**
     * make sure the required params exist
     * @param data
     * @param rules
     */
    public async validateRequiredParamsExist(data: RpcRequest, rules: CommandParamValidationRules): Promise<RpcRequest> {
        if (rules && rules.parameters && rules.parameters.length > 0) {

            for (let i = 0; i < rules.parameters.length; i++) {
                const paramValidationRule = rules.parameters[i];
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

    /**
     * make sure the params are of required type
     * @param data
     * @param rules
     */
    public async validateRequiredTypes(data: RpcRequest, rules: CommandParamValidationRules): Promise<RpcRequest> {
        if (rules && rules.parameters && rules.parameters.length > 0) {

            for (let i = 0; i < data.params.length; i++) {
                const currentParamValue = data.params[i];
                const requiredType = rules.parameters[i].type;
                const parameterName = rules.parameters[i].name;

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

    public async validateValues(data: RpcRequest, rules: CommandParamValidationRules): Promise<RpcRequest> {
        if (rules && rules.parameters && rules.parameters.length > 0) {

            for (let i = 0; i < data.params.length; i++) {
                const currentParamValue = data.params[i];
                const parameterName = rules.parameters[i].name;

                if (typeof rules.parameters[i].customValidate === 'function'
                    && !rules.parameters[i].customValidate(currentParamValue, i, data.params)) {
                    throw new InvalidParamException(parameterName);
                }
            }
        }
        return data;
    }
}
