psql -d template1 -c "DROP DATABASE participedia;" -c "CREATE DATABASE participedia;"
psql -d participedia -f migrations/setup.sql
