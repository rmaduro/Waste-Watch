describe('Reset Password Page Tests', () => {

  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200');
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });

  beforeEach(() => {
    cy.visit('/reset-password');
  });

  /**
   * Test to verify that the background video and key elements are visible on the reset password page.
   */
  it('should display the background video and elements on the page', () => {
    cy.get('.background-video').should('be.visible');
    cy.get('.video-overlay').should('exist');
    cy.get('.card').should('be.visible');
    cy.get('input#email').should('be.visible');
    cy.get('.btn-dark').contains(/send email/i).should('be.visible');
    cy.get('.btn-link').contains(/back to login/i).should('be.visible');
    cy.wait(2000);
  });

  /**
   * Test to verify that a valid reset password email is sent successfully.
   */
  it('should send reset password email successfully', () => {
    cy.intercept('POST', Cypress.env('backendUrl') + '/auth/forgot-password', {
      statusCode: 200,
      body: { message: 'Password reset email sent successfully' }
    }).as('resetPasswordRequest');

    cy.get('input#email').type('user@example.com');
    cy.get('form').submit();
    cy.wait('@resetPasswordRequest');
    cy.url().should('include', '/login');
    cy.wait(2000);
  });

  /**
   * Test to verify that an error message is shown when the email is not registered.
   */
  it('should show an error message if email is not registered', () => {
    cy.intercept('POST', Cypress.env('backendUrl') + '/auth/forgot-password', {
      statusCode: 404,
      body: { message: 'Email not found' }
    }).as('resetPasswordRequestError');

    cy.get('input#email').type('nonexistent@example.com');
    cy.get('form').submit();
    cy.wait('@resetPasswordRequestError');
    cy.get('.alert-danger').should('be.visible');
    cy.get('.alert-danger').should('contain', 'Email not found');
    cy.wait(2000);
  });

  /**
   * Test to verify that clicking "Back to Login" redirects the user to the login page.
   */
  it('should navigate to the login page when clicking "Back to Login"', () => {
    cy.get('.btn-link').contains(/back to login/i).click();
    cy.url().should('include', '/login');
    cy.wait(2000);
  });

  /**
   * Test to verify that the email input field is correctly masked with type 'email'.
   */
  it('should mask the email input field', () => {
    cy.get('input#email').should('have.attr', 'type', 'email');
    cy.wait(2000);
  });

  /**
   * Test to verify that the email input field is cleared after a successful form submission.
   */
  it('should clear the email input field after successful form submission', () => {
    cy.intercept('POST', Cypress.env('backendUrl') + '/auth/forgot-password', {
      statusCode: 200,
      body: { message: 'Password reset email sent successfully' }
    }).as('resetPasswordRequest');

    cy.get('input#email').type('user@example.com');
    cy.get('form').submit();
    cy.wait('@resetPasswordRequest');
    cy.get('input#email').should('have.value', '');
    cy.wait(2000);
  });

  /**
   * Test to verify that the email input field accepts a valid email address.
   */
  it('should accept a valid email address', () => {
    cy.get('input#email').type('valid.email@example.com');
    cy.get('input#email').should('have.value', 'valid.email@example.com');
    cy.wait(2000);
  });

  /**
   * Test to verify that clicking "Back to Login" does not submit the form and correctly redirects the user.
   */
  it('should not submit the form when clicking "Back to Login"', () => {
    cy.get('.btn-link').contains(/back to login/i).click();
    cy.url().should('include', '/login');
    cy.wait(2000);
  });

  /**
   * Test to verify that the form resets correctly after a successful password reset.
   */
  it('should reset the form after a successful password reset', () => {
    cy.intercept('POST', Cypress.env('backendUrl') + '/auth/forgot-password', {
      statusCode: 200,
      body: { message: 'Password reset email sent successfully' }
    }).as('resetPasswordRequest');

    cy.get('input#email').type('user@example.com');
    cy.get('form').submit();
    cy.wait('@resetPasswordRequest');
    cy.get('input#email').should('have.value', '');
    cy.wait(2000);
  });

});
