SELECT
    organizations.id,
    'organization' as type,
    organizations.original_language,
    organizations.executive_director,
    organizations.issue,
    organizations.post_date,
    organizations.published,
    organizations.sector,
    organizations.updated_date,
    to_json(
    	COALESCE(
    		organizations.location,
    		CAST(
    			ROW('', '', '', '', '', '', '', '', '')
    			as geolocation
    		)
    	)
    ) AS location,
    to_json(organizations.lead_image) AS lead_image,
    to_json(COALESCE(organizations.other_images, '{}')) AS other_images,
    to_json(COALESCE(organizations.files, '{}')) AS files,
    to_json(COALESCE(organizations.videos, '{}')) AS videos,
    to_json(COALESCE(organizations.tags, '{}')) AS tags,
    localized_texts.body,
    localized_texts.title,
    to_json(author_list.authors) AS authors,
    to_json(get_related_nouns('case', 'organization', ${thingid}, ${lang} )) related_cases,
    to_json(get_related_nouns('method', 'organization', ${thingid}, ${lang} )) related_methods,
    to_json(get_related_nouns('organization', 'organization', ${thingid}, ${lang} )) related_organizations,
    bookmarked('case', ${thingid}, ${userId})
FROM
    organizations,
    localized_texts,
    (
        SELECT
            array_agg(CAST(ROW(
                authors.user_id,
                authors.timestamp,
                users.name
            ) AS author )) authors,
            authors.thingid
        FROM
            authors,
            users
        WHERE
            authors.user_id = users.id
        GROUP BY
            authors.thingid
    ) AS author_list
WHERE
    organizations.id = localized_texts.thingid AND
    localized_texts.language = ${lang} AND
    author_list.thingid = organizations.id AND
    organizations.id = ${thingid}
;
