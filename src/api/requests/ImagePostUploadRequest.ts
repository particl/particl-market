import { IsNotEmpty, IsNumberString } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

export class ImagePostUploadRequest extends RequestBody {
    @IsNotEmpty()
    @IsNumberString()
    public id: number;

    @IsNotEmpty()
    public result: any;

    @IsNotEmpty()
    public requestBody: any;

    @IsNotEmpty()
    public request: any;
}
