// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
    public updateTargets = true;

    public async run(): Promise<void> {
        await super.run();
    }
}
