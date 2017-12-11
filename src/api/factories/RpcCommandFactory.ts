import * as Bookshelf from 'bookshelf';
import { inject, named, multiInject } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { RpcCommand} from '../commands/RpcCommand';
import {NotFoundException} from '../exceptions/NotFoundException';
// import {AddressCommand} from '../commands/AddressCommand';
import {CreateAddressCommand} from '../commands/CreateAddressCommand';
import {UpdateAddressCommand} from '../commands/UpdateAddressCommand';
import {CreateCategoryCommand} from '../commands/CreateCategoryCommand';
import {GetCategoriesCommand} from '../commands/GetCategoriesCommand';
import {RemoveCategoryCommand} from '../commands/RemoveCategoryCommand';
// import {multiInject} from 'inversify/dts/annotation/multi_inject';

// tslint:disable:array-type
export class RpcCommandFactory {

    public log: LoggerType;
    public commands: Array<RpcCommand<any>> = [];

    constructor(
       @inject(Types.Command) @named(Targets.Command.CreateAddressCommand) private createAddressCommand: CreateAddressCommand,
       @inject(Types.Command) @named(Targets.Command.UpdateAddressCommand) private updateAddressCommand: UpdateAddressCommand,
       @inject(Types.Command) @named(Targets.Command.CreateCategoryCommand) private createCategoryCommand: CreateCategoryCommand,
       @inject(Types.Command) @named(Targets.Command.GetCategoriesCommand) private getCategoriesCommand: GetCategoriesCommand,
       @inject(Types.Command) @named(Targets.Command.RemoveCategoryCommand) private removeCategoryCommand: RemoveCategoryCommand,

       // @multiInject(Types.Command) public commands: RpcCommand<any>[],
       // @multiInject(Types.Command) @named(Targets.AllCommands) private commands: Array<RpcCommand<any>>,
       // @multiInject(Types.Command) @named('Command') private commands: Command[],
       @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        this.commands.push(createAddressCommand);
        this.commands.push(updateAddressCommand);
        this.commands.push(createCategoryCommand);
        this.commands.push(getCategoriesCommand);
        this.commands.push(removeCategoryCommand);

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
