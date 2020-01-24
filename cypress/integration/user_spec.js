describe("user controller", () => {
  it(`visits /user/1`, () => {
    cy.visit(`/user/1`);
  });

  it("is not authenticated and visits /user/1/edit", () => {
    cy.visit("/user/1/edit");
    // it should redirect to participedia.auth0.com/login
    cy.url().should("include", "https://participedia.auth0.com/login");
  });

  // this needs to be in it's own test becuase you can only visit one domain per test
  it("goes to /", () => {
    cy.visit("/");
  });

  it(`authenticates`, () => {
    cy.visit("/login");
    cy.login();
  });

  it("visits their own profile page and edit page", () => {
    cy.get(".js-profile-dropdown-button-trigger").click();
    cy.get(".js-profile-dropdown-button-items")
      .contains("Profile")
      .click();

    // click edit button and goto /user/id/edit
    cy.get(".user-view-edit-profile-button").click();

    // /user/id/edit has a submit button
    cy.get("button[type='submit']").should("be.visible");

    // it edits the name field
    const newName = "Jane Smith";
    cy.get('input[name="name"]')
      .clear()
      .type(newName);

    // it submits the form
    cy.get("button[type='submit']").click();

    // the name field is updated with new name
    cy.get(".user-view-name")
      .should("exist")
      .and("contain", newName);
  });

  it("visits someone else's profile page", () => {
    // if it's not their profile page, they should be
    // redirected to the view and not allowed to edit
    cy.visit("/user/1/edit");
    cy.url().should("include", "/user/1");
  });
});
