# API server for participedia.net (v3)

This is a simple proxy server whose primary role is to ensure that only the
calls with the appropriate authorization credentials are able to modify the
database.  It also serves as an abstraction layer for the back-end databases,
so that we can change implementation strategies and not have to change the
front-end code.

This API is defined using Swagger (aka OpenAPI), and the `swagger` library
takes care of validating request and responses according to the schema defined
in [api/swagger/swagger.yaml](api/swagger/swagger.yaml)

The `token` authorization model refers to the Auth0 JWT token scheme.

The calls in the `/user` paths are proxied to the Auth0 administration API.
The calls in the `/case`, `/method`, `/organization` and the like are proxied
to the ElasticSearch database.
