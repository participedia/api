# API server for participedia.net (v3)

This is a simple proxy server whose primary role is to ensure that only the
calls with the appropriate authorization credentials are able to modify the
database.  It also serves as an abstraction layer for the back-end databases,
so that we can change implementation strategies and not have to change the
front-end code.

This API is defined using Swagger (aka OpenAPI), and the `swagger` library
takes care of validating request and responses according to the schema defined
in [api/swagger/swagger.yaml](api/swagger/swagger.yaml).

The critical code is in [api/controllers](/api/controllers).

The `token` authorization model refers to the Auth0 JWT token scheme, and
many calls look at group memberships defined by the Auth0 app.

The calls in the `/user` paths are proxied to the Auth0 administration API.
The calls in the `/case`, `/method`, `/organization` and the like are backed by calls
to the DynamoDB database.

The code expects a file `.env` to be located in the root directory of the folder,
defining the following environment variables:
`AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` as per the Auth0 application which
is managing the users.

`npm start` starts the API server.

`npm test` runs the test suite.  These are written using
[http://visionmedia.github.io/superagent/](superagent) and
[https://github.com/substack/tape](tape)

`swagger project editor` can be used (once `swagger` is installed) to edit the
API definition file.
