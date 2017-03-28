WITH insert_user as (
  INSERT into users (
    original_language, issue, communication_mode,
    communication_with_audience, content_country,
    decision_method, end_date, facetoface_online_or_both,
    facilitated, voting, number_of_meeting_days,
    ongoing, post_date, published, start_date,
    total_number_of_participants, updated_date,
    targeted_participant_demographic,
    kind_of_influence, targeted_participants_public_role,
    targeted_audience, participant_selection,
    specific_topic, staff_type, type_of_funding_entity,
    typical_implementing_entity, typical_sponsoring_entity,
    who_else_supported_the_initiative,
    who_was_primarily_responsible_for_organizing_the_initiative,
    location, lead_image, other_images,
    files, videos, tags
  )
  VALUES
    (
      ${language}, null, null, null, null, null, null,
      null, null, 'none', null, false, 'now',
      true, 'now', null, 'now', 'General Public',
      null, 'Lay Public', 'General Public',
      'Open to all', null, null, null, null,
      null, null, null, null, CAST(ROW('${lead_image_url}', '', 0) as attachment),
      '{}', '{}', '{}', '{}'
    ) RETURNING id as user_id
),
insert_author as (
  INSERT into user__authors(user_id, timestamp, user_id)
  VALUES
    (${user_id}, 'now', (select user_id from insert_user))
)

INSERT INTO user__localized_texts(body, title, language, user_id)
VALUES
  (
    ${body},
    ${title},
    ${language},
    (select user_id from insert_user)
  )
;
