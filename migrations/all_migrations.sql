-- migrations on .xyz

-- add typical_purposes to methods
\include 'migrations/migration_002.sql'
-- add communication_outcomes to methods
\include 'migrations/migration_003.sql'
-- add groups to users
\include 'migrations/migration_004.sql'
-- set isadmin to true for certain users
\include 'migrations/migration_007.sql'

-- new migrations

-- create case_edit_localized table
-- \include 'migrations/migration_008.sql'
-- create case_view_localized table
-- \include 'migrations/migration_009.sql'
-- create layout_localized table
-- \include 'migrations/migration_010.sql'
-- create types localized_value, full_file, full_link and map columns to them
-- also move issues -> general_issues, add method_types, tools_techniques and
-- types, fix data for scope_of_implementation, case_view_localized, etc.
\include 'migrations/migration_011.sql'
-- create functions get_components and get_object_title_list
-- define type full_case
\include 'migrations/migration_012.sql'
-- Data cleanup for cases.general_issues and cases.special_topics
\include 'migrations/migration_013.sql'
-- Create table tags_localized, clean up tags data
\include 'migrations/migration_014.sql'
-- define function get_case_localized_value, etc.
--\include 'migrations/migration_015.sql'
-- data cleanup for scope_of_influence, time_limited, purposes, and approaches
-- updates to case_view_localized
\include 'migrations/migration_016.sql'
-- updates to case_view_localized and functions to support that
-- \include 'migrations/migration_017.sql'
-- updates to case_view_localized
-- \include 'migrations/migration_018.sql'
-- data cleanup on very many case fields
\include 'migrations/migration_019.sql'
-- update to case_view_localized
-- \include 'migrations/migration_020.sql'
-- data cleanup for scope_of_influence, participants_interactions, learning_resources
\include 'migrations/migration_021.sql'
-- update case_view_localized
-- \include 'migrations/migration_022.sql'
-- Update case_view_localized
-- data cleanup for if_voting, insights_outcomes, implementers_of_change
\include 'migrations/migration_023.sql'
-- drop functions get_methods and get_organizations
-- define methods get_case_by_id() and friends
\include 'migrations/migration_024.sql'
-- define function get_case_edit_localized_values
-- update case_edit_localized
-- \include 'migrations/migration_025.sql'
-- create tables legal_case_field_keys, localized_short_values, localized_case_field_values
-- \include 'migrations/migration_026.sql'
-- create a ton of methods around localization
-- \include 'migrations/migration_027.sql'
-- update localization tables
-- \include 'migrations/migration_028.sql'
-- create table localized_labels
-- define function get_edit_labels
-- \include 'migrations/migration_029.sql'
-- type user_name
-- define function get_user_name
\include 'migrations/migration_030.sql'
-- define functions urls_to_links and urls_to_files
-- convert evaluation_report + evaluation_links
\include 'migrations/migration_031.sql'
-- define get_case_edit_localized_list
-- \include 'migrations/migration_032.sql'
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
