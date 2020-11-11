import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import { ActionMessageTypes } from '../../enums/ActionMessageTypes';


// tslint:disable:variable-name
export class NotificationCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public type: ActionMessageTypes;

    @IsNotEmpty()
    public objectId: number;

    public objectHash: string;
    public parentObjectId: number;
    public parentObjectHash: string;
    public target: string;
    public from: string;
    public to: string;
    public market: string;
    public category: string;
    public read: boolean;

}
// tslint:enable:variable-name
