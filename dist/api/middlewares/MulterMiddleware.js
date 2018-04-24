"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const multer = require("multer");
let MulterMiddleware = class MulterMiddleware {
    constructor(Logger) {
        this.use = (req, res, next) => {
            this.log.debug('multerMiddleware start');
            const multerMiddleware = this.upload.any();
            multerMiddleware(req, res, next);
        };
        this.imageFilter = (req, file, cb) => {
            // accept image only
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        };
        this.log = new Logger(__filename);
        // setup multer middleware
        // this.upload = multer({ dest: 'data/uploads/' });
        this.upload = multer({ dest: 'data/uploads/', fileFilter: this.imageFilter });
    }
};
MulterMiddleware = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], MulterMiddleware);
exports.MulterMiddleware = MulterMiddleware;
//# sourceMappingURL=MulterMiddleware.js.map