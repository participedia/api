# Mapping to new Organizations model

The following are changes needed to use the new Organization model. Where I use the word 'key' it means text from a limited, defined set of phrases used for localization. Where square brackets '[]' appear after a value type it means a list rather than a single value. The special value type `full_link` is a datatype that contains a `url`, `title`, and `attribution`. The special type `full_file` is just like a `full_link` but also contains a `source_url`. The special value `id` is the id of another article, in this case a Method (and/or tools, techniques).

All new method changes based on the [Organization Fields Spec](https://docs.google.com/spreadsheets/d/15D5WDW5Ma5KvxxYFSrrlG98cnUAaKIL2nOxE9--4s6Q/edit#gid=678179084)

## Unchanged properties:

id, type, title, description, body, original_language, post_date, published, updated_date, featured, hidden, location_name, address, address2, city, province, postal_code, country

## Removed properties

tags, executive_director

## New properties and their types

audio full_link[]
scope_of_influence key[]
specific_topics key[]
type_method key[]
type_tool key[]
specific_methods_tools_techniques id[]

## Properties that require changes

### latitude, longitude

Map these values from text to floating point. This migration already exists.

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

## issues

Currently: `issues text` (this is a bug)
New: `general_issues key[]`

Keys currently used for issues (actually more, due to string concatenation, but just these in various combinations):

Aging
Arts & Culture
Budgeting
Children & Youth
Community Development
Economic Development
Education & Schools
Environment
Gender & Racial Equality
Health
Higher Education & Lifelong Learning
Human Rights
Identity & Diversity
Immigration
International Aid & Development
International Trade & Global Economy
Law Enforcement, Criminal Justice, & Corrections
National & International Security
Other
Planning (e.g. Urban planning, Transportation, etc.)
Political Institutions (e.g. Constitutions, Legal Systems, Electoral Systems)
Poverty Reduction
Science & Technology

These will be mapped to the following legal keys:

agriculture (English: Agriculture, Forestry, Fishing & Mining Industries)
arts (English: Arts, Culture, & Recreation)
business
economics
education
energy
environment
governance (English: Governance & Political Institutions (e.g. constitutions, legal systems, electoral systems))
health
housing
human (English: Human Rights & Civil Rights)
identity
immigration
international (English: International Affairs)
labor (English: Labor & Work)
law (English: Law Enforcement, Criminal Justice & Corrections)
media (English: Media, Telecommunications & Information)
national (
planning
science
social
transportation

Full mapping:

Aging -> social
Arts & Culture -> arts
Budgeting -> economics
Children & Youth -> DELETE
Community Development -> DELETE
Economic Development -> economics
Education & Schools -> education
Environment -> environment
Gender & Racial Equality -> DELETE
Health -> health
Higher Education & Lifelong Learning -> education
Human Rights -> human
Identity & Diversity -> identity
Immigration -> immigration
International Aid & Development -> international
International Trade & Global Economy -> international
Law Enforcement, Criminal Justice, & Corrections -> law
National & International Security -> national
Other -> DELETE
Planning (e.g. Urban planning, Transportation, etc.) -> planning
Political Institutions (e.g. Constitutions, Legal Systems, Electoral Systems) -> governance
Poverty Reduction -> social
Science & Technology -> science
