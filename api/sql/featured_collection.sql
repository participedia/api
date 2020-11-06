SELECT
	id,
	type,
	texts.title,
  texts.description,
	to_json(COALESCE(photos, '{}')) AS photos
FROM
	collections,
	get_localized_texts_fallback(collections.id, ${language}, collections.original_language) AS texts
WHERE featured = true ORDER BY post_date DESC LIMIT 3;