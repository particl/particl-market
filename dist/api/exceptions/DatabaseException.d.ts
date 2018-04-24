/**
 * DatabaseException
 * ----------------------------------------
 *
 * This should be used for repository errors like
 * entity with this id already exists and stuff like that.
 */
import { Exception } from '../../core/api/Exception';
export declare class DatabaseException extends Exception {
    constructor(text: string, error: any);
}
