"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ValidationException_1 = require("../exceptions/ValidationException");
const PaymentInformationRepository_1 = require("../repositories/PaymentInformationRepository");
const PaymentInformationCreateRequest_1 = require("../requests/PaymentInformationCreateRequest");
const PaymentInformationUpdateRequest_1 = require("../requests/PaymentInformationUpdateRequest");
const EscrowService_1 = require("./EscrowService");
const ItemPriceService_1 = require("./ItemPriceService");
let PaymentInformationService = class PaymentInformationService {
    constructor(itemPriceService, escrowService, paymentInformationRepo, Logger) {
        this.itemPriceService = itemPriceService;
        this.escrowService = escrowService;
        this.paymentInformationRepo = paymentInformationRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.paymentInformationRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const paymentInformation = yield this.paymentInformationRepo.findOne(id, withRelated);
            if (paymentInformation === null) {
                this.log.warn(`PaymentInformation with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return paymentInformation;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // ItemInformation needs to be related to either one
            if (body.listing_item_id == null && body.listing_item_template_id == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
            }
            // extract and remove related models from request
            const escrow = body.escrow;
            const itemPrice = body.itemPrice;
            delete body.escrow;
            delete body.itemPrice;
            // If the request body was valid we will create the paymentInformation
            const paymentInformation = yield this.paymentInformationRepo.create(body);
            // create related models, escrow
            if (!_.isEmpty(escrow)) {
                escrow.payment_information_id = paymentInformation.Id;
                yield this.escrowService.create(escrow);
            }
            // create related models, item price
            if (!_.isEmpty(itemPrice)) {
                itemPrice.payment_information_id = paymentInformation.Id;
                yield this.itemPriceService.create(itemPrice);
            }
            // finally find and return the created paymentInformation
            return yield this.findOne(paymentInformation.Id);
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // ItemInformation needs to be related to either one
            if (body.listing_item_id == null && body.listing_item_template_id == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
            }
            // find the existing one without related
            const paymentInformation = yield this.findOne(id, false);
            // set new values
            paymentInformation.Type = body.type;
            // update paymentInformation record
            const updatedPaymentInformation = yield this.paymentInformationRepo.update(id, paymentInformation.toJSON());
            if (body.escrow) {
                // find related record and delete it
                let relatedEscrow = updatedPaymentInformation.related('Escrow').toJSON();
                yield this.escrowService.destroy(relatedEscrow.id);
                // recreate related data
                relatedEscrow = body.escrow;
                relatedEscrow.payment_information_id = id;
                yield this.escrowService.create(relatedEscrow);
            }
            // find related record and delete it
            let relatedItemPrice = updatedPaymentInformation.related('ItemPrice').toJSON();
            yield this.itemPriceService.destroy(relatedItemPrice.id);
            // recreate related data
            relatedItemPrice = body.itemPrice;
            relatedItemPrice.payment_information_id = id;
            yield this.itemPriceService.create(relatedItemPrice);
            // finally find and return the updated paymentInformation
            const newPaymentInformation = yield this.findOne(id);
            return newPaymentInformation;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.paymentInformationRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(PaymentInformationCreateRequest_1.PaymentInformationCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [PaymentInformationCreateRequest_1.PaymentInformationCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentInformationService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(PaymentInformationUpdateRequest_1.PaymentInformationUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, PaymentInformationUpdateRequest_1.PaymentInformationUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentInformationService.prototype, "update", null);
PaymentInformationService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ItemPriceService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.EscrowService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Repository.PaymentInformationRepository)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ItemPriceService_1.ItemPriceService,
        EscrowService_1.EscrowService,
        PaymentInformationRepository_1.PaymentInformationRepository, Object])
], PaymentInformationService);
exports.PaymentInformationService = PaymentInformationService;
//# sourceMappingURL=PaymentInformationService.js.map