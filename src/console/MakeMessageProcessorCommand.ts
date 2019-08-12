// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MakeMessageProcessorCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';


export class MakeMessageProcessorCommand extends AbstractMakeCommand {

    public static command = 'make:messageprocessor';
    public static description = 'Generate new messageprocessor';

    public type = 'MessageProcessor';
    public suffix = 'MessageProcessor';
    public template = 'messageprocessor.hbs';
    public target = 'api/messageprocessors';
    public updateTargets = true;

    public async run(): Promise<void> {
        await super.run();
    }
}
