/// <reference types="express" />
/**
 * core.api.extendExpressResponse
 * ------------------------------------------------
 *
 * We use this middleware to extend the express response object, so
 * we can access the new functionality in our controllers. The extension
 * should simplify common responses.
 */
import * as express from 'express';
export declare const extendExpressResponse: (req: myExpress.Request, res: myExpress.Response, next: express.NextFunction) => void;
/**
 * This body parser is used to show successful responses to the client
 */
export declare function bodySuccessful<T>(data: T, options?: myExpress.ResponseOptions): any;
/**
 * This body parse is used for error messages to the client
 */
export declare function bodyFailed(message: string, error?: any): any;
