DELETE FROM authors WHERE thingid = ${id};
DELETE FROM localized_texts WHERE thingid = ${id};
DELETE FROM collections WHERE id = ${id};