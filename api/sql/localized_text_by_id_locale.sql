select * from localized_texts  
where 
  language = ${language} AND
  thingid = ${thingid}
  LIMIT 1;