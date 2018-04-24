"use strict";
/**
 * core.api.extendExpressResponse
 * ------------------------------------------------
 *
 * We use this middleware to extend the express response object, so
 * we can access the new functionality in our controllers. The extension
 * should simplify common responses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendExpressResponse = (req, res, next) => {
    /**
     * 200 - OK
     * This is used for successful responses and a json body
     */
    res.ok = (data, options = {}) => {
        res.status(200);
        return res.json(bodySuccessful(data, options));
    };
    /**
     * 201 - Created
     * This is used for created resources
     */
    res.created = (data, options = {}) => {
        res.status(201);
        return res.json(bodySuccessful(data, options));
    };
    /**
     * 200 - Found
     * Like the ok function
     */
    res.found = (data, options = {}) => {
        return res.ok(data, options);
    };
    /**
     * 200 - Updated
     * Like the ok function
     */
    res.updated = (data, options = {}) => {
        return res.ok(data, options);
    };
    /**
     * 200 - Destroyed
     * This is the response after a resource has been removed
     */
    res.destroyed = (options = {}) => {
        res.status(200);
        return res.json(bodySuccessful(null));
    };
    /**
     * 400-500 - Failed
     * This is used when a request has failed
     */
    res.failed = (status, message, error) => {
        res.status(status);
        return res.json(bodyFailed(message, error));
    };
    next();
};
/**
 * This body parser is used to show successful responses to the client
 */
function bodySuccessful(data, options = {}) {
    return Object.assign({ success: true }, prepareMessage(options.message), prepareLinks(options.links), { data });
}
exports.bodySuccessful = bodySuccessful;
/**
 * This body parse is used for error messages to the client
 */
function bodyFailed(message, error) {
    return Object.assign({ success: false, message }, { error });
}
exports.bodyFailed = bodyFailed;
///////////////////////////////////////////////////////
function prepareMessage(value) {
    if (value) {
        return { message: value };
    }
    return;
}
function prepareLinks(values) {
    if (values) {
        return { links: values };
    }
    return;
}
//# sourceMappingURL=extendExpressResponse.js.map