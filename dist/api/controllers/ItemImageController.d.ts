import { ItemImageService } from '../services/ItemImageService';
import { ItemImageHttpUploadService } from '../services/ItemImageHttpUploadService';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ItemImageController {
    private itemImageService;
    private itemImageHttpUploadService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(itemImageService: ItemImageService, itemImageHttpUploadService: ItemImageHttpUploadService, Logger: typeof LoggerType);
    create(res: myExpress.Response, templateId: string, body: any, req: any): Promise<any>;
    publishImage(res: myExpress.Response, id: string, imageVersion: string): Promise<any>;
}
