import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemTemplateCreateRequest extends RequestBody {

    @IsNotEmpty()
    public profile_id: number;

    public hash: string;
    public itemInformation;
    public paymentInformation;
    public messagingInformation;
    public listingItemObjects;

}
// tslint:enable:variable-name
