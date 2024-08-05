DELETE FROM authors WHERE thingid = ${thingid};
DELETE FROM localized_texts WHERE thingid = ${thingid};
DELETE FROM cases WHERE id = ${thingid};
