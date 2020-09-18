// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { EnumHelper } from '../../../src/core/helpers/EnumHelper';

enum TestStringEnum {
    TEST1 = 'test1',
    TEST2 = 'test2'
}

enum TestNumericEnum {
    TEST1,
    TEST2
}

describe('EnumHelper', () => {

    test('isNumeric() should return false for TestStringEnum', () => {
        expect(EnumHelper.isNumeric(TestStringEnum)).toBeFalsy();
    });

    test('isNumeric() should return true for TestNumericEnum', () => {
        expect(EnumHelper.isNumeric(TestNumericEnum)).toBeTruthy();
    });

    test('getNames() should work for TestStringEnum', () => {
        expect(EnumHelper.getNames(TestStringEnum)).toEqual([
            'TEST1',
            'TEST2'
        ]);
    });

    test('getNames() should work for TestNumericEnum', () => {
        expect(EnumHelper.getNames(TestNumericEnum)).toEqual([
            'TEST1',
            'TEST2'
        ]);
    });

    test('getNamesAndValues() should work for TestStringEnum', () => {
        expect(EnumHelper.getNamesAndValues(TestStringEnum)).toEqual([{
            name: 'TEST1',
            value: 'test1'
        }, {
            name: 'TEST2',
            value: 'test2'
        }]);
    });

    test('getNamesAndValues() should work for TestNumericEnum', () => {
        expect(EnumHelper.getNamesAndValues<TestNumericEnum>(TestNumericEnum)).toEqual([{
            name: 'TEST1',
            value: 0
        }, {
            name: 'TEST2',
            value: 1
        }]);
    });

    test('getValues() should work for TestStringEnum', () => {
        expect(EnumHelper.getValues(TestStringEnum)).toEqual([
            'test1',
            'test2'
        ]);
    });

    test('getValues() should work for TestNumericEnum', () => {
        expect(EnumHelper.getValues(TestNumericEnum)).toEqual([
            0,
            1
        ]);
    });

    test('containsName() should return the true when name exists for TestStringEnum', () => {
        expect(EnumHelper.containsName(TestStringEnum, 'TEST1')).toBeTruthy();
    });

    test('containsName() should return the false when name doesnt exist for TestStringEnum', () => {
        expect(EnumHelper.containsName(TestStringEnum, 'DOESNT_EXIST')).toBeFalsy();
    });

    test('containsName() should return the true when name exists for TestNumericEnum', () => {
        expect(EnumHelper.containsName(TestNumericEnum, 'TEST1')).toBeTruthy();
    });

    test('containsName() should return the false when name doesnt exist for TestNumericEnum', () => {
        expect(EnumHelper.containsName(TestNumericEnum, 'DOESNT_EXIST')).toBeFalsy();
    });

});
