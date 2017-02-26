# If DATABASE_URL is not set, falls back to local database "participedia"
# To set DATABASE_URL:
# export DATABASE_URL="`heroku config:get --app $MY_APP DATABASE_URL`"
# where $MY_APP is the Heroku instance to get the databased connection string from the
# environment of. For instance, in development my $MY_APP is "participedia-dethe"
#
# psql -d template1 -c "DROP DATABASE participedia;" -c "CREATE DATABASE participedia;"
psql -d $DATABASE_URL -f migrations/setup.sql
