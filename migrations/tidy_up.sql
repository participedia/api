

--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (id);


--
-- Name: things things_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY things
    ADD CONSTRAINT things_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: authors authors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY authors
    ADD CONSTRAINT authors_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: bookmarks bookmarks_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY bookmarks
    ADD CONSTRAINT bookmarks_userid_fkey FOREIGN KEY (userid) REFERENCES users(id);

REFRESH MATERIALIZED VIEW CONCURRENTLY search_index_en;


--
-- Name: public; Type: ACL; Schema: -; Owner: -
--

GRANT ALL ON SCHEMA public TO PUBLIC;
