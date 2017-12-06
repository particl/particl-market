/**
 * MakeCommandCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';


export class MakeCommandCommand extends AbstractMakeCommand {

    public static command = 'make:command';
    public static description = 'Generate new command';

    public type = 'Command';
    public suffix = 'Command';
    public template = 'command.hbs';
    public target = 'api/commands';

}
