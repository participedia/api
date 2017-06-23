ALTER TABLE things ADD COLUMN neuvideos TEXT[] DEFAULT '{}';

WITH vidurls AS
  (
    SELECT id, array_agg((video).url) videos FROM (
        SELECT id, unnest(videos) video  FROM things WHERE videos IS NOT NULL
    ) AS unwrappedvids
    GROUP BY id
  )
UPDATE things
  SET neuvideos = vidurls.videos
  FROM vidurls
  WHERE vidurls.id = things.id
;

ALTER TABLE things DROP COLUMN videos;
ALTER TABLE things RENAME COLUMN neuvideos TO videos;


DROP TYPE video;
