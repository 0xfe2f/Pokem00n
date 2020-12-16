const podeUsarPocao = require('./usarPocao')

const { expect } = require('chai')

describe('UsarPocao', () => {
    it('Sem itens', () => {
        expect(podeUsarPocao(0)).to.be.false
    })
})