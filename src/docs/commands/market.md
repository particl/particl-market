

## Markets

Commands for managing Markets.

### market add

```
market add <profileId> <name> [type] [receiveKey] [receiveAddress] [publishKey] [publishAddress] [walletId]
```
<aside class="notice">
since: 0.1.0
</aside>

[MarketAddCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/market/MarketAddCommand.ts)

TODO description.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "market",
  "params": ["add", 3, "second market"],
  "id" : 1
}
```

Parameter       | Type      | Required | Description
--------------- | --------- | -------- | -----------
profileId       | number    | *        | 
name            | string    | *        | 
type            | string    |          | 
receiveKey      | string    |          | 
receiveAddress  | string    |          | 
publishKey      | string    |          | 
publishAddress  | string    |          | 
walletId        | number    |          | 


#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "id": 4,
    "name": "second market",
    "type": "MARKETPLACE",
    "receiveKey": "7ukyVggjdfgXTa7rjcWRvymMGDezXtAF3YMMePXKb5wfR8KvaqaX",
    "receiveAddress": "pf6YKaJgX8YKHepMXPKNk1bxDp2FB5wtpx",
    "publishKey": "7ukyVggjdfgXTa7rjcWRvymMGDezXtAF3YMMePXKb5wfR8KvaqaX",
    "publishAddress": "pf6YKaJgX8YKHepMXPKNk1bxDp2FB5wtpx",
    "updatedAt": 1563626078910,
    "createdAt": 1563626078910,
    "profileId": 3,
    "walletId": 3,
    "Profile": {
      "id": 3,
      "name": "DEFAULT",
      "address": "pX4hZ22DWTurdMZy4cus6Ag6ES1T4SP3JK",
      "updatedAt": 1563622517479,
      "createdAt": 1563622517479
    },
    "Wallet": {
      "id": 3,
      "name": "market.dat",
      "profileId": 3,
      "updatedAt": 1563622517523,
      "createdAt": 1563622517523
    }
  }
}
```

[Models/Market](#market)



### market list

```
market list [profileId]
```

<aside class="notice">
since: 0.1.0
</aside>

[MarketListCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/market/MarketListCommand.ts)

TODO description.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "market",
  "params": ["list", 1],
  "id" : 1
}
```

Parameter   | Type      | Required | Description
----------- | --------- | -------- | -----------
profileId   | number    |          | Id of the Profile which Markets we want to receive, by default the default Profile id is used.

#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": [
    {
      "id": 1,
      "name": "DEFAULT",
      "type": "MARKETPLACE",
      "receiveKey": "4dgpQuxsDVxytK22ay8Ky7xTSDGJzPu2tnr14tyBoU7CmZC6dqM",
      "receiveAddress": "PZijh4WzjCWLbSgBkMUtLHZBaU6dSSmkqN",
      "publishKey": "4dgpQuxsDVxytK22ay8Ky7xTSDGJzPu2tnr14tyBoU7CmZC6dqM",
      "publishAddress": "PZijh4WzjCWLbSgBkMUtLHZBaU6dSSmkqN",
      "updatedAt": 1566932009137,
      "createdAt": 1565613938693,
      "profileId": 1,
      "walletId": 1
    }
  ]
}
```

[Models/Market\[\]](#market)


### market remove

```
market remove <profileId> <marketId>
```

<aside class="notice">
since: 0.1.0
</aside>

[MarketRemoveCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/market/MarketRemoveCommand.ts)

TODO description.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "market",
  "params": ["remove", 14],
  "id" : 1
}
```

Parameter   | Type      | Required | Description
----------- | --------- | -------- | -----------
profileId   | number    | *        | Id of the Profile.
marketId    | number    | *        | Id of the Market.

#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0"
}
```

200 OK, if all went well.


### market default

```
market default <profileId> <marketId>
```

<aside class="notice">
since: 0.1.0
</aside>

[MarketSetDefaultCommand.ts](https://github.com/particl/particl-market/tree/develop/src/api/commands/market/MarketSetDefaultCommand.ts)

Sets the given Market as the default marketplace for given Profile.

#### Request
> Example Request 
```json
{
  "jsonrpc": "2.0",
  "method": "market",
  "params": ["default", 3, 3],
  "id" : 1
}
```

Parameter   | Type      | Required | Description
----------- | --------- | -------- | -----------
profileId   | number    | *        | Id of the Profile.
marketId    | number    | *        | Id of the Market.


#### Response

> Example Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "id": 3,
    "name": "DEFAULT",
    "type": "MARKETPLACE",
    "receiveKey": "7x8HGAu9kKBeAxicfhpk2aAF9eemUbo92AHrhsYDnVboc9PAw4XR",
    "receiveAddress": "pmkTdd7HdLZBaudUNAZ1fuJueaFgpFhf86",
    "publishKey": "7x8HGAu9kKBeAxicfhpk2aAF9eemUbo92AHrhsYDnVboc9PAw4XR",
    "publishAddress": "pmkTdd7HdLZBaudUNAZ1fuJueaFgpFhf86",
    "updatedAt": 1563625955578,
    "createdAt": 1563622515365,
    "profileId": 3,
    "walletId": 3,
    "Profile": {
      "id": 3,
      "name": "DEFAULT",
      "address": "pgfhPqfKkKj9U6UsyC99wdf35ejfRdYcm3",
      "updatedAt": 1563622514948,
      "createdAt": 1563622514948
    },
    "Wallet": {
      "id": 3,
      "name": "market.dat",
      "profileId": 3,
      "updatedAt": 1563622515171,
      "createdAt": 1563622515171
    }
  }
}
```

