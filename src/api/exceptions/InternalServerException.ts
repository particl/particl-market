/**
 * InternalServerException
 * ----------------------------------------
 *
 */

import { Exception } from '../../core/api/Exception';


export class InternalServerException extends Exception {
    constructor(...args: any[]) {
        super(500, args);
    }
}
