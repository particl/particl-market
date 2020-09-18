// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MakeMiddlewareCommand
 * -------------------------------------
 *
 */
import { AbstractMakeCommand } from './lib/AbstractMakeCommand';


export class MakeMiddlewareCommand extends AbstractMakeCommand {

    public static command = 'make:middleware';
    public static description = 'Generate new middleware';

    public type = 'Middleware';
    public suffix = 'Middleware';
    public template = 'middleware.hbs';
    public target = 'api/middlewares';

}
