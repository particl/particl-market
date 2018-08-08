// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class BidDataUpdateRequest extends RequestBody {
  @IsNotEmpty()
  public bid_id: number;

  public dataId: string;

  public dataValue: string;
}
// tslint:enable:variable-name
