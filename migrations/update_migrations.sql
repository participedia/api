
-- new migrations only

-- types, fix data for scope_of_implementation, case_view_localized, etc.
\include 'migrations/migration_011.sql'
-- create functions get_components and get_object_title_list
-- define type full_case
\include 'migrations/migration_012.sql'
-- Data cleanup for cases.general_issues and cases.special_topics
\include 'migrations/migration_013.sql'
-- Create table tags_localized, clean up tags data
\include 'migrations/migration_014.sql'
-- data cleanup for scope_of_influence, time_limited, purposes, and approaches
-- updates to case_view_localized
\include 'migrations/migration_016.sql'
-- data cleanup on very many case fields
\include 'migrations/migration_019.sql'
-- data cleanup for scope_of_influence, participants_interactions, learning_resources
\include 'migrations/migration_021.sql'
-- Update case_view_localized
-- data cleanup for if_voting, insights_outcomes, implementers_of_change
\include 'migrations/migration_023.sql'
-- drop functions get_methods and get_organizations
-- define methods get_case_by_id() and friends
\include 'migrations/migration_024.sql'
-- type user_name
-- define function get_user_name
\include 'migrations/migration_030.sql'
-- define functions urls_to_links and urls_to_files
-- convert evaluation_report + evaluation_links
\include 'migrations/migration_031.sql'
-- move latitude & longitude to floats
-- define type full_case, drop other types
\include 'migrations/migration_033.sql'
-- migrate methods to new model and clean up
\include 'migrations/migration_034.sql'
-- migrate organizations to new model and clean up
\include 'migrations/migration_035.sql'
-- update object_short to include post_date and bookmarked
\include 'migrations/migration_036.sql'
-- create table for new localization keys
\include 'migrations/migration_037.sql'
-- create search index
\include 'migrations/migration_038.sql'
-- add columns level_complexity and purpose_method
\include 'migrations/migration_039.sql'
-- Add fallback for languages that don't have local localization
\include `migrations/migration_040.sql`
