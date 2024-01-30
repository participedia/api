select * from localized_texts  
where 
  language = ${language} AND
  thingid = ${thingid} AND
  title <> '' AND
  timestamp > ${timestamp}
;