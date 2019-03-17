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