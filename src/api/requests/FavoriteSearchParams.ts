import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';

// tslint:disable:variable-name
export class FavoriteSearchParams extends RequestBody {

    @IsNotEmpty()
    public profileId: string | number;

    @IsNotEmpty()
    public itemId: string | number;

}
// tslint:enable:variable-name
