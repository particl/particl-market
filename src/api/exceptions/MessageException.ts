/**
 * MessageException
 * ----------------------------------------
 *
 * This should be used if a someone requests a
 * entity with a id, but there is no entity with this id in the
 * database, then we throw this exception.
 */

import { Exception } from '../../core/api/Exception';


export class MessageException extends Exception {
    constructor(message?: string) {
        super(404, `${message}`);
    }
}
