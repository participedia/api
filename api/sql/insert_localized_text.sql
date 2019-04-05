INSERT INTO localized_texts (
  body,
  title,
  description,
  language,
  "timestamp",
  thingid
) VALUES (
  ${body},
  ${title},
  ${description},
  ${language},
  'now',
  ${id}
);
