/**
 * InternalServerException
 * ----------------------------------------
 *
 */

import { Exception } from '../../core/api/Exception';


export class InternalServerException extends Exception {
    constructor(message: string) {
        super(500, message);
    }
}
