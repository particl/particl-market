"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const ProfileService_1 = require("./ProfileService");
const CoreRpcService_1 = require("./CoreRpcService");
let DefaultProfileService = class DefaultProfileService {
    constructor(profileService, coreRpcService, Logger) {
        this.profileService = profileService;
        this.coreRpcService = coreRpcService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    // TODO: if something goes wrong here and default profile does not get created, the application should stop
    seedDefaultProfile() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const defaultProfile = {
                name: 'DEFAULT'
            };
            const newProfile = yield this.insertOrUpdateProfile(defaultProfile);
            this.log.debug('default Profile: ', JSON.stringify(newProfile.toJSON(), null, 2));
            return;
        });
    }
    insertOrUpdateProfile(profile) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let newProfile = yield this.profileService.findOneByName(profile.name);
            if (newProfile === null) {
                this.log.debug('creating new default profile');
                newProfile = yield this.profileService.create(profile);
                this.log.debug('created new default profile');
            }
            else {
                if (newProfile.Address === 'ERROR_NO_ADDRESS') {
                    this.log.debug('updating default profile');
                    profile.address = yield this.profileService.getNewAddress();
                    newProfile = yield this.profileService.update(newProfile.Id, profile);
                }
            }
            return newProfile;
        });
    }
};
DefaultProfileService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ProfileService_1.ProfileService,
        CoreRpcService_1.CoreRpcService, Object])
], DefaultProfileService);
exports.DefaultProfileService = DefaultProfileService;
//# sourceMappingURL=DefaultProfileService.js.map