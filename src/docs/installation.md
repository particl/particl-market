# Installation

## Docker

```
$ docker-compose up --build
```

For development, the easiest way to run the marketplace is to run it using docker-compose. 

The default configuration will start up two marketplace instances and two particl-core's by default.

* particl-market1 rpc - http://localhost:3100/api/rpc/
* particl-market2 rpc -  http://localhost:3200/api/rpc/
* particl-core1 rpc -  http://localhost:52935/
* particl-core2 rpc -  http://localhost:53935/
