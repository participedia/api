UPDATE localized_texts
SET body = ${body}, title = ${title}, description = ${description}
WHERE language = ${language} AND thingid = ${id};