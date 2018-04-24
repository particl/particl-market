"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let OrderRepository = class OrderRepository {
    constructor(OrderModel, Logger) {
        this.OrderModel = OrderModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.OrderModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.OrderModel.fetchById(id, withRelated);
        });
    }
    /**
     *
     * @param options, OrderSearchParams
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    search(options, withRelated) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.OrderModel.search(options, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const order = this.OrderModel.forge(data);
            try {
                const orderCreated = yield order.save();
                return this.OrderModel.fetchById(orderCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the order!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const order = this.OrderModel.forge({ id });
            try {
                const orderUpdated = yield order.save(data, { patch: true });
                return this.OrderModel.fetchById(orderUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the order!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let order = this.OrderModel.forge({ id });
            try {
                order = yield order.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield order.destroy();
                return;
            }
            catch (error) {
                this.log.debug('error:', error);
                throw new DatabaseException_1.DatabaseException('Could not delete the order!', error);
            }
        });
    }
};
OrderRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Order)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], OrderRepository);
exports.OrderRepository = OrderRepository;
//# sourceMappingURL=OrderRepository.js.map