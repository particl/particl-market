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
import { CommandParamValidationRules, ParamValidationRule } from './CommandParamValidation';


export abstract class BaseCommand {

    public log: LoggerType;

    public commands: CommandEnumType;
    public command: Command;

    public debug = false;

    constructor(command: Command) {
        this.command = command;
        this.commands = Commands;
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [] as ParamValidationRule[]
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
        if (rules && rules.params && rules.params.length > 0) {

            for (let i = 0; i < rules.params.length; i++) {

                if (rules.params[i]) {
                    if (this.debug) {
                        this.log.debug('setDefaults(): ' + rules.params[i].name
                            + ', defaultValue: ' + rules.params[i].defaultValue
                            + ', value: ' + data.params[i]);
                    }

                    if (!_.isNil(rules.params[i].defaultValue) && _.isNil(data.params[i])) {
                        // defaultValue exists and currentParamValue doesnt
                        data.params[i] = rules.params[i].defaultValue;
                    }
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
        if (rules && rules.params && rules.params.length > 0) {

            for (let i = 0; i < rules.params.length; i++) {
                if (this.debug) {
                    this.log.debug('validateRequiredParamsExist(): ' + rules.params[i].name
                        + ', required: ' + rules.params[i].required);
                    // + ', value: ' + data.params[i]);
                }
                if (rules.params[i].required && _.isNil(data.params[i])) {
                    throw new MissingParamException(rules.params[i].name);
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
        if (rules && rules.params && rules.params.length > 0) {

            for (let i = 0; i < rules.params.length; i++) {

                if (this.debug) {
                    this.log.debug('validateRequiredTypes(): ' + rules.params[i].name
                        + ', requiredType: ' + rules.params[i].type
                        + ', matches: ' + (typeof data.params[i] === rules.params[i].type));
                }

                if (!_.isNil(data.params[i])
                    && !_.isNil(rules.params[i].type)
                    && typeof data.params[i] !== rules.params[i].type) {

                    throw new InvalidParamException(rules.params[i].name, rules.params[i].type);
                }
            }
        }
        return data;
    }

    public async validateValues(data: RpcRequest, rules: CommandParamValidationRules): Promise<RpcRequest> {
        if (!_.isNil(rules) && !_.isNil(rules.params) && rules.params.length > 0) {

            for (let i = 0; i < rules.params.length; i++) {

                if (!_.isNil(rules.params[i])
                    && !_.isNil(rules.params[i].customValidate)
                    && typeof rules.params[i].customValidate === 'function'
                    && !rules.params[i].customValidate!(data.params[i], i, data.params)) {

                    if (this.debug) {
                        this.log.debug('validateValues(): ' + rules.params[i].name
                            + ', the computer says no.');
                    }

                    throw new InvalidParamException(rules.params[i].name);
                }
            }
        }
        return data;
    }
}
