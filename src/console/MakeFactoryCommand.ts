/**
 * MakeFactoryCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';


export class MakeFactoryCommand extends AbstractMakeCommand {

    public static command = 'make:factory';
    public static description = 'Generate new factory';

    public type = 'Factory';
    public suffix = 'Factory';
    public template = 'factory.hbs';
    public target = 'api/factories';
    public updateTargets = true;

    public async run(): Promise<void> {
        await super.run();
    }
}
