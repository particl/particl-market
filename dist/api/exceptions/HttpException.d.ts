/**
 * HttpException
 * ----------------------------------------
 *
 */
import { Exception } from '../../core/api/Exception';
export declare class HttpException extends Exception {
    constructor(id: number, message: string);
}
