describe("Case Edit Form", () => {
  it("visits /case/{id}/edit", () => {
    cy.visit("http://localhost:3001/case/2/edit");
  });

  it("has a submit button", () => {
    cy.visit("http://localhost:3001/case/2/edit");
    cy.get("[data-cy=submit]").should("be.visible");
  });

  it("has a floating publish button", () => {
    cy.visit("http://localhost:3001/case/2/edit");
    cy.get("[data-cy=floating-action-button]").should("be.visible");
  });

  it("has a link to full version", () => {
    cy.visit("http://localhost:3001/case/2/edit");
    const linkEl = cy.get("[data-cy=full-version-link]");
    linkEl.should("be.visible");
    linkEl.click();
    cy.url().should('include', '?full=1')
  });

  it("does not have a link to full version if it's currently full version", () => {
    cy.visit("http://localhost:3001/case/2/edit?full=1");
    const linkEl = cy.get("[data-cy=full-version-link]");
    linkEl.should("not.be.visible");
  });

  it("submits the form without authorization errors", () => {
    cy.visit("http://localhost:3001/case/2/edit?full=1");
    cy.get("[data-cy=submit]").click();
    cy.contains("UnauthorizedError: No authorization token was found").should('not.be.visible');
  });
});
