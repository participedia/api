---
--- Create index for things
---

CREATE INDEX idx_things_id_type
ON things (id,type)

---
--- Create index for localized_texts
---

CREATE INDEX idx_localized_text_language_things
ON localized_texts (language,thingid)