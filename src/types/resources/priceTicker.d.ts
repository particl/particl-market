// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface PriceTicker {
        id: number;

        cryptoId: string;
        cryptoName: string;
        cryptoSymbol: string;
        cryptoRank: string;
        crypto24HVolumeUsd: string;
        cryptoPriceUsd: string;
        cryptoPriceBtc: string;
        cryptoMarketCapUsd: string;
        cryptoAvailableSupply: string;
        cryptoTotalSupply: string;
        cryptoMaxSupply: string;
        cryptoPercentChange1H: string;
        cryptoPercentChange24H: string;
        cryptoPercentChange7D: string;
        cryptoLastUpdated: string;
        cryptoPriceEur: string;
        crypto24HVolumeEur: string;
        cryptoMarketCapEur: string;

        createdAt: Date;
        updatedAt: Date;
    }

}
