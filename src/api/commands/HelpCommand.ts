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
        let helpStr = '';
        if ( data.params.length < 1 ) {
            for ( const rootCommand of Commands.rootCommands ) {
                if ( rootCommand ) {
                    let command;
                    try {
                        command = rpcCommandFactory.get(rootCommand);
                    } catch ( ex ) {
                        this.log.warn(`help(): Couldn't find ${rootCommand}.`);
                        continue;
                    }
                    helpStr += command.help() + '\n';
                }
            }
        } else {
            const rootCommandName = data.params[0];
            let rootCommand;
            let rootCommandCommand;
            let foundRoot = false;
            for ( rootCommand of Commands.rootCommands ) {
                if ( rootCommand ) {
                    if ( rootCommand.commandName === rootCommandName ) {
                        foundRoot = true;
                        rootCommandCommand = rpcCommandFactory.get(rootCommand);
                        break;
                    }
                }
            }
            if ( !foundRoot ) {
                // Root command wasn't found
                throw new NotFoundException(`Command <${data.params[0]}> not found.`); 
            }

            if ( data.params.length <= 1 ) {
                /*
                 * Get all children of the root command.
                 */
                helpStr = rootCommandCommand.help();

                for ( const childCommand of rootCommand.childCommands ) {
                    let childCommandCommand;
                    try {
                        childCommandCommand = rpcCommandFactory.get(childCommand);
                    } catch ( ex ) {
                        this.log.warn(`help(): Couldn't find ${childCommand}.`);
                        continue;
                    }
                    helpStr += childCommandCommand.help() + '\n';
                }
            } else { // if ( data.params.legnt <= 2 ) {
                /*
                 * Get just a single child of the root command.
                 */
                for ( const childCommand of rootCommand.childCommands ) {
                    if ( childCommand.commandName === data.params[1] ) {
                        let childCommandCommand;
                        try {
                            childCommandCommand = rpcCommandFactory.get(childCommand);
                        } catch ( ex ) {
                            this.log.warn(`help(): Couldn't find ${childCommand}.`);
                            continue;
                        }
                        return  rootCommandName + ' ' + childCommandCommand.help();
                    }
                }
                throw new NotFoundException(`Command <${data.params[0]} ${data.params[1]}> not found.`);
            }
        }
        helpStr = helpStr.trim(); // Remove trailing \n
        return helpStr;
    }

    public help(): string {
        return this.getName() + ' [<command> [<subCommand>]] \n'
            + '    <command>        - [optional] string - Command that we want to view help for. \n'
            + '    <subCommand>     - [optional] string - Subcommand that we want to view help for. ';
    }

}
