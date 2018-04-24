"use strict";
/**
 * core.database.ModelFactory
 * ------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class ModelFactory {
    constructor(faker, blueprint, args) {
        this.faker = faker;
        this.blueprint = blueprint;
        this.args = args;
        this.identifier = 'id';
    }
    returning(identifier) {
        this.identifier = identifier;
        return this;
    }
    each(iterator) {
        this.eachFn = iterator;
        return this;
    }
    create(amount = 1) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (let i = 0; i < amount; i++) {
                const obj = yield this.build();
                results.push(obj);
                if (typeof this.eachFn === 'function') {
                    yield this.eachFn(obj, this.faker);
                }
            }
            if (amount === 1) {
                return results[0];
            }
            return results;
        });
    }
    build() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const obj = yield this.makeEntity(this.blueprint.callback(this.faker, this.args));
            return yield new this.blueprint.Model(obj).save();
        });
    }
    makeEntity(entity) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const attribute in entity) {
                if (entity.hasOwnProperty(attribute)) {
                    if (typeof entity[attribute] === 'object' && entity[attribute] instanceof ModelFactory) {
                        const modelFactory = entity[attribute];
                        const subEntity = yield modelFactory.build();
                        entity[attribute] = subEntity[this.identifier];
                    }
                }
            }
            return entity;
        });
    }
}
exports.ModelFactory = ModelFactory;
//# sourceMappingURL=ModelFactory.js.map