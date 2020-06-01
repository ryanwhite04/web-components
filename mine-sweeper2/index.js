const _customElementsDefine = window.customElements.define;
window.customElements.define = (name, cl, conf) => customElements.get(name) ?
console.warn(`${name} has been defined twice`) :
_customElementsDefine.call(window.customElements, name, cl, conf);

  window.onload = main;

function main() {

    const game = document.getElementById('game');
    const difficulty = document.getElementById('difficulty');
    const options = document.getElementById('options');
    const rows = document.getElementById('rows');
    const columns = document.getElementById('columns');
    const mines = document.getElementById('mines');

    game.addEventListener('end', e => console.log('Game', 'End', e));
    difficulty.addEventListener('change', setDifficulty)
    setDifficulty({ currentTarget: difficulty })

    function setDifficulty({ currentTarget: { value }}) {
    if (value !== '0') {

        Object.assign(game, {
        rows: 16,
        columns: 10,
        difficulty: parseInt(value),
        });

        options.setAttribute('hidden', true);

    } else {

        rows.value = game.rows;
        columns.value = game.columns;
        mines.value = game.difficulty;
        mines.setAttribute('max', game.rows * game.columns);
        options.removeAttribute('hidden');
        
    }
    }

    rows.addEventListener('change', ({ currentTarget: { value }}) => game.rows = value)
    columns.addEventListener('change', ({ currentTarget: { value }}) => game.columns = value)
    mines.addEventListener('change', ({ currentTarget: { value }}) => game.difficulty = value)

}
