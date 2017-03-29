select setval('cases_id_seq', (select max(id) from cases)+1);
select setval('methods_id_seq', (select max(id) from methods)+1);
select setval('organizations_id_seq', (select max(id) from organizations)+1);
