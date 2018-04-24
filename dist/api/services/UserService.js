"use strict";
/**
 * UserService
 * ------------------------------
 *
 * This service is here to validate and call the repository layer for
 * database actions. Furthermore you should throw events here if
 * necessary.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const events_1 = require("../../core/api/events");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const UserCreateRequest_1 = require("../requests/user/UserCreateRequest");
const UserUpdateRequest_1 = require("../requests/user/UserUpdateRequest");
const UserRepository_1 = require("../repositories/UserRepository");
const UserCreatedListener_1 = require("../listeners/user/UserCreatedListener");
let UserService = class UserService {
    constructor(userRepo, Logger, events) {
        this.userRepo = userRepo;
        this.Logger = Logger;
        this.events = events;
        this.log = new Logger(__filename);
    }
    /**
     * This returns all user database objects
     */
    findAll() {
        return this.userRepo.findAll();
    }
    /**
     * Returns the user with the given id or throws a Not-Found exception
     *
     * @param {number} id of the user
     * @returns {Promise<User>}
     */
    findOne(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findOne(id);
            if (user === null) {
                this.log.warn(`User with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return user;
        });
    }
    /**
     * Returns the user with the given user_id or throws a Not-Found exception
     *
     * @param {number} id of the user
     * @returns {Promise<User>}
     */
    findByUserId(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findByUserId(userId);
            if (user === null) {
                this.log.warn(`User with the userId=${userId} was not found!`);
                throw new NotFoundException_1.NotFoundException(userId);
            }
            return user;
        });
    }
    /**
     * We will validate the data and create a new user and
     * return it, so the client get its new id
     *
     * @param {*} data is the json body of the request
     * @returns {Promise<User>}
     */
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the user
            const user = yield this.userRepo.create(data);
            this.events.emit(UserCreatedListener_1.UserCreatedListener.Event, user.toJSON());
            return user;
        });
    }
    /**
     * We will validate the data and update a user with the given id and
     * return the new user
     *
     * @param {number} id of the user
     * @param {*} newUser is the json body of the request
     * @returns {Promise<User>}
     */
    update(id, newUser) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Find or fail
            const user = yield this.findOne(id);
            // Set new values
            user.FirstName = newUser.firstName;
            user.LastName = newUser.lastName;
            user.Email = newUser.email;
            // Update user record
            const updatedUser = yield this.userRepo.update(id, user.toJSON());
            return updatedUser;
        });
    }
    /**
     * This will just delete a user
     *
     * @param {number} id of the user
     * @returns {Promise<void>}
     */
    destroy(id) {
        return this.userRepo.destroy(id);
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(UserCreateRequest_1.UserCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(UserUpdateRequest_1.UserUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserService.prototype, "update", null);
UserService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.UserRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__metadata("design:paramtypes", [UserRepository_1.UserRepository, Object, events_1.EventEmitter])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map