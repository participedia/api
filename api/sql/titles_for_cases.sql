SELECT title, thingid
FROM localized_texts, cases
WHERE language = ${language} AND
      cases.id = localized_texts.thingid
ORDER BY thingid ASC
LIMIT ${limit}
OFFSET ${offset}
;
