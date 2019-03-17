describe('User', () => {

  beforeEach(() => {
    cy.fixture('users/admin').as('admin')
    cy.exec('npm run seed')
  })

  it('Should edit user', function() {
    cy.login(this.admin.email, this.admin.password)

    cy.visit('/#/user')

    cy.get('.users__list .user__item:first-child .user__action a')
      .click()
    
    cy.get('#input_email')
      .clear()
      .type(this.admin.email + 'm')
    
    cy.get('.btn-primary')
      .click()

    cy.url()
      .should('include', '/user')

    cy.contains('.alert-success', 'User update successful')
  })

  it('Should downgrade user role', function() {
    cy.login(this.admin.email, this.admin.password)

    cy.visit('/#/user')

    cy.get('.user__item:nth-child(2) .user__action a')
      .click()

    cy.url()
      .should('include', 'user/edit')

    cy.get('#input_role')
      .select('User')
    
    cy.get('form .btn-primary')
      .click()
    
    cy.contains('.alert-success', 'User update successful')
    
    cy.contains('.user__item:first-child h5', 'Jake Doe')
    
    cy.get('.user__item:first-child .user__action a')
      .click()

    cy.get('#input_role')
      .should('have.value', 'false')
  })

  it.only('Should upgrade user role', function() {
    cy.login(this.admin.email, this.admin.password)

    cy.visit('/#/user')

    cy.get('.user__item:last-child .user__action a')
      .click()

    cy.url()
      .should('include', 'user/edit')

    cy.get('#input_role')
      .select('Administrator')
      .should('have.value', 'true')

    cy.get('form .btn-primary')
      .click()

    cy.contains('.alert-success', 'User update successful')
    cy.contains('.user__item:first-child h5', 'John Doe')
    cy.get('.user__item:first-child .user__action a')
      .click()

    cy.get('#input_role')
      .should('have.value', 'true')
  })

  it('Should search user', function() {
    cy.login(this.admin.email, this.admin.password)

    cy.visit('/#/user')

    cy.get('.search-form input.form-control')
      .clear()
      .type(this.admin.firstName)

    cy.get('.user__item')
      .its('length')
      .should('be', 1)

    cy.get('.search-form input.form-control')
      .clear()
      .type(this.admin.firstName.substring(0, 2))

    cy.get('.user__item')
      .its('length')
      .should('be', 3)

    cy.get('.search-form input.form-control')
      .clear()

    cy.get('.user__item')
      .its('length')
      .should('be', 3)
  })

  it('Should display empty list when no user is found', function() {
    cy.login(this.admin.email, this.admin.password)

    cy.visit('/#/user')

    cy.get('.search-form input.form-control')
      .clear()
      .type('you cant find me :)')

    cy.contains('.empty__headline', 'No results')
  })
})