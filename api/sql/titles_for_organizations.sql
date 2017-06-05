SELECT title, thingid
FROM localized_texts, organizations
WHERE language = ${language} AND organizations.id = localized_texts.thingid
ORDER BY thingid ASC
LIMIT ${limit}
OFFSET ${offset}
;
