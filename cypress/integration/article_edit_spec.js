const CYPRESS_TEST_EMAIL = "alanna.scott+cypress_test@gmail.com";
const CYPRESS_TEST_PASSWORD = "cypress";

const articleTypes = ["case", "method", "organization"];
const articleIds = {
  case: 2,
  organization: 200,
  method: 145,
};

articleTypes.forEach(type => editFormTest(type));

function editFormTest(type) {
  describe(`${type} edit form`, () => {
    it(`logout`, () => {
      cy.visit(`/logout`);
    });

    it(`not authenticated and visits /${type}/${articleIds[type]}/edit`, () => {
      cy.visit(`/${type}/${articleIds[type]}/edit`);
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

    it(`authenticated and visits /${type}/${articleIds[type]}/edit`, () => {
      cy.visit(`/${type}/${articleIds[type]}/edit`)

      // it has a submit button
      cy.get("[data-cy='main-form-submit']").should("be.visible");

      //it has a floating publish button
      cy.get(".floating-action-button").should("be.visible");

      // it has a link to full version
      cy.get("[href='?full=1']")
        .should("be.visible")
        .click();
      cy.url().should("include", "?full=1");

      // it does not have a link to full version if it's currently full version
      cy.get("[href='?full=1']").should("not.be.visible");

      // it submits the form without errors
      cy.get("[data-cy='main-form-submit']").click();

      // if form was submitted successfully it will redirect to the view page
      cy.url().should("eq", `http://localhost:3001/${type}/${articleIds[type]}`);
    });
  });
}
