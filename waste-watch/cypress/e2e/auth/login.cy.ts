describe('Login Page Tests', () => {

  /**
   * Sets up global configuration for the tests, including base URLs for the frontend and backend.
   */
  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200'); // Set the frontend URL
    Cypress.env('backendUrl', 'https://localhost:7259/api'); // Set the backend URL
  });

  /**
   * Before each test, simulates a logged-in user by setting authentication information in localStorage.
   */
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('auth', JSON.stringify({
        user: { email: 'admin@wastewatch.com', roles: ['admin'] },
        token: 'some-fake-jwt-token'
      }));
    });

    cy.visit('/login'); // Navigate directly to the login page
  });

  /**
   * Test to verify that the login form and background video are displayed correctly.
   */
  it('should display the login form and background video', () => {
    cy.get('.background-video').should('be.visible'); // Check that the background video is visible
    cy.get('.video-overlay').should('exist'); // Verify that the dark overlay is present

    cy.get('.card').should('be.visible'); // Ensure the login card is visible
    cy.get('input#email').should('be.visible'); // Ensure the email input field exists
    cy.get('input#password').should('be.visible'); // Ensure the password input field exists
    cy.get('.btn-dark').contains(/log in/i).should('be.visible'); // Ensure the login button is visible
    cy.wait(2000);
  });

  /**
   * Test to verify successful login and redirection of an admin user to the user registration page.
   */
  it('should login successfully and redirect admin to user registration', () => {
    cy.intercept('POST', Cypress.env('backendUrl') + '/login', {
      statusCode: 200,
      body: { user: { roles: ['admin'] } },
    }).as('loginRequest');

    cy.get('input#email').type('admin@wastewatch.com'); // Type email
    cy.get('input#password').type('Admin@123'); // Type password
    cy.get('form').submit(); // Submit the login form

    cy.url().should('include', '/register-user'); // Check that the user is redirected to the registration page
    cy.wait(2000);
  });

  /**
   * Test to verify that clicking on the 'forgot password' link redirects to the reset password page.
   */
  it('should navigate to the reset password page', () => {
    cy.get('.btn-link').contains(/forgot your password\?/i).click(); // Click the forgot password link
    cy.wait(500); // Wait for navigation
    cy.url().should('include', '/reset-password'); // Ensure the URL contains '/reset-password'
    cy.wait(2000);
  });

  /**
   * Test to ensure that an already logged-in user is not allowed to access the login page.
   */
  it('should not allow login with an already logged-in user', () => {
    cy.visit('/dashboard'); // Navigate to a protected route
    cy.url().should('not.include', '/login'); // Ensure the user is not redirected back to the login page
    cy.wait(2000);
  });

  /**
   * Test to check that the password input field is properly masked.
   */
  it('should mask the password input field', () => {
    cy.get('input#password').should('have.attr', 'type', 'password'); // Verify the password field has type 'password'
    cy.wait(2000);
  });

  /**
   * Test to verify that the login button is disabled during the loading state.
   */
  it('should disable the login button during loading', () => {
    cy.get('input#email').type('admin@wastewatch.com'); // Type email
    cy.get('input#password').type('Admin@123'); // Type password
    cy.get('.btn-dark').should('not.be.disabled'); // Ensure the login button is initially enabled
    cy.get('form').submit(); // Submit the form
    cy.get('.btn-dark').should('be.disabled'); // Check that the login button is disabled during the loading state
    cy.wait(2000);
  });

  /**
   * Test to verify successful login and redirection of a fleet manager to the fleet dashboard.
   */
  it('should login successfully and redirect fleet manager to dashboard', () => {
    cy.intercept('POST', Cypress.env('backendUrl') + '/login', {
      statusCode: 200,
      body: { user: { roles: ['fleet manager'] } },
    }).as('loginRequest');

    cy.get('input#email').type('wastewatchproject@gmail.com'); // Type fleet manager email
    cy.get('input#password').type('Wastewatch1234!'); // Type password
    cy.get('form').submit(); // Submit the login form

    cy.url().should('include', '/fleet-dashboard'); // Verify that the fleet manager is redirected to the fleet dashboard
    cy.wait(2000);
  });
});
