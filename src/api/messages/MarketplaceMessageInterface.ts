import { ActionMessageInterface } from './ActionMessageInterface';
import {ItemMessageInterface} from './ItemMessageInterface';

export interface MarketplaceMessageInterface {
    version: string;
    mpaction?: ActionMessageInterface;
    item?: ItemMessageInterface;
}
