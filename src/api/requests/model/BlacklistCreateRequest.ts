import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import { BlacklistType } from '../../enums/BlacklistType';

// tslint:disable:variable-name
export class BlacklistCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public type: BlacklistType;

    @IsNotEmpty()
    public hash: string;

}
// tslint:enable:variable-name
