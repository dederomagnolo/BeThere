### Routes

##### AUTHORIZATION #####

- `/auth/register` POST
:for new users

```json
{
	"email": "debora@test.com",
	"username": "dromagnolo",
	"password": "testing123"
}
```

- `/auth/authenticate` POST
:returns token for the user

```json
{
	"username": "dromagnolo",
	"password": "testing123"
}
```

##### DEVICES #####

- `/devices/verify` POST
:returns if the entered serial key is valid

```json
{
	"deviceSerialKey": "34PQL-YBAZJ-TVVHL-77HRV"
}
```

- `/devices/new` POST
:to associate a device with an user

```json
{
	"deviceSerialKey": "62XBH-YPRK5-0QID5-5FVCP",
	"email": "debora@test.com"
}
```

- `/devices/user-devices` POST
:get all devices of an user

```json
{
	"userId": "607c7c84e3c6d43b78adabf1"
}
```

