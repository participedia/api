WITH insert_method as (
  INSERT into methods (
    original_language, best_for, communication_mode,
    decision_method, facilitated, governance_contribution, issue_interdependency, issue_polarization,
    issue_technical_complexity, kind_of_influence, method_of_interaction,
    public_interaction_method, post_date,
    published, typical_funding_source, typical_implementing_entity,
    typical_sponsoring_entity, updated_date,
    lead_image, other_images,
    files, videos, tags, featured
  )
  VALUES
    (
      ${language}, null, null, null, null, null, null,
      null, null, null, null, null, 'now', true,
      null, null, null, 'now',
      CAST(ROW('${lead_image_url}', '', 0) as attachment),
      '{}', '{}', '{}', '{}', false
    ) RETURNING id as method_id
),
insert_author as (
  INSERT into method__authors(user_id, timestamp, method_id)
  VALUES
    (${user_id}, 'now', (select method_id from insert_method))
)

INSERT INTO method__localized_texts(body, title, language, method_id)
VALUES
  (
    ${body},
    ${title},
    ${language},
    (select method_id from insert_method)
  ) RETURNING method_id
;
