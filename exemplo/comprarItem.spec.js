const podeComprarItem = require('./comprarItem')

const { expect } = require('chai')

describe('ComprarItem', () => {
    it('Valor insuficiente', () => {
        expect(podeComprarItem(10, 20)).to.be.false
    })
})