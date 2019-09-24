## Profile
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "id": 13,
    "name": "DEFAULT",
    "address": "pgtrQ5FgZ8zTyRSxfG7Guw54vPS5Ms7PaV",
    "updatedAt": 1567514234223,
    "createdAt": 1567514234223,
    "ShippingAddresses": [
      {
        "id": 12,
        "firstName": "Frami",
        "lastName": "Zemlak Inc",
        "title": "Douglas",
        "addressLine1": "26323 D'Amore Course",
        "addressLine2": "Apt. 806",
        "city": "Kertzmannborough",
        "state": "Illinois",
        "country": "MZ",
        "zipCode": "41555",
        "type": "SHIPPING_OWN",
        "profileId": 13,
        "updatedAt": 1567514236888,
        "createdAt": 1567514236888
      },
      {
        "id": 13,
        "firstName": "Frami",
        "lastName": "Zemlak Inc",
        "title": null,
        "addressLine1": "26323 D'Amore Course",
        "addressLine2": "Apt. 806",
        "city": "Kertzmannborough",
        "state": "Illinois",
        "country": "MZ",
        "zipCode": "41555",
        "type": "SHIPPING_BID",
        "profileId": 13,
        "updatedAt": 1567514343888,
        "createdAt": 1567514343888
      }
    ],
    "CryptocurrencyAddresses": [],
    "FavoriteItems": [],
    "ShoppingCart": [
      {
        "id": 13,
        "name": "DEFAULT",
        "profileId": 13,
        "updatedAt": 1567514234238,
        "createdAt": 1567514234238
      }
    ],
    "Markets": [
      {
        "id": 13,
        "name": "DEFAULT",
        "type": "MARKETPLACE",
        "receiveKey": "7p1RiFvAGcmpwd4H18NnTS5aWc9bVfFfwShrrv9fwSYz3orJ3Y7c",
        "receiveAddress": "ppCCuPJqEUZ1Z1c4W5bsPoQrt1R7JVy7qQ",
        "publishKey": "7p1RiFvAGcmpwd4H18NnTS5aWc9bVfFfwShrrv9fwSYz3orJ3Y7c",
        "publishAddress": "ppCCuPJqEUZ1Z1c4W5bsPoQrt1R7JVy7qQ",
        "updatedAt": 1567609642003,
        "createdAt": 1567514234585,
        "profileId": 13,
        "walletId": 13,
        "Wallet": {
          "id": 13,
          "name": "market",
          "profileId": 13,
          "updatedAt": 1567514234278,
          "createdAt": 1567514234278
        }
      }
    ],
    "Wallets": [
      {
        "id": 13,
        "name": "market",
        "profileId": 13,
        "updatedAt": 1567514234278,
        "createdAt": 1567514234278,
        "Markets": [
          {
            "id": 13,
            "name": "DEFAULT",
            "type": "MARKETPLACE",
            "receiveKey": "7p1RiFvAGcmpwd4H18NnTS5aWc9bVfFfwShrrv9fwSYz3orJ3Y7c",
            "receiveAddress": "ppCCuPJqEUZ1Z1c4W5bsPoQrt1R7JVy7qQ",
            "publishKey": "7p1RiFvAGcmpwd4H18NnTS5aWc9bVfFfwShrrv9fwSYz3orJ3Y7c",
            "publishAddress": "ppCCuPJqEUZ1Z1c4W5bsPoQrt1R7JVy7qQ",
            "updatedAt": 1567609642003,
            "createdAt": 1567514234585,
            "profileId": 13,
            "walletId": 13
          }
        ]
      }
    ]
  }
}
```
[Profile.ts](https://github.com/particl/particl-market/tree/develop/src/api/models/Profile.ts)

Relations               | Type                      | Description
----------------------- | ------------------------- | -----------
ShippingAddresses       | Address[]                 | Shipping addresses stored for the Profile.
CryptocurrencyAddresses | CryptocurrencyAddress[]   | 
FavoriteItems           | FavoriteItem[]            | Favorited ListingItems.
ShoppingCart            | ShoppingCart[]            |
Markets                 | Market[]                  | Markets added to the Profile. 
Markets.Wallet          | Wallet                    |
Wallets                 | Wallet[]                  | 
Wallets.Markets         | Market[]                  |

