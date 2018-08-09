// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MakeRepoCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';


export class MakeRepoCommand extends AbstractMakeCommand {

    public static command = 'make:repo';
    public static description = 'Generate new repository';

    public type = 'Repository';
    public suffix = 'Repository';
    public template = 'repository.hbs';
    public target = 'api/repositories';

}
