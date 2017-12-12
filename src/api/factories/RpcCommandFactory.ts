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
import {CategoryFindCommand} from '../commands/CategoryFindCommand';
import {CategoryGetCommand} from '../commands/CategoryGetCommand';
import {CategoryRemoveCommand} from '../commands/CategoryRemoveCommand';
import {CategoryUpdateCommand} from '../commands/CategoryUpdateCommand';

import {EscrowCreateCommand} from '../commands/EscrowCreateCommand';
import {EscrowDestroyCommand} from '../commands/EscrowDestroyCommand';
import {EscrowFindAllCommand} from '../commands/EscrowFindAllCommand';
import {EscrowFindCommand} from '../commands/EscrowFindCommand';
import {EscrowUpdateCommand} from '../commands/EscrowUpdateCommand';

import {ItemCategoryCreateCommand} from '../commands/ItemCategoryCreateCommand';
import {ItemCategoryDestroyCommand} from '../commands/ItemCategoryDestroyCommand';
import {ItemCategoryFindAllCommand} from '../commands/ItemCategoryFindAllCommand';
import {ItemCategoryFindCommand} from '../commands/ItemCategoryFindCommand';
import {ItemCategoryFindRootCommand} from '../commands/ItemCategoryFindRootCommand';
import {ItemCategoryUpdateCommand} from '../commands/ItemCategoryUpdateCommand';


import {HelpCommand} from '../commands/HelpCommand';
// import {multiInject} from 'inversify/dts/annotation/multi_inject';

// tslint:disable:array-type
export class RpcCommandFactory {

    public log: LoggerType;
    public commands: Array<RpcCommand<any>> = [];

    constructor(
       @inject(Types.Command) @named(Targets.Command.AddressCreateCommand) private addresscreateCommand: AddressCreateCommand,
       @inject(Types.Command) @named(Targets.Command.AddressUpdateCommand) private addressUpdateCommand: AddressUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.CategoriesGetCommand) private categoriesGetCommand: CategoriesGetCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryCreateCommand) private categoryCreateCommand: CategoryCreateCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryFindCommand) private categoryFindCommand: CategoryFindCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryGetCommand) private categoryGetCommand: CategoryGetCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryRemoveCommand) private categoryRemoveCommand: CategoryRemoveCommand,
       @inject(Types.Command) @named(Targets.Command.CategoryUpdateCommand) private categoryUpdateCommand: CategoryUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.EscrowCreateCommand) private escrowCreateCommand: EscrowCreateCommand,
       @inject(Types.Command) @named(Targets.Command.EscrowDestroyCommand) private escrowDestroyCommand: EscrowDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.EscrowFindAllCommand) private escrowFindAllCommand: EscrowFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.EscrowFindCommand) private escrowFindCommand: EscrowFindCommand,
       @inject(Types.Command) @named(Targets.Command.EscrowUpdateCommand) private escrowUpdateCommand: EscrowUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.ItemCategoryCreateCommand) private itemCategoryCreateCommand: ItemCategoryCreateCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryDestroyCommand) private itemCategoryDestroyCommand: ItemCategoryDestroyCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryFindAllCommand) private itemCategoryFindAllCommand: ItemCategoryFindAllCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryFindCommand) private itemCategoryFindCommand: ItemCategoryFindCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryFindRootCommand) private itemCategoryFindRootCommand: ItemCategoryFindRootCommand,
       @inject(Types.Command) @named(Targets.Command.ItemCategoryUpdateCommand) private itemCategoryUpdateCommand: ItemCategoryUpdateCommand,

       @inject(Types.Command) @named(Targets.Command.HelpCommand) private helpCommand: HelpCommand,

       // @multiInject(Types.Command) public commands: RpcCommand<any>[],
       // @multiInject(Types.Command) @named(Targets.AllCommands) private commands: Array<RpcCommand<any>>,
       // @multiInject(Types.Command) @named('Command') private commands: Command[],
       @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        this.commands.push(addresscreateCommand);
        this.commands.push(addressUpdateCommand);

        this.commands.push(categoriesGetCommand);
        this.commands.push(categoryCreateCommand);
        this.commands.push(categoryFindCommand);
        this.commands.push(categoryGetCommand);
        this.commands.push(categoryRemoveCommand);
        this.commands.push(categoryUpdateCommand);

        this.commands.push(escrowCreateCommand);
        this.commands.push(escrowDestroyCommand);
        this.commands.push(escrowFindAllCommand);
        this.commands.push(escrowFindCommand);
        this.commands.push(escrowUpdateCommand);

        this.commands.push(itemCategoryCreateCommand);
        this.commands.push(itemCategoryDestroyCommand);
        this.commands.push(itemCategoryFindAllCommand);
        this.commands.push(itemCategoryFindCommand);
        this.commands.push(itemCategoryFindRootCommand);
        this.commands.push(itemCategoryUpdateCommand);

        this.commands.push(helpCommand);

        for (const o of this.commands) {
            this.log.debug('Command ' + o.name + ' was pushed');
        }

    }

    public get(commandName: string): RpcCommand<Bookshelf.Model<any>> {
        this.log.debug('Looking for command <' + commandName + '>');
        for (const command of this.commands) {
            if (command.name.toLowerCase() === commandName.toLowerCase()) {
                this.log.debug('Found ' + command.name.toLowerCase());
                return command;
            }
        }
        throw new NotFoundException('Couldn\'t find command <' + commandName + '>\n');
    }
}
// tslint:enable:array-type
