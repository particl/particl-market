/**
 * core.api.Validate
 * ------------------------------------------------
 *
 * Those annotations are used to simplify the use of request (payload)
 * validation. The '@Request(RequestBodyClass)' annotation defines the
 * the validation rules with his parameter and the '@Validate' runs all
 * the given validation classes.
 */
import 'reflect-metadata';
import { RequestBody } from './RequestBody';
import { MessageBody } from './MessageBody';
/**
 * Request annotation marks the parameters, which should be validated as a RequestBody.
 *
 * @param request
 */
export declare const request: (requestBody: typeof RequestBody) => (target: object, propertyKey: string | symbol, parameterIndex: number) => any;
/**
 * Value annotation marks the parameters, which should be validated as a MessageBody.
 *
 * @param request
 */
export declare const message: (messageBody: typeof MessageBody) => (target: object, propertyKey: string | symbol, parameterIndex: number) => any;
/**
 * Validate annotation builds the given RequestBodies and validates them
 *
 * @param target
 * @param propertyName
 * @param descriptor
 */
export declare const validate: () => (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) => any;
