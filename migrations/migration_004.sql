/* Move attachments from object specific tables to columns in object tables. Revert to
   document-style organization: lead_image, other_images, files as separate columns. */

CREATE TYPE attachment AS (
    url TEXT,
    title TEXT,
    size INTEGER
);

ALTER TABLE cases
    ADD COLUMN lead_image attachment,
    ADD COLUMN other_images attachment[],
    ADD COLUMN files attachment[];

UPDATE cases
    SET lead_image = (a.url, a.title, a.size)
    FROM case__attachments a
    WHERE a.case_id = cases.id AND a.type = 'image' AND a.is_lead = TRUE;

UPDATE cases
    SET other_images = attaches.imgs
    FROM (
        SELECT array_agg(CAST(ROW(a.url, a.title, a.size) AS attachment)) imgs, a.case_id
        FROM case__attachments a
        WHERE a.type = 'image' AND a.is_lead = FALSE
        GROUP BY a.case_id
    ) AS attaches
    WHERE attaches.case_id = cases.id;

UPDATE cases
    SET files = attaches.files
    FROM (
        SELECT array_agg(CAST(ROW(a.url, a.title, a.size) AS attachment)) files, a.case_id
        from case__attachments a
        WHERE a.type = 'file'
        GROUP BY a.case_id
    ) AS attaches
    WHERE attaches.case_id = cases.id;

DROP TABLE case__attachments;

ALTER TABLE methods
    ADD COLUMN lead_image attachment,
    ADD COLUMN other_images attachment[],
    ADD COLUMN files attachment[];

UPDATE methods
    SET lead_image = (a.url, a.title, a.size)
    FROM method__attachments a
    WHERE a.method_id = methods.id AND a.type = 'image' AND a.is_lead = TRUE;

UPDATE methods
    SET other_images = attaches.imgs
    FROM (
        SELECT array_agg(CAST(ROW(a.url, a.title, a.size) AS attachment)) imgs, a.method_id
        FROM method__attachments a
        WHERE a.type = 'image' AND a.is_lead = FALSE
        GROUP BY a.method_id
    ) AS attaches
    WHERE attaches.method_id = methods.id;

UPDATE methods
    SET files = attaches.files
    FROM (
        SELECT array_agg(CAST(ROW(a.url, a.title, a.size) AS attachment)) files, a.method_id
        from method__attachments a
        WHERE a.type = 'file'
        GROUP BY a.method_id
    ) AS attaches
    WHERE attaches.method_id = methods.id;

DROP TABLE method__attachments;

ALTER TABLE organizations
    ADD COLUMN lead_image attachment,
    ADD COLUMN other_images attachment[],
    ADD COLUMN files attachment[];

UPDATE organizations
    SET lead_image = (a.url, a.title, a.size)
    FROM organization__attachments a
    WHERE a.organization_id = organizations.id AND a.type = 'image' AND a.is_lead = TRUE;

UPDATE organizations
    SET other_images = attaches.imgs
    FROM (
        SELECT array_agg(CAST(ROW(a.url, a.title, a.size) AS attachment)) imgs, a.organization_id
        FROM organization__attachments a
        WHERE a.type = 'image' AND a.is_lead = FALSE
        GROUP BY a.organization_id
    ) AS attaches
    WHERE attaches.organization_id = organizations.id;

UPDATE organizations
    SET files = attaches.files
    FROM (
        SELECT array_agg(CAST(ROW(a.url, a.title, a.size) AS attachment)) files, a.organization_id
        from organization__attachments a
        WHERE a.type = 'file'
        GROUP BY a.organization_id
    ) AS attaches
    WHERE attaches.organization_id = organizations.id;

DROP TABLE organization__attachments;
