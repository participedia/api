# Mapping to new Method model

The following are changes needed to use the new Method model. Where I use the word 'key' it means text from a limited, defined set of phrases used for localization. Where square brackets '[]' appear after a value type it means a list rather than a single value. The special value type `full_link` is a datatype that contains a `url`, `title`, and `attribution`. The special type `full_file` is just like a `full_link` but also contains a `source_url`.

All new method changes based on the [Method Fields Spec](https://docs.google.com/spreadsheets/d/1z5lxbSVANhAL0QEfcz2jv6qctu7I0bdbNQrwulvVCG8/edit#gid=671339507)

## Unchanged properties:

id, type, title, description, body, original_language, post_date, published, updated_date, featured, hidden, recruitment_method

## Removed properties

tags, completeness, communication_modes, public_interaction_methods, issue_technical_complexity, issue_interdependency, communication_outcomes, location_name, address1, address2, city, province, postal_code, country, latitude, longitude

## New properties and their types

audio full_link[]
facetoface_online_or_both key
method_types key[]
public_spectrum key
open_limited key
number_of_participants key[]
participants_interactions key[]

## Properties that require changes

### decision_method

current: `decision_method key`
new: `decision_methods key[]`

Keys currently used for decision_method:

general_agreement/consensus
idea_generation
not_applicable
opinion_survey
voting

Action: Will be renamed to decision_methods and values will be kept the same, but values will be mapped from single keys to lists of keys.

### issue_polarization

Current: `issue_polarization key`
New: `level_polarization key`

Keys currently used for issue_polarization:

1_not_polarized
1 - Not Polarized
2_not_very_polarized
2 - Not Very Polarized
3_somewhat_polarized
3 - Somewhat Polarized
4_polarized
4 - Polarized
5 - Very Polarized

Action: Will renamed level_polarization and values will be mapped to

not_polarized
low_polarization
moderate_polarization
polarized
high_polarization

### if_voting

Current: `if_voting: key`
New: `if_voting key[]`

The `if_voting` property is currently unused on .xyz so no data cleanup or mapping needs to be done.

Action: change value from key to key[]

### geographical_scope

Current: `geographical_scope key`
New: `scope_of_influence key[]`

Action: Rename from `geographical_scope` to `scope_of_influence`, change from key to list of keys, and clean up data.

Keys currently used in `geographical_scope`:

international
International
local_eg_neighbourhood_city_town_metropolitan_area
Local (e.g. Neighbourhood, City/Town, Metropolitan Area)
national
National
regional_eg_state_province_autonomous_region
Regional (e.g. State, Province, Autonomous Region)

Will be mapped to:

ARRAY[international]
ARRAY[local]
ARRAY[national]
ARRAY[regional]

### facilitated

Currently: `facilitated boolean`
New: `facilitator yes|no`

facilitated is currently a boolean

Action: rename to facilitators
Question: remain boolean or map to yesno?

### files, images

Currently: `files text[]`
New: `files full_file[]`
Currently: 'images text[]`New:`photos full_file[]`

Action: Renamed images to photos, map values to full_file[]

### links, videos

Currently: `links text[]`
New: `links full_link[]`
Currently `videos text[]`
New: `videos full_link[]`

Action: Map values to full_link[] (url, attribution, title)
