"use strict";
/**
 * UserRepository
 * ------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let UserRepository = class UserRepository {
    constructor(UserModel) {
        this.UserModel = UserModel;
    }
    /**
     * Retrieves all user data out of the database
     *
     * @static
     * @returns {Promise<Bookshelf.Collection<User>>}
     *
     * @memberof UserRepository
     */
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.UserModel.fetchAll();
        });
    }
    /**
     * Retrieves one user entity of the database
     *
     * @static
     * @param {number} id of the user
     * @returns {Promise<User>}
     */
    findOne(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.UserModel.fetchById(id);
        });
    }
    /**
     * Retrieves one user entity of the database
     *
     * @static
     * @param {number} id of the user
     * @returns {Promise<User>}
     */
    findByUserId(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.UserModel.fetchByUserId(userId);
        });
    }
    /**
     * Creates a new user entity in the database and returns
     * the new created entity
     *
     * @static
     * @param {*} data is the new user
     * @returns {Promise<User>}
     */
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = this.UserModel.forge(data);
            try {
                const createdUser = yield user.save();
                return this.UserModel.fetchById(createdUser.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the user!', error);
            }
        });
    }
    /**
     * Updates a already existing entity and returns the new one
     *
     * @static
     * @param {number} id
     * @param {*} data
     * @returns {Promise<User>}
     */
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = this.UserModel.forge({ id });
            try {
                const updatedUser = yield user.save(data, { patch: true });
                return this.UserModel.fetchById(updatedUser.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the user!', error);
            }
        });
    }
    /**
     * Removes a entity in the database, but if there is not user
     * with the given id, we will throw a Not-Found exception
     *
     * @static
     * @param {number} id
     * @returns {Promise<void>}
     */
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let user = this.UserModel.forge({ id });
            try {
                user = yield user.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield user.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the user!', error);
            }
        });
    }
};
UserRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.User)),
    tslib_1.__metadata("design:paramtypes", [Object])
], UserRepository);
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map