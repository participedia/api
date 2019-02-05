describe("user controller", () => {
  it(`visits /user/1 `, () => {
    cy.visit(`/user/1`);
  });

  it(`visits /user/1/edit `, () => {
    cy.visit(`/user/1/edit`);

    // it has a submit button
    cy.get("[data-cy=submit]").should("be.visible");

    // it edits the name field
    const newName = "Jane Smith";
    cy.get('input[name="name"]').clear().type(newName);

    // it submits the form
    cy.get("[data-cy=submit]").click();
    cy.url().should("include", "/user/1/edit");

    // the name field is updated with new name
    cy.get('input[name="name"]').should("have.value", newName);
  });
});
