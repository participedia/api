SELECT title, thingid
FROM localized_texts, methods
WHERE language = ${language} AND methods.id = localized_texts.thingid
ORDER BY thingid ASC
LIMIT ${limit}
OFFSET ${offset}
;
