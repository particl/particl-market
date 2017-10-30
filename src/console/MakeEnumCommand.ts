/**
 * MakeEnumCommand
 * -------------------------------------
 *
 */
import * as _ from 'lodash';
import * as inquirer from 'inquirer';
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
import { MakeMigrationCommand } from './MakeMigrationCommand';
import { askProperties, buildFilePath, existsFile } from './lib/utils';
import { writeTemplate } from './lib/template';


export class MakeEnumCommand extends AbstractMakeCommand {

    public static command = 'make:enum';
    public static description = 'Generate new enum';

    public type = 'Wnum';
    public suffix = '';
    public template = 'enum.hbs';
    public target = 'api/enums';

    public async run(): Promise<void> {
        await super.run();
        const metaData = await this.askMetaData(this.context);
        this.context = { ...(this.context || {}), ...metaData };

        if (this.context.hasProperties && !this.context.properties) {
            this.context.properties = await askProperties(this.context);
        }

    }

    public async write(): Promise<void> {

        // Create model
        await super.write();
    }

    private async askMetaData(context: any): Promise<any> {
        const prompt = inquirer.createPromptModule();
        const prompts = await prompt([
            {
                type: 'confirm',
                name: 'hasProperties',
                message: 'Do you want to add some properties?',
                default: true,
                when: () => !this.context.properties
            }
        ]);
        return _.assign(context, prompts);
    }

}
