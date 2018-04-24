"use strict";
/**
 * core.api.Validate
 * ------------------------------------------------
 *
 * Those annotations are used to simplify the use of request (payload)
 * validation. The '@Request(RequestBodyClass)' annotation defines the
 * the validation rules with his parameter and the '@Validate' runs all
 * the given validation classes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const requestMetadataKey = Symbol('ValidateRequest');
/**
 * Request annotation marks the parameters, which should be validated as a RequestBody.
 *
 * @param request
 */
exports.request = (requestBody) => (target, propertyKey, parameterIndex) => {
    const existingRequestParameters = Reflect.getOwnMetadata(requestMetadataKey, target, propertyKey) || [];
    existingRequestParameters.push({
        request: requestBody,
        index: parameterIndex
    });
    Reflect.defineMetadata(requestMetadataKey, existingRequestParameters, target, propertyKey);
};
/**
 * Value annotation marks the parameters, which should be validated as a MessageBody.
 *
 * @param request
 */
exports.message = (messageBody) => (target, propertyKey, parameterIndex) => {
    const existingRequestParameters = Reflect.getOwnMetadata(requestMetadataKey, target, propertyKey) || [];
    existingRequestParameters.push({
        request: messageBody,
        index: parameterIndex
    });
    Reflect.defineMetadata(requestMetadataKey, existingRequestParameters, target, propertyKey);
};
/**
 * Validate annotation builds the given RequestBodies and validates them
 *
 * @param target
 * @param propertyName
 * @param descriptor
 */
exports.validate = () => (target, propertyName, descriptor) => {
    const method = descriptor.value;
    descriptor.value = function (...args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const requestParameters = Reflect.getOwnMetadata(requestMetadataKey, target, propertyName);
            if (requestParameters && requestParameters.length > 0) {
                for (const requestParameter of requestParameters) {
                    const requestBody = new requestParameter.request(args[requestParameter.index]);
                    yield requestBody.validate();
                }
            }
            return method && method.apply(this, args);
        });
    };
    return descriptor;
};
//# sourceMappingURL=Validate.js.map