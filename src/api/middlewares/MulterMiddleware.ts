import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import * as multer from 'multer';

export class MulterMiddleware implements interfaces.Middleware {

    public log: LoggerType;
    private upload: any;

    constructor(
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        // setup multer middleware
        this.upload = multer({ dest: 'data/uploads/' });
    }

    public use = (req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction): void => {
        this.log.debug('multerMiddleware start');
        const multerMiddleware = this.upload.any();
        multerMiddleware(req, res, next);
    }
}
