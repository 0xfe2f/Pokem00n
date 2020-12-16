const podeCapturar = require('./capturar')

const { expect } = require('chai')

describe('Capturar', () => {
    it('Sem pokebolas', () => {
        expect(podeCapturar(0)).to.be.false
    })
})