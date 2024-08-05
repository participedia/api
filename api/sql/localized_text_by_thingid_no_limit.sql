select * from localized_texts  
where 
  thingid = ${thingid}
  ORDER By language
;