"use strict";
/**
 * NotFoundException
 * ----------------------------------------
 *
 * This should be used if a someone requests a
 * entity with a id, but there is no entity with this id in the
 * database, then we throw this exception.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = require("../../core/api/Exception");
class NotFoundException extends Exception_1.Exception {
    constructor(id) {
        super(404, `Entity with identifier ${id} does not exist`);
    }
}
exports.NotFoundException = NotFoundException;
//# sourceMappingURL=NotFoundException.js.map