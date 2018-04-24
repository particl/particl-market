"use strict";
/**
 * core.database.Factory
 * ------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Faker = require("faker");
const BluePrint_1 = require("./BluePrint");
const ModelFactory_1 = require("./ModelFactory");
class Factory {
    constructor(faker) {
        this.faker = faker;
        this.blueprints = {};
    }
    static getInstance() {
        if (!Factory.instance) {
            Factory.instance = new Factory(Faker);
        }
        return Factory.instance;
    }
    define(ModelStatic, callback) {
        this.blueprints[this.getNameOfModel(ModelStatic)] = new BluePrint_1.BluePrint(ModelStatic, callback);
    }
    get(ModelStatic, ...args) {
        return new ModelFactory_1.ModelFactory(this.faker, this.blueprints[this.getNameOfModel(ModelStatic)], args);
    }
    getNameOfModel(Model) {
        return new Model().constructor.name;
    }
}
exports.Factory = Factory;
//# sourceMappingURL=Factory.js.map