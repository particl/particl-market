// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';
import { CurrencyPriceService } from '../../services/model/CurrencyPriceService';
import { MessageException } from '../../exceptions/MessageException';
import { CurrencyPrice } from '../../models/CurrencyPrice';
import { SupportedCurrencies } from '../../enums/SupportedCurrencies';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class CurrencyPriceRootCommand extends BaseCommand implements RpcCommandInterface<resources.CurrencyPrice[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.CurrencyPriceService) private currencyPriceService: CurrencyPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.CURRENCYPRICE_ROOT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: fromCurrency
     * [1]: toCurrency
     * [...]: toCurrency
     *
     * description: fromCurrency must be PART for now and toCurrency may be multiple currencies like INR, USD etc..
     * example: [PART, INR, USD, EUR, GBP, ....]
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<"resources".CurrencyPrice[]>}
     *
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<resources.CurrencyPrice[]> {

        const fromCurrency = data.params.shift().toUpperCase();

        // convert params to uppercase
        const toCurrencies: string[] = [];
        for (const param of data.params) {
            toCurrencies.push(param.toUpperCase());
        }
        return await this.currencyPriceService.getCurrencyPrices(fromCurrency, toCurrencies);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('fromCurrency');
        } else if (data.params.length < 2) {
            throw new MissingParamException('toCurrency');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('fromCurrency', 'string');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('toCurrency', 'string');
        }

        if (data.params[0].toUpperCase() !== 'PART') {
            throw new MessageException(`Currently fromCurrency = {fromCurrency} not supported. Only PART supported.`);
        }

        for (let i = 1; i < data.params.length; ++i) {
            const toCurrency = data.params[i].toUpperCase();
            if (!SupportedCurrencies[toCurrency]) {
                throw new MessageException(`Currently toCurrency = {toCurrency} not supported.`);
            }

        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' <from> <to> [to...])  -  ' + this.description();
    }

    public help(): string {
        return this.usage() + '\n'
            + '    <fromCurrency>                   - Currency name from which you want to convert. \n'
            + '    <toCurrency>                     - Currency name in which you want to convert. ';
    }

    public description(): string {
        return 'Command to convert currencies.';
    }

    public example(): any {
        return 'currencyprice PART EUR USD';
    }
}
