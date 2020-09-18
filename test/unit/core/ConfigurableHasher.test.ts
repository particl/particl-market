// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableImageCreateRequestConfig } from '../../../src/api/factories/hashableconfig/createrequest/HashableImageCreateRequestConfig';


describe('ConfigurableHasher', () => {

    test('Should fail to return hash for HashableImage', () => {
        expect.assertions(1);
        try {
            ConfigurableHasher.hash({}, new HashableImageCreateRequestConfig());
        } catch (error) {
            expect(error).toEqual(new Error('imageData: missing'));
        }
    });

    test('Should return hash for HashableImage', () => {
        const hash = ConfigurableHasher.hash({
            data: ImageProcessing.milkcatSmall
        }, new HashableImageCreateRequestConfig());

        expect(hash).toBe('0844d47be9d6c06de3db0835696e2d03b2fc22bef07061590c33c080c80cfae0');
    });

});
