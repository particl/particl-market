import { IsArray, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class RpcRequest extends RequestBody {

    @IsNotEmpty()
    public id: number;

    @IsNotEmpty()
    public jsonrpc: string;

    @IsNotEmpty()
    public method: string;

    @IsNotEmpty()
    @IsArray()
    public params: any[];

}
// tslint:enable:variable-name
