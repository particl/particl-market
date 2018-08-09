// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MakeEnumCommand
 * -------------------------------------
 *
 */
import * as _ from 'lodash';
import * as inquirer from 'inquirer';
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';

export class MakeEnumCommand extends AbstractMakeCommand {

    public static command = 'make:enum';
    public static description = 'Generate new enum';

    public type = 'Enum';
    public suffix = '';
    public template = 'enum.hbs';
    public target = 'api/enums';
    public updateTargets = false;

    public async run(): Promise<void> {
        await super.run();
        const metaData = await this.askMetaData(this.context);
        this.context = { ...(this.context || {}), ...metaData };

        if (this.context.hasProperties && !this.context.properties) {
            this.context.properties = await this.askProperties(this.context.name);
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

    private async askProperties(name: string): Promise<any[]> {
        console.log('');
        console.log(`Let\'s add some ${name} properties now.`);
        console.log(`Enter an empty property name when done.`);
        console.log('');

        let askAgain = true;
        const fieldPrompt = inquirer.createPromptModule();
        const properties: any[] = [];
        while (askAgain) {
            const property = await fieldPrompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Property name:',
                    filter: (value: string) => value.toUpperCase()
                }, {
                    type: 'list',
                    name: 'type',
                    message: 'Property type:',
                    when: (res: any) => {
                        askAgain = !!res['name'];
                        return askAgain;
                    },
                    choices: [
                        'string (string)'
                        // TODO: 'integer (number)'
                    ]
                }
            ]);
            if (askAgain) {
                console.log('');
                properties.push(property);
            }
        }
        properties.map(p => {
            const types = p.type.replace(/[()]/g, '').split(' ');
            p.type = {
                script: types[1],
                database: types[0]
            };
            return p;
        });
        console.log('');
        return properties;
    }
}
