import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemTemplatePostRequest extends RequestBody {

    @IsNotEmpty()
    public id: number;

    @IsNotEmpty()
    public hash: string;

    public ItemInformation;
    public PaymentInformation;
    public MessagingInformation;
    public ListingItemObjects;

}
// tslint:enable:variable-name
