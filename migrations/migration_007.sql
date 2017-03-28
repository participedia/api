select setval('cases_id_seq', (select max(id) from cases));
select setval('methods_id_seq', (select max(id) from methods));
select setval('organizations_id_seq', (select max(id) from organizations));
