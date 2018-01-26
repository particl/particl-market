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
        // if ( params.lenght < 1 ) {
        for ( const rootCommand of Commands.rootCommands ) {
            if ( rootCommand ) {
                let tmp;
                try {
                    tmp = rpcCommandFactory.get(rootCommand);
                } catch ( ex ) {
                    this.log.warn(`help(): Couldn't find ${rootCommand}.`);
                    continue;
                }
                helpStr += tmp.help() + '\n';
            }
        }
        // } else {
        //     Do help on the subcommands
        // }
        return helpStr;
    }

    public help(): string {
        return this.getName() + ' [command]';
    }

}
