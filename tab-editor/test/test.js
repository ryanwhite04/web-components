import Tab from '../parse.js'
import tests from './tests.js'

describe('Parser', () => {

  tests
    .filter(({ ignore }) => !ignore)
    .map(({ file, tests }) => {
      context(file, function() {
        
        // Just make sure the text file is ready
        let tab;
        before(async () => {
          tab = await fetch(`../../files/${this.title}.txt`)
            .then(file => file.text())
            .then(text => new Tab(text))
            .catch(console.error);
          console.log('Parser', this.title, tab)
        })
        
        // Run a test for each condition on each position specified in tests.js
        tests
          .filter(({ ignore }) => !ignore)
          .map(({ position, ...conditions }) => {
            describe(`Row: ${position.row}, Column: ${position.column}`, () => {
              Object.entries(conditions).map(([func, expectation]) => {
                it(func, () => {
                  chai.expect(tab[func](position)).to.eql(expectation)
                })
              })
            })
          })
      })
    })
})