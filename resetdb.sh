#!/usr/local/bin/bash

psql -a -c 'create database participedia;'
psql -a -d participedia -f setup.sql              
