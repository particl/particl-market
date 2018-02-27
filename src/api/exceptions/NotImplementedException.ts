/**
 * NotImplementedException
 * ----------------------------------------
 *
 * This should be used when a feature is not implemented yet.
 */

import { MessageException } from './MessageException';


export class NotImplementedException extends MessageException {
    constructor() {
        super('Not implemented.');
    }
}
