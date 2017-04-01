-- INDICES

-- These are used to do array membership of tags
CREATE INDEX "cases_tags" ON "public"."cases" USING GIN ("tags");
CREATE INDEX "methods_tags" ON "public"."methods" USING GIN ("tags");
CREATE INDEX "organizations_tags" ON "public"."organizations" USING GIN ("tags");
