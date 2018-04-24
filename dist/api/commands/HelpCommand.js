"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../core/api/Validate");
const constants_1 = require("../../constants");
const RpcRequest_1 = require("../requests/RpcRequest");
const CommandEnumType_1 = require("./CommandEnumType");
const RpcCommandFactory_1 = require("../factories/RpcCommandFactory");
const BaseCommand_1 = require("./BaseCommand");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let HelpCommand = class HelpCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger) {
        super(CommandEnumType_1.Commands.HELP_ROOT);
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<string>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let helpStr = this.generateHelp(data.params, rpcCommandFactory);
            helpStr = helpStr.trim(); // Remove trailing \n
            return helpStr;
        });
    }
    generateHelp(commands, rpcCommandFactory) {
        if (commands.length <= 0) {
            let helpStr = '';
            for (const rootCommand of CommandEnumType_1.Commands.rootCommands) {
                if (rootCommand) {
                    let command;
                    try {
                        command = rpcCommandFactory.get(rootCommand);
                        helpStr += command.usage() + '\n';
                    }
                    catch (ex) {
                        this.log.warn(`help(): Couldn't find ${rootCommand}.`);
                        continue;
                    }
                }
            }
            return helpStr;
        }
        else {
            const commandName = commands.shift();
            try {
                for (const rootCommand of CommandEnumType_1.Commands.rootCommands) {
                    if (rootCommand.commandName === commandName) {
                        return this._generateHelp(commands, rpcCommandFactory, rootCommand);
                    }
                }
            }
            catch (ex) {
                throw new NotFoundException_1.NotFoundException(`Command <${commandName}> not found.`);
            }
        }
        throw new NotFoundException_1.NotFoundException(`Command not found.`);
    }
    _generateHelp(commands, rpcCommandFactory, command) {
        if (commands.length === 0) {
            let retStr = '';
            if (command.childCommands.length > 0) {
                // Get the help for every sub command and return it.
                for (const childCommand of command.childCommands) {
                    let commandCommand;
                    try {
                        commandCommand = rpcCommandFactory.get(childCommand);
                        retStr += commandCommand.help() + '\n\n';
                    }
                    catch (ex) {
                        this.log.warn(`Command <${command} ${childCommand}> not found.`);
                        continue;
                    }
                }
                return retStr;
            }
            else {
                // Just get the help for this command and return it.
                let commandCommand;
                try {
                    commandCommand = rpcCommandFactory.get(command);
                }
                catch (ex) {
                    this.log.warn(`Command <${command}> not found.`);
                    throw new NotFoundException_1.NotFoundException(`Command <${command}> not found.`);
                }
                const example = commandCommand.example();
                return commandCommand.help() + '\n' + (example ? 'example:\n' + example : '') + '\n';
            }
        }
        // Keep recursing down.
        const commandName = commands.shift();
        for (const childCommand of command.childCommands) {
            if (childCommand.commandName === commandName) {
                return this._generateHelp(commands, rpcCommandFactory, childCommand);
            }
        }
        this.log.warn(`Command <${command}> not found.`);
        throw new NotFoundException_1.NotFoundException(`Command <${command}> not found.`);
    }
    usage() {
        return this.getName() + ' [<command> [<subCommand> [...]]]  -  ' + this.description();
    }
    help() {
        return this.usage() + '\n'
            + '    <command>                - [optional] String - Command that we want to view help for. \n'
            + '    <subCommand>             - [optional] String - Subcommand that we want to view help for. ';
    }
    example() {
        return this.getName() + ' help listingitem';
    }
    description() {
        return 'Shows help for a command.';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], HelpCommand.prototype, "execute", null);
HelpCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], HelpCommand);
exports.HelpCommand = HelpCommand;
//# sourceMappingURL=HelpCommand.js.map