describe('Register User Page Tests', () => {

  /**
   * Sets up the global configuration for the tests.
   * - Configures the frontend base URL for Cypress.
   * - Configures the backend API base URL as an environment variable.
   */
  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200'); // Set the frontend URL
    Cypress.env('backendUrl', 'https://localhost:7259/api'); // Set the backend URL
  });

  /**
   * Before each test, simulates a logged-in admin user:
   * - Stores authentication information in localStorage.
   * - Logs in as an admin user via the login page.
   * - Redirects to the user registration page after login.
   */
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('auth', JSON.stringify({
        user: { email: 'admin@wastewatch.com', roles: ['admin'] },
        token: 'some-fake-jwt-token'
      }));
    });

    // Visit the login page and log in as an admin
    cy.visit('/login');

    // Fill in login credentials
    cy.get('input#email').type('admin@wastewatch.com');
    cy.get('input#password').type('Admin@123');
    cy.get('form').submit();

    // Verify redirection to the registration page
    cy.url().should('include', '/register-user');
  });

  /**
   * Test to verify that all registration form elements are displayed correctly.
   */
  it('should display the registration form and elements', () => {
    cy.get('.background-video').should('be.visible'); // Background video is present
    cy.get('.video-overlay').should('exist'); // Dark overlay is applied

    cy.get('.card').should('be.visible'); // Registration card is visible
    cy.get('input#email').should('be.visible'); // Email input field is visible
    cy.get('input#password').should('be.visible'); // Password input field is visible
    cy.get('input#confirmPassword').should('be.visible'); // Confirm password field is visible
    cy.get('select#role').should('be.visible'); // Role selection dropdown is visible
    cy.get('.btn-dark').contains(/register/i).should('be.visible'); // Register button is visible
    cy.get('.btn-link').contains(/logout and return to login/i).should('be.visible'); // Logout button is visible
    cy.wait(2000); // Wait to ensure UI updates
  });

  /**
   * Test to verify the registration of a Bin Manager, followed by logging out the admin user.
   */
  it('should register Bin Manager, log out as admin', () => {
    // Mock a successful registration response from the backend
    cy.intercept('POST', Cypress.env('backendUrl') + '/auth/register', {
      statusCode: 201,
      body: { message: 'User registered successfully' }
    }).as('registerRequest');

    // Fill out the registration form for a Bin Manager
    cy.get('input#email').type('binmanager@example.com');
    cy.get('input#password').type('BinManager@123');
    cy.get('input#confirmPassword').type('BinManager@123');
    cy.get('select#role').select('Bin Manager');

    // Submit the form
    cy.get('form').submit();

    // Wait before logging out
    cy.wait(1000);

    // Log out the admin user
    cy.get('.btn-link').contains(/logout and return to login/i).click();

    // Ensure redirection to the login page
    cy.url().should('include', '/login');
    cy.wait(2000);
  });

  /**
   * Test to ensure an error message is displayed when passwords do not match.
   */
  it('should show an error message if passwords do not match', () => {
    // Fill in registration form with mismatched passwords
    cy.get('input#email').type('user@example.com');
    cy.get('input#password').type('Password123!');
    cy.get('input#confirmPassword').type('Password456!');
    cy.get('select#role').select('Bin Manager');

    // Submit the form
    cy.get('form').submit();

    // Verify error message
    cy.get('.alert-danger').should('contain', 'Passwords do not match');
    cy.wait(2000);
  });

  /**
   * Test to verify that clicking "Logout and return to login" redirects to the login page.
   */
  it('should log out and return to login page when clicking "Logout and return to login"', () => {
    // Click the logout button
    cy.get('.btn-link').contains(/logout and return to login/i).click();

    // Ensure redirection to the login page
    cy.url().should('include', '/login');
    cy.wait(2000);
  });

  /**
   * Test to verify validation errors when required fields are left empty.
   */
  it('should show validation errors for required fields', () => {
    // Submit the form without filling in any data
    cy.get('form').submit();

    // Ensure validation errors are displayed for each required field
    cy.get('input#email:invalid').should('exist');
    cy.get('input#password:invalid').should('exist');
    cy.get('input#confirmPassword:invalid').should('exist');
    cy.wait(2000);
  });

  /**
   * Test to verify that an error is displayed when passwords do not match.
   */
  it('should show an error if passwords do not match', () => {
    cy.get('input#password').type('ValidPassword123!');
    cy.get('input#confirmPassword').type('DifferentPassword123!');
    cy.get('form').submit();

    // Verify error message
    cy.get('.alert-danger').should('contain', 'Passwords do not match');
    cy.wait(2000);
  });

});
