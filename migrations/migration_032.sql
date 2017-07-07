-- Create different representation of "things" to return

CREATE TYPE object_title AS (
	id INTEGER,
	title TEXT
);

CREATE TYPE object_short AS (
  id INTEGER,
  title TEXT,
  type TEXT,
  images TEXT[],
  post_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ
);

CREATE TYPE object_medium AS (
  id INTEGER,
  title TEXT,
  type TEXT,
  images TEXT[],
  post_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  body TEXT,
  bookmarked BOOLEAN,
  location geolocation
);

ALTER TABLE things ADD COLUMN images TEXT[] DEFAULT '{}';

WITH imageurls AS
  (
    select id, array_agg((images).url) images from (
    	select id, lead_image images from things
    		where (lead_image).url is not null and
    		      (lead_image).url != ''
    	union all
    	select id, unnest(other_images) images  from things where other_images is not null
    ) as unwrapped_images
    group by id
  )
UPDATE things
  SET images = imageurls.images
  FROM imageurls
  WHERE imageurls.id = things.id
;

ALTER TABLE things DROP COLUMN lead_image,
                   DROP COLUMN other_images;

DROP TYPE object_reference;
