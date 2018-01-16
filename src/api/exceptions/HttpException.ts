/**
 * HttpException
 * ----------------------------------------
 *
 */

import { Exception } from '../../core/api/Exception';


export class HttpException extends Exception {
    constructor(id: number, message: string) {
        super(id, message);
    }
}
