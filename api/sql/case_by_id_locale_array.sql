/*
  define function here, within a string
  note the underscore prefix, a good convention for user-defined temporary objects
  */
  -- set @sql = '
    create or replace function _get_all_thing_locale (thing_id int, language_arr text[])
    returns table(ody, title, description, language, timestamp, thingid) as
    begin
      return 
        SELECT body, title, description, language, "timestamp", thingid FROM (
          SELECT body, title, description, language, "timestamp", thingid,
          ROW_NUMBER() OVER (PARTITION BY thingid ORDER BY "timestamp" DESC) rn
          FROM localized_texts
          WHERE thingid = $1 AND language IN $2
        ) tmp WHERE rn = 1
    end
  -- '

  /*
  create the function by executing the string, with a conditional object drop upfront
  */
  -- if object_id('dbo._get_all_thing_locale') is not null drop function _get_all_thing_locale
  -- exec (@sql)

  /*
  use the function in a query
  */

  -- select object_id, dbo._object_name_twopart(object_id) 
  -- from sys.objects
  -- where type = 'U'


  SELECT row_to_json(results.*) as results from (
    SELECT
      id,
      type,
      title,
      published,
      COALESCE(general_issues, '{}') as general_issues,
      COALESCE(specific_topics, '{}') as specific_topics,
      COALESCE(description, '') as description,
      body,
      location_name,
      address1,
      address2,
      city,
      province,
      postal_code,
      country,
      latitude,
      longitude,
      scope_of_influence,
      get_components(id, ${lang}) as has_components,
      get_object_title(is_component_of, ${lang}) as is_component_of,
      files,
      links,
      photos,
      videos,
      audio,
      start_date,
      end_date,
      ongoing,
      time_limited,
      COALESCE(purposes, '{}') as purposes,
      COALESCE(approaches, '{}') as approaches,
      public_spectrum,
      number_of_participants,
      open_limited,
      recruitment_method,
      COALESCE(targeted_participants, '{}') as targeted_participants,
      COALESCE(method_types, '{}') as method_types,
      COALESCE(tools_techniques_types, '{}') as tools_techniques_types,
      COALESCE(get_object_title_list(specific_methods_tools_techniques, ${lang}, cases.original_language), '{}') as specific_methods_tools_techniques,
      legality,
      facilitators,
      facilitator_training,
      facetoface_online_or_both,
      COALESCE(participants_interactions, '{}') as participants_interactions,
      COALESCE(learning_resources, '{}') as learning_resources,
      COALESCE(decision_methods, '{}') as decision_methods,
      COALESCE(if_voting, '{}') as if_voting,
      COALESCE(insights_outcomes, '{}') as insights_outcomes,
      get_object_title(primary_organizer, ${lang}) as primary_organizer,
      COALESCE(organizer_types, '{}') as organizer_types,
      funder,
      COALESCE(funder_types, '{}') as funder_types,
      staff,
      volunteers,
      impact_evidence,
      COALESCE(change_types, '{}') as change_types,
      COALESCE(implementers_of_change, '{}') as implementers_of_change,
      formal_evaluation,
      evaluation_reports,
      evaluation_links,
      representation_change_who,
      representation_change_what,
      represented_shaped,
      anonymous_identified,
      COALESCE(represented_characteristics, '{}') as represented_characteristics,
      COALESCE(represented_group, '{}') as represented_group,
      ai_ml,
      COALESCE(argument_tools, '{}') as argument_tools,
      facilitator_automation,
      facetoface_and_online_integration,
      COALESCE(gamification, '{}') as gamification,
      synchronous_asynchronous,
      text_video,
      visualization,
      virtual_reality,
      COALESCE(representation_claims, '{}') as representation_claims,
      COALESCE(feedback_methods, '{}') as feedback_methods,
      behind_claim,
      most_affected,
      implementers_connected,
      represented_evaluation,
      bookmarked('case', ${articleid}, ${userid}),
      first_author(${articleid}) AS creator,
      last_author(${articleid}) AS last_updated_by,
      original_language,
      post_date,
      published,
      updated_date,
      featured,
      verified,
      reviewed_at,
      reviewed_by,
      get_user_names(${userid}) as authors,
      get_edit_authors(${articleid}) as edit_history,
      hidden,
      completeness,
      COALESCE(get_object_title_list(collections, ${lang}, cases.original_language), '{}') as collections,
      friendly_id
    FROM
      cases,
      get_localized_texts_fallback(${articleid}, ${lang}, cases.original_language) as localized_texts
    WHERE
      cases.id = ${articleid}

  ) AS results ;

  /*
  clean up
  */
  drop function _get_all_thing_locale

end
go
