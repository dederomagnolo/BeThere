### Routes

### AUTHORIZATION ###

- `/auth/register` POST
for new users

```json
{
	"email": "debora@test.com",
	"username": "dromagnolo",
	"password": "testing123"
}
```

- `/auth/authenticate` POST
returns token for the user

```json
{
	"username": "dromagnolo",
	"password": "testing123"
}
```

