/**
 * core.api.Exception
 * ------------------------------------------------
 *
 * We use this extend error for our custom errors, which we
 * call exceptions. They have a code property for the http-status,
 * global message and a body, which we will return as a json.
 */
export declare const isException: symbol;
export declare class Exception extends Error {
    code: number;
    body: any;
    constructor(code: number, ...args: any[]);
    toString(): string;
}
