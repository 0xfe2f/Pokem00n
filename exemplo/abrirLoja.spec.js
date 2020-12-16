const abrirLoja = require('./abrirLoja')

const { expect } = require('chai')

describe('AbrirLoja', () => {
    it('Tem algum dinheiro', () => {
        expect(abrirLoja(0)).to.be.false
    })
})