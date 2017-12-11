import * as Bookshelf from 'bookshelf';
import { inject, named, multiInject } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { RpcCommand} from '../commands/RpcCommand';
import {NotFoundException} from '../exceptions/NotFoundException';
// import {AddressCommand} from '../commands/AddressCommand';
import {AddressCreateCommand} from '../commands/AddressCreateCommand';
import {AddressUpdateCommand} from '../commands/AddressUpdateCommand';
import {CategoryCreateCommand} from '../commands/CategoryCreateCommand';
import {CategoriesGetCommand} from '../commands/CategoriesGetCommand';
import {CategoryRemoveCommand} from '../commands/CategoryRemoveCommand';
// import {multiInject} from 'inversify/dts/annotation/multi_inject';

// tslint:disable:array-type
export class RpcCommandFactory {

    public log: LoggerType;
    public commands: Array<RpcCommand<any>> = [];

    constructor(
       @inject(Types.Command) @named(Targets.Command.AddressCreateCommand) private addresscreateCommand: AddressCreateCommand,
       @inject(Types.Command) @named(Targets.Command.AddressUpdateCommand) private addressUpdateCommand: AddressUpdateCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryCreateCommand) private categoryCreateCommand: CategoryCreateCommand,
       @inject(Types.Command) @named(Targets.Command.CategoriesGetCommand) private categoriesGetCommand: CategoriesGetCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryRemoveCommand) private categoryRemoveCommand: CategoryRemoveCommand,

       // @multiInject(Types.Command) public commands: RpcCommand<any>[],
       // @multiInject(Types.Command) @named(Targets.AllCommands) private commands: Array<RpcCommand<any>>,
       // @multiInject(Types.Command) @named('Command') private commands: Command[],
       @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        this.commands.push(addresscreateCommand);
        this.commands.push(addressUpdateCommand);
        this.commands.push(categoryCreateCommand);
        this.commands.push(categoriesGetCommand);
        this.commands.push(categoryRemoveCommand);

        for (const o of this.commands) {
            this.log.debug('Command ' + o.name + ' was pushed');
        }

    }

    public get(commandName: string): RpcCommand<Bookshelf.Model<any>> {
        this.log.error('Looking for command <' + commandName + '>');
        for (const command of this.commands) {
            if (command.name.toLowerCase() === commandName.toLowerCase()) {
                this.log.error('Found ' + command.name.toLowerCase());
                return command;
            }
        }
        throw new NotFoundException('Couldn\'t find command <' + commandName + '>\n');
    }
}
// tslint:enable:array-type
