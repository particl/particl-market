import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemImageDataCreateRequest extends RequestBody {

    @IsNotEmpty()
    public dataId: string;

    @IsNotEmpty()
    public protocol: string;

    @IsNotEmpty()
    public encoding: string;

    @IsNotEmpty()
    public data: string;

}

