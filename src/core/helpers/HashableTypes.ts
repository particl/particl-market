import * as resources from 'resources';
import { ListingItemCreateRequest } from '../../api/requests/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../../api/requests/ListingItemTemplateCreateRequest';

export type HashableTypes = resources.ListingItem | resources.ListingItemTemplate | ListingItemCreateRequest | ListingItemTemplateCreateRequest;
