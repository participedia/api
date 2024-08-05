DELETE FROM authors WHERE thingid = ${thingid};
DELETE FROM localized_texts WHERE thingid = ${thingid};
DELETE FROM organizations WHERE id = ${thingid};
