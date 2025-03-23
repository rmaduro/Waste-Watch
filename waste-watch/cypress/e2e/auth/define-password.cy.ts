describe('Define Password Page Tests', () => {
  /**
   * Sets up global configuration for the tests, including base URLs for the frontend and backend.
   */
  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200'); // Set the frontend URL
    Cypress.env('backendUrl', 'https://localhost:7259/api'); // Set the backend URL
  });

  /**
   * Before each test:
   * - Visit the define password page.
   */
  beforeEach(() => {
    cy.visit('/define-password');
  });

  /**
   * Test to verify that the define password page elements are displayed correctly.
   */
  it('should display the define password form and elements', () => {
    cy.get('.background-video').should('be.visible'); // Check that the background video is visible
    cy.get('.video-overlay').should('exist'); // Verify that the dark overlay is present

    cy.get('.card').should('be.visible'); // Ensure the define password card is visible
    cy.get('input#password').should('be.visible'); // Ensure the password input field exists
    cy.get('input#confirmPassword').should('be.visible'); // Ensure the confirm password input field exists
    cy.get('.btn-dark').contains(/reset password/i).should('be.visible'); // Ensure the "Reset Password" button is visible
    cy.get('.btn-link').contains(/back to login/i).should('be.visible'); // Ensure the "Back to Login" button is visible

    cy.wait(2000); // Wait for 2 seconds after the test
  });

  /**
   * Test to verify that the form does not submit if required fields are empty.
   */
  it('should show validation errors for required fields', () => {
    cy.get('form').submit();

    // Ensure required field validation triggers
    cy.get('input#password:invalid').should('exist');
    cy.get('input#confirmPassword:invalid').should('exist');

    cy.wait(2000); // Wait for 2 seconds after the test
  });

  /**
   * Test to verify that an error message appears when passwords do not match.
   */
  it('should show an error if passwords do not match', () => {
    cy.get('input#password').type('ValidPassword123!');
    cy.get('input#confirmPassword').type('DifferentPassword123!');
    cy.get('form').submit();

    // Verify error message appears
    cy.get('.text-danger').should('contain', 'Passwords do not match');

    cy.wait(2000); // Wait for 2 seconds after the test
  });

  /**
   * Test to verify that clicking "Back to Login" navigates correctly.
   */
  it('should navigate to login when clicking "Back to Login"', () => {
    cy.get('.btn-link').contains(/back to login/i).click();
    cy.url().should('include', '/login');

    cy.wait(2000); // Wait for 2 seconds after the test
  });

  /**
   * Test to verify that the reset password button remains disabled if:
   * - Passwords do not match
   * - Passwords are missing
   */
  it('should disable the "Reset Password" button if passwords do not match or are missing', () => {
    // Initially, the button should be disabled
    cy.get('.btn-dark').contains(/reset password/i).should('be.disabled');

    // Enter only one password field
    cy.get('input#password').type('ValidPassword123!');
    cy.get('.btn-dark').contains(/reset password/i).should('be.disabled');

    // Enter mismatched passwords
    cy.get('input#confirmPassword').type('DifferentPassword123!');
    cy.get('.btn-dark').contains(/reset password/i).should('be.disabled');

    // Enter matching passwords
    cy.get('input#confirmPassword').clear().type('ValidPassword123!');
    cy.get('.btn-dark').contains(/reset password/i).should('not.be.disabled');

    cy.wait(2000); // Wait for 2 seconds after the test
  });
});
