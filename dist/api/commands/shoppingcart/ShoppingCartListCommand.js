"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const RpcRequest_1 = require("../../requests/RpcRequest");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const BaseCommand_1 = require("../BaseCommand");
const CommandEnumType_1 = require("../CommandEnumType");
const ShoppingCartService_1 = require("../../services/ShoppingCartService");
const ProfileService_1 = require("../../services/ProfileService");
const MessageException_1 = require("../../exceptions/MessageException");
let ShoppingCartListCommand = class ShoppingCartListCommand extends BaseCommand_1.BaseCommand {
    constructor(shoppingCartService, profileService, Logger) {
        super(CommandEnumType_1.Commands.SHOPPINGCART_LIST);
        this.shoppingCartService = shoppingCartService;
        this.profileService = profileService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: profileId || profileName
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<ShoppingCart>>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let profile;
            // if data.params[0] is number then find by profileId else find
            if (typeof data.params[0] === 'number') {
                profile = yield this.profileService.findOne(data.params[0]);
            }
            else {
                profile = yield this.profileService.findOneByName(data.params[0]);
                if (profile === null) {
                    this.log.warn(`Profile with the name = ${data.params[0]} was not found!`);
                    throw new MessageException_1.MessageException(`Profile with the name = ${data.params[0]} was not found!`);
                }
            }
            return this.shoppingCartService.findAllByProfile(profile.id);
        });
    }
    usage() {
        return this.getName() + ' [<profileId>|<profileName>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - The Id of the profile associated with the shopping cart we want to search for. \n'
            + '    <profileName>            - The name of the profile associated with the shopping cart we want to search for. ';
    }
    description() {
        return 'List the all shopping cart associated with given profile id or profile name.';
    }
    example() {
        return 'cart ' + this.getName() + ' 1 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShoppingCartListCommand.prototype, "execute", null);
ShoppingCartListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ShoppingCartService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ShoppingCartService_1.ShoppingCartService,
        ProfileService_1.ProfileService, Object])
], ShoppingCartListCommand);
exports.ShoppingCartListCommand = ShoppingCartListCommand;
//# sourceMappingURL=ShoppingCartListCommand.js.map