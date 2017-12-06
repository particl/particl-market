import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { TestCommand } from '../commands/TestCommand';

export class TestFactory {

    public log: LoggerType;
    private commands: any[];

    constructor(
        @inject(Types.Command) @named(Targets.Command.TestCommand) private testCommand: TestCommand,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.commands.push(testCommand);
    }

    public get(): void {
        // TODO: return interface Command
        // TODO: return the correct Command from commands
    }

}
