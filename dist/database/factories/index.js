"use strict";
/**
 * database.factories
 * ----------------------------------------
 *
 * Define all your model-factories here. These model-factories are used to seed
 * data very easy into your database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Factory_1 = require("../../core/database/Factory");
const User_1 = require("../../api/models/User");
tslib_1.__exportStar(require("../../core/database/Factory"), exports);
const factory = Factory_1.Factory.getInstance();
/**
 * USER - Factory
 */
factory.define(User_1.User, (faker) => {
    const gender = faker.random.number(1);
    const fn = faker.name.firstName(gender);
    const ln = faker.name.lastName(gender);
    const e = faker.internet.email(fn, ln);
    return {
        firstName: fn,
        lastName: ln,
        email: e,
        auth0UserId: 'auth0|' + e,
        picture: faker.internet.avatar()
    };
});
//# sourceMappingURL=index.js.map