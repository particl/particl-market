import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class WalletUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public name: string;

}
// tslint:enable:variable-name
