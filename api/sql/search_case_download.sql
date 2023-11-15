-- Parameters
-- query
-- language (defaults to 'en'
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
WITH all_selections AS (SELECT
  id,
  title,
  description,
  substring(body for 500) AS body,
  ts_rank_cd(search_index_${language:raw}.document, to_tsquery(${langQuery}, ${query})) as rank
FROM search_index_${language:raw}
WHERE
  document @@ to_tsquery(${langQuery}, ${query})
ORDER BY rank DESC
),
total_selections AS (
  SELECT count(all_selections.id) AS total
  FROM all_selections, cases
  WHERE all_selections.id = cases.id AND cases.published = true AND cases.hidden = false ${facets:raw}
)

SELECT
  cases.id,
  cases.type,
  CASE 
		WHEN cases.type='case' THEN get_completeness_case(cases.id)
		WHEN cases.type='method' THEN get_completeness_methods(cases.id)
		WHEN cases.type='organization' THEN get_completeness_organizations(cases.id)
		ELSE ''
     END as completeness,
  cases.published,
  cases.featured,
  cases.verified,
  cases.location_name,
  cases.address1,
  cases.address2,
  cases.city,
  cases.province,
  cases.postal_code,
  cases.country,
  cases.latitude,
  cases.longitude,
  cases.original_language,
  cases.formal_evaluation,
  cases.evaluation_reports,
  cases.evaluation_links,
  cases.funder,
  cases.staff,
  cases.volunteers,
  cases.impact_evidence,
  cases.legality,
  cases.facilitators,
  cases.facilitator_training,
  cases.facetoface_online_or_both,
  cases.files,
  cases.links,
  cases.photos,
  cases.videos,
  cases.audio,
  cases.start_date,
  cases.end_date,
  cases.ongoing,
  cases.time_limited,
  cases.public_spectrum,
  cases.number_of_participants,
  cases.open_limited,
  cases.recruitment_method,
  texts.title,
  texts.description,
  texts.body,
  -- to_json(get_location(cases.id)) AS location,
  to_json(COALESCE(cases.photos, '{}')) AS photos,
  to_json(COALESCE(cases.videos, '{}')) AS videos,
  cases.updated_date,
  cases.post_date,
  bookmarked(cases.type, cases.id, ${userId}),
  total_selections.total,
--   get_components(cases.id, ${language}) as has_components,
  get_object_title(is_component_of, ${language}) as is_component_of,
  -- first_author(cases.id) AS creator,
  -- last_author(cases.id) AS last_updated_by,
  COALESCE(participants_interactions, '{}') as participants_interactions,
  COALESCE(learning_resources, '{}') as learning_resources,
  COALESCE(decision_methods, '{}') as decision_methods,
  COALESCE(if_voting, '{}') as if_voting,
  COALESCE(insights_outcomes, '{}') as insights_outcomes,
  COALESCE(targeted_participants, '{}') as targeted_participants,
  COALESCE(method_types, '{}') as method_types,
  COALESCE(tools_techniques_types, '{}') as tools_techniques_types,
  COALESCE(purposes, '{}') as purposes,
  COALESCE(approaches, '{}') as approaches,
  get_object_title(primary_organizer, ${language}) as primary_organizer,
  COALESCE(organizer_types, '{}') as organizer_types,
  COALESCE(change_types, '{}') as change_types,
  COALESCE(implementers_of_change, '{}') as implementers_of_change,
  get_user_names(${userId}) as authors,
  get_edit_authors(cases.id) as edit_history,
  all_selections.rank
FROM
  all_selections,
  total_selections,
  cases,
  get_localized_texts_fallback(cases.id, ${language}, cases.original_language) AS texts
WHERE
  all_selections.id = cases.id AND
  cases.published = true AND
  cases.hidden = false
  ${facets:raw}
ORDER BY all_selections.rank DESC
OFFSET ${offset}
LIMIT ${limit}
;
