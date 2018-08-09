// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MakeExceptionCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';


export class MakeExceptionCommand extends AbstractMakeCommand {

    public static command = 'make:exception';
    public static description = 'Generate new exception';

    public type = 'Exception';
    public suffix = 'Exception';
    public template = 'exception.hbs';
    public target = 'api/exceptions';

}
