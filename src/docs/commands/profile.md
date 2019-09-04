
## Profiles

Commands for managing Profiles.

### profile add

```
profile add <name> [address]
```
<aside class="notice">
since: 0.1.0
</aside>

[ProfileAddCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/profile/ProfileAddCommand.ts)

TODO description.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "profile",
  "params": ["add", "NEW-PROFILE"],
  "id" : 1
}
```

Parameter   | Type      | Required | Description
----------- | --------- | -------- | -----------
name        | string    | *        | Name for the new Profile.
address     | string    |          | Particl address used to identify the Profile across the network.


#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "id": 14,
    "name": "NEW-PROFILE",
    "address": "potRzCCvQeTupMnaMSTHT2biYwwyRCzsdD",
    "updatedAt": 1567619041285,
    "createdAt": 1567619041285,
    "ShippingAddresses": [],
    "CryptocurrencyAddresses": [],
    "FavoriteItems": [],
    "ShoppingCart": [
      {
        "id": 14,
        "name": "DEFAULT",
        "profileId": 14,
        "updatedAt": 1567619041310,
        "createdAt": 1567619041310
      }
    ],
    "Markets": [],
    "Wallets": []
  }
}
```

[Models/Profile](#profile)




### profile get

```
profile get <id|name>
```
<aside class="notice">
since: 0.1.0
</aside>

[ProfileGetCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/profile/ProfileGetCommand.ts)

TODO description.

#### Request
> Request 
```json
{
  "jsonrpc": "2.0",
  "method": "profile",
  "params": ["get", 13],
  "id" : 1
}
```

Either the id or the name is required.

Parameter   | Type      | Required | Description
----------- | --------- | -------- | -----------
id          | number    | *        | Id of the Profile.
name        | string    | *        | Name of the Profile.

#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "id": 14,
    "name": "NEW-PROFILE",
    "address": "potRzCCvQeTupMnaMSTHT2biYwwyRCzsdD",
    "updatedAt": 1567619041285,
    "createdAt": 1567619041285,
    "ShippingAddresses": [],
    "CryptocurrencyAddresses": [],
    "FavoriteItems": [],
    "ShoppingCart": [
      {
        "id": 14,
        "name": "DEFAULT",
        "profileId": 14,
        "updatedAt": 1567619041310,
        "createdAt": 1567619041310
      }
    ],
    "Markets": [],
    "Wallets": []
  }
}
```

[Models/Profile](#profile)



### profile list

```
profile list
```

<aside class="notice">
since: 0.1.0
</aside>

[ProfileListCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/profile/ProfileListCommand.ts)

TODO description.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "profile",
  "params": ["list"],
  "id" : 1
}
```

#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": [
    {
      "id": 13,
      "name": "DEFAULT",
      "address": "pgtrQ5FgZ8zTyRSxfG7Guw54vPS5Ms7PaV",
      "updatedAt": 1567514234223,
      "createdAt": 1567514234223
    },
    {
      "id": 14,
      "name": "NEW-PROFILE",
      "address": "potRzCCvQeTupMnaMSTHT2biYwwyRCzsdD",
      "updatedAt": 1567619041285,
      "createdAt": 1567619041285
    }
  ]
}
```

[Models/Profile\[\]](#profile)


### profile remove

```
profile remove <id>
```

<aside class="notice">
since: 0.1.0
</aside>

[ProfileRemoveCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/profile/ProfileRemoveCommand.ts)

TODO description.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "profile",
  "params": ["remove", 14],
  "id" : 1
}
```

Parameter   | Type      | Required | Description
----------- | --------- | -------- | -----------
id          | number    | *        | Id of the Profile.

#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0"
}
```

200 OK, if all went well.


### profile update

```
profile update <id> <newName>
```

<aside class="notice">
since: 0.1.0
</aside>

[ProfileUpdateCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/profile/ProfileUpdateCommand.ts)

TODO description.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "profile",
  "params": ["update", 14, "NEW-NAME"],
  "id" : 1
}
```

Parameter   | Type      | Required | Description
----------- | --------- | -------- | -----------
id          | number    | *        | Id of the Profile.
newName     | string    | *        | New name for the Profile.


#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "id": 14,
    "name": "NEW-NAME",
    "address": "potRzCCvQeTupMnaMSTHT2biYwwyRCzsdD",
    "updatedAt": 1567619041285,
    "createdAt": 1567619041285,
    "ShippingAddresses": [],
    "CryptocurrencyAddresses": [],
    "FavoriteItems": [],
    "ShoppingCart": [
      {
        "id": 14,
        "name": "DEFAULT",
        "profileId": 14,
        "updatedAt": 1567619041310,
        "createdAt": 1567619041310
      }
    ],
    "Markets": [],
    "Wallets": []
  }
}
```

