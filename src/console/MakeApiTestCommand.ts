/**
 * MakeApiTestCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';
import { parseName, existsFile } from './lib/utils';
import { writeTemplate } from './lib/template';

export class MakeApiTestCommand extends AbstractMakeCommand {

    public static command = 'make:api-test';
    public static description = 'Generate new api test';

    public target = '/black-box';
    public type = 'API Test';
    public suffix = '';
    public template = 'api-test.hbs';
    public updateTargets = false;
    public isTest = true;

    public async run(): Promise<void> {
        await super.run();
    }

    public async write(): Promise<void> {
        const filePath = this.buildFilePath(this.target, this.context.name, this.isTest, '.test.ts');
        await existsFile(filePath, true, this.isTest);
        this.context.name = parseName(this.context.name, this.suffix);
        await writeTemplate(this.template, filePath, this.context);
    }
}
