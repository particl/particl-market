"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const LockedOutputRepository_1 = require("../repositories/LockedOutputRepository");
const LockedOutputCreateRequest_1 = require("../requests/LockedOutputCreateRequest");
const LockedOutputUpdateRequest_1 = require("../requests/LockedOutputUpdateRequest");
const CoreRpcService_1 = require("./CoreRpcService");
let LockedOutputService = class LockedOutputService {
    constructor(coreRpcService, lockedOutputRepo, Logger) {
        this.coreRpcService = coreRpcService;
        this.lockedOutputRepo = lockedOutputRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.lockedOutputRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lockedOutput = yield this.lockedOutputRepo.findOne(id, withRelated);
            if (lockedOutput === null) {
                this.log.warn(`LockedOutput with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return lockedOutput;
        });
    }
    findOneByTxId(txid, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lockedOutput = yield this.lockedOutputRepo.findOneByTxId(txid, withRelated);
            return lockedOutput;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create LockedOutput, body: ', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the lockedOutput
            const lockedOutput = yield this.lockedOutputRepo.create(body).catch(reason => {
                this.log.error('error:', reason);
                throw reason;
            });
            // finally find and return the created lockedOutput
            const newLockedOutput = yield this.findOne(lockedOutput.id);
            return newLockedOutput;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const lockedOutput = yield this.findOne(id, false);
            // set new values
            lockedOutput.Txid = body.txid;
            lockedOutput.Vout = body.vout;
            lockedOutput.Amount = body.amount;
            lockedOutput.Data = body.data;
            lockedOutput.Address = body.address;
            lockedOutput.ScriptPubKey = body.scriptPubKey;
            // update lockedOutput record
            const updatedLockedOutput = yield this.lockedOutputRepo.update(id, lockedOutput.toJSON());
            return updatedLockedOutput;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.lockedOutputRepo.destroy(id);
        });
    }
    createLockedOutputs(outputs, bidId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lockedOutputs = [];
            for (const selectedOutput of outputs) {
                selectedOutput.bid_id = bidId;
                const lockedOutputModel = yield this.create(selectedOutput);
                const lockedOutput = lockedOutputModel.toJSON();
                lockedOutputs.push(lockedOutput);
            }
            return lockedOutputs;
        });
    }
    destroyLockedOutputs(outputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const selectedOutput of outputs) {
                const lockedOutput = yield this.findOneByTxId(selectedOutput.txid);
                if (lockedOutput) {
                    yield this.destroy(lockedOutput.Id);
                }
            }
        });
    }
    lockOutputs(outputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('locking outputs:', JSON.stringify(outputs));
            const locked = yield this.coreRpcService.lockUnspent(false, outputs)
                .catch(reason => {
                if (reason.body.error.code === -8) {
                    // "message": "Invalid parameter, output already locked"
                    return true;
                }
                throw reason;
            });
            this.log.debug('outputs locked?', locked);
            return locked;
        });
    }
    unlockOutputs(outputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('unlocking outputs:', JSON.stringify(outputs));
            const unlocked = yield this.coreRpcService.lockUnspent(true, outputs);
            this.log.debug('outputs unlocked?', unlocked);
            return unlocked;
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(LockedOutputCreateRequest_1.LockedOutputCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [LockedOutputCreateRequest_1.LockedOutputCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], LockedOutputService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(LockedOutputUpdateRequest_1.LockedOutputUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, LockedOutputUpdateRequest_1.LockedOutputUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], LockedOutputService.prototype, "update", null);
LockedOutputService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Repository.LockedOutputRepository)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [CoreRpcService_1.CoreRpcService,
        LockedOutputRepository_1.LockedOutputRepository, Object])
], LockedOutputService);
exports.LockedOutputService = LockedOutputService;
//# sourceMappingURL=LockedOutputService.js.map