"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const UserService_1 = require("../services/UserService");
const constants_1 = require("../../constants");
let PopulateUserMiddleware = class PopulateUserMiddleware {
    constructor(Logger, userService) {
        this.userService = userService;
        this.use = (req, res, next) => {
            // Check if the authenticate middleware was successful
            if (!req.tokeninfo || !req.tokeninfo.user_id) {
                return res.failed(400, 'Missing token information!');
            }
            // Find user from the token and store him in the request object
            this.userService.findByUserId(req.tokeninfo.user_id)
                .then((user) => {
                req.user = user.toJSON();
                this.log.debug(`populated user with the id=${req.user.id} to the request object`);
                next();
            })
                .catch((error) => {
                this.log.warn(`could not populate user to the request object`);
                next(error);
            });
        };
        this.log = new Logger(__filename);
    }
};
PopulateUserMiddleware = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.UserService)),
    tslib_1.__metadata("design:paramtypes", [Object, UserService_1.UserService])
], PopulateUserMiddleware);
exports.PopulateUserMiddleware = PopulateUserMiddleware;
//# sourceMappingURL=PopulateUserMiddleware.js.map