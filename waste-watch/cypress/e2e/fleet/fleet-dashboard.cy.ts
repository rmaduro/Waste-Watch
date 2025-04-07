describe('Fleet Dashboard Tests', () => {
  // Setup before any tests run
  before(() => {
    // Set baseUrl for the application and backend API URL
    Cypress.config('baseUrl', 'http://localhost:4200');
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });

  // Setup before each individual test runs
  beforeEach(() => {
    // Visit the Fleet Dashboard page before each test
    cy.visit('/fleet-dashboard');
  });


  /**
   * Test Case: Verify that key fleet statistics are displayed correctly.
   * This test ensures that each stat card displays a header and a non-empty value.
   */
  it('should show key fleet statistics', () => {
    // Iterate over each stat card and check that the header and value are present
    cy.get('.stat-card').each(($el) => {
      cy.wrap($el).find('.stat-header').should('exist');
      cy.wrap($el).find('.stat-value').should('not.be.empty');
    });

    // Wait for the page elements to load completely
    cy.wait(2000);
  });

  /**
   * Test Case: Verify that the active alerts section is displayed.
   * This test checks if the "Active Alerts" header is visible and that there is at least one alert card displayed.
   */
  it('should display active alerts section', () => {
    // Check if the section heading contains "Active Alerts"
    cy.get('.alerts-section h3').should('contain', 'Active Alerts');

    // Ensure that there is at least one alert card present in the alerts container
    cy.get('.alerts-container .alert-card').should('have.length.at.least', 1);

    // Wait for the page elements to load completely
    cy.wait(2000);
  });


  /**
   * Test Case: Verify that today's collections are displayed correctly.
   * This test checks that the "Today's Collections" header is visible and that the collection value is not empty.
   */
  it('should display today\'s collections correctly', () => {
    // Ensure the header contains "Today's Collections"
    cy.get('.collections-header h3').should('contain', "Today's Collections");

    // Check that the collections value is not empty
    cy.get('.collections-value').should('not.be.empty');
    cy.wait(2000);

  });

  /**
   * Test Case: Verify that the sidebar navigation is visible.
   * This test ensures that the sidebar navigation component is displayed.
   */
  it('should display the sidebar navigation', () => {
    // Ensure that the sidebar navigation component is visible on the page
    cy.get('app-side-nav').should('be.visible');
    cy.wait(2000);

  });
});
