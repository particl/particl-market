import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { RpcRequest } from '../requests/RpcRequest';
import { RpcCommandInterface } from './RpcCommandInterface';
import { Commands} from './CommandEnumType';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import { BaseCommand } from './BaseCommand';
import { Command } from './Command';
import { NotFoundException } from '../exceptions/NotFoundException';

export class HelpCommand extends BaseCommand implements RpcCommandInterface<string> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.HELP_ROOT);
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<string>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any, rpcCommandFactory: RpcCommandFactory): Promise<string> {
        let helpStr = this.generateHelp(data.params, rpcCommandFactory);
        helpStr = helpStr.trim(); // Remove trailing \n
        return helpStr;
    }

    public generateHelp( commands: string[], rpcCommandFactory: RpcCommandFactory ): string {
        if ( commands.length <= 0 ) {
            let helpStr = '';
            for ( const rootCommand of Commands.rootCommands ) {
                if ( rootCommand ) {
                    let command;
                    try {
                        command = rpcCommandFactory.get(rootCommand);
                        helpStr += command.usage() + '\n';
                    } catch ( ex ) {
                        this.log.warn(`help(): Couldn't find ${rootCommand}.`);
                        continue;
                    }
                }
            }
            return helpStr;
        } else {
            const commandName = commands.shift();
            try {
                for ( const rootCommand of Commands.rootCommands ) {
                    if ( rootCommand.commandName === commandName) {
                        return this._generateHelp(commands, rpcCommandFactory, rootCommand);
                    }
                }
            } catch ( ex ) {
                throw new NotFoundException(`Command <${commandName}> not found.`);
            }
        }
        throw new NotFoundException(`Command not found.`);
    }

    public _generateHelp( commands: string[], rpcCommandFactory: RpcCommandFactory, command: any ): string {
        if ( commands.length === 0 ) {
            let retStr = '';

            if ( command.childCommands.length > 0 ) {
                // Get the help for every sub command and return it.
                for ( const childCommand of command.childCommands ) {
                    let commandCommand;
                    try {
                        commandCommand = rpcCommandFactory.get(childCommand);
                        retStr += commandCommand.help() + '\n';
                    } catch ( ex ) {
                        this.log.warn(`Command <${command} ${childCommand}> not found.`);
                        continue;
                    }
                }
                return retStr;
            } else {
                // Just get the help for this command and return it.
                let commandCommand;
                try {
                    commandCommand = rpcCommandFactory.get(command);
                } catch ( ex ) {
                    this.log.warn(`Command <${command}> not found.`);
                    throw new NotFoundException(`Command <${command}> not found.`);
                }
                const example = commandCommand.example();
                return commandCommand.help() + '\n        ' + (example ? 'example:\n' + example : '');
            }
        }

        // Keep recursing down.
        const commandName = commands.shift();
        for ( const childCommand of command.childCommands ) {
            if ( childCommand.commandName === commandName ) {
                return this._generateHelp(commands, rpcCommandFactory, childCommand);
            }
        }
        this.log.warn(`Command <${command}> not found.`);
        throw new NotFoundException(`Command <${command}> not found.`);
    }

    public usage(): string {
        return this.getName() + ' [<command> [<subCommand> [...]]]  -  ' + this.description();
    }

    public help(): string {
        return this.usage() + '\n'
            + '    <command>                - [optional] String - Command that we want to view help for. \n'
            + '    <subCommand>             - [optional] String - Subcommand that we want to view help for. ';
    }

    public example(): string {
        return this.getName() + ' help listingitem';
    }

    public description(): string {
        return 'Shows help for a command.';
    }
}
