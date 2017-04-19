# API server for participedia.net (v3)

[![Greenkeeper badge](https://badges.greenkeeper.io/participedia/api.svg)](https://greenkeeper.io/)

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

Some environment variables need to be defined, either in the environment or in a `.env` file located
in the root directory of the folder, defining the following environment variables:
 * `DATABASE_URL` points to a Postgres database (including username & password)
 * `AWS_REGION`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for the usual AWS
    purposes (used for S3)

`yarn start` starts the API server.

`yarn test` runs the test suite.  

`swagger project editor` can be used (once `swagger` is installed) to edit the
API definition file.
