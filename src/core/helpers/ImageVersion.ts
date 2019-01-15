// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Enum, EnumValue } from 'ts-enums';

export class ImageVersion extends EnumValue {

    constructor(private name: string, private height: number = 0, private width: number = 0) {
        super(name);
    }

    get imageHeight(): number {
        return this.height;
    }

    get imageWidth(): number {
        return this.width;
    }
}
