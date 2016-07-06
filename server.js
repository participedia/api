'use strict';

var SwaggerExpress = require('swagger-express-mw');
require('dotenv').config();

var {config, app} = require('./app')

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);
});
