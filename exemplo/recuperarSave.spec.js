const podeRecuperarSave = require('./recuperarSave')

const { expect } = require('chai')

describe('RecuperarSave', () => {
    it('Sem save disponivel', () => {
        expect(podeRecuperarSave(0)).to.be.false
    })
})