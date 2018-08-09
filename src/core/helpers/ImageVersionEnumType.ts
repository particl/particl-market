// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Enum, EnumValue } from 'ts-enums';
import { ImageVersion } from './ImageVersion';

export class ImageVersionEnumType extends Enum<ImageVersion> {

    public ORIGINAL: ImageVersion   = new ImageVersion('ORIGINAL');
    public THUMBNAIL: ImageVersion  = new ImageVersion('THUMBNAIL', 250, 200);
    public MEDIUM: ImageVersion     = new ImageVersion('MEDIUM', 400, 400);
    public LARGE: ImageVersion      = new ImageVersion('LARGE', 1920, 2560);

    constructor() {
        super();
        this.initEnum('ImageVersion');
    }

}

export const ImageVersions: ImageVersionEnumType = new ImageVersionEnumType();
