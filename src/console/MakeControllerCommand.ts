// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MakeControllerCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';


export class MakeControllerCommand extends AbstractMakeCommand {

    public static command = 'make:controller';
    public static description = 'Generate new controller';

    public type = 'Controller';
    public suffix = 'Controller';
    public template = 'controller.hbs';
    public target = 'api/controllers';

}
