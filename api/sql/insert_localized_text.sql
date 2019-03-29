INSERT INTO localized_texts (
  body,
  title,
  description,
  language,
  "timestamp",
  thingid
) VALUES (
  ${body:raw},
  ${title:raw},
  ${description:raw},
  ${language},
  'now',
  ${id}
);
