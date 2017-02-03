FROM node:7.2.0-alpine

WORKDIR /app
COPY . .
# RUN npm install --production
RUN ./node_modules/.bin/babel-node server.js

# if we don't use this specific form, SIGINT/SIGTERM doesn't get forwarded
CMD node index.js
