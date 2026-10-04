let offset = 0;
let allPokemon = [];
let currentPokemonIndex = 0;


async function loadPokemon() {
    showLoading(true);
    let response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`
    );
    let data = await response.json();
    await loadPokemonDetails(data.results);
    renderPokemon(allPokemon);
    showLoading(false);
}


async function loadPokemonDetails(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        let response = await fetch(pokemonList[i].url);
        let pokemon = await response.json();
        allPokemon.push(pokemon);
    }
}


function renderPokemon(pokemonList) {
    let container = document.getElementById("pokemon-list");
    container.innerHTML = "";
    for (let i = 0; i < pokemonList.length; i++) {
        container.innerHTML += pokemonTemplate(pokemonList[i]);
    }
}


function pokemonTemplate(pokemon) {
    let pokemonTypes = createPokemonTypes(pokemon.types);
    let mainType = pokemon.types[0].type.name;

    return `
        <li>
            <button class="pokemon-card ${mainType}" data-id="card"
                onclick="openPokemon(${pokemon.id})"
                aria-label="Open ${pokemon.name}">
                <p class="pokemon-number">#${pokemon.id}</p>
                <img src="${pokemon.sprites.front_default}"
                    alt="${pokemon.name}" data-id="card-image">
                <h2>${capitalize(pokemon.name)}</h2>
                <div class="pokemon-types">${pokemonTypes}</div>
            </button>
        </li>
    `;
}


function createPokemonTypes(types) {
    let pokemonTypes = "";

    for (let i = 0; i < types.length; i++) {
        let typeName = types[i].type.name;
        pokemonTypes += `
            <span class="pokemon-type ${typeName}">
                ${capitalize(typeName)}
            </span>`;
    }
    return pokemonTypes;
}


function searchPokemon() {
    let input = document.getElementById("search-input").value.toLowerCase();

    if (input.length < 3) {
        renderPokemon(allPokemon);
        return;
    }

    let filteredPokemon = allPokemon.filter(
        pokemon => pokemon.name.includes(input)
    );
    renderSearchResult(filteredPokemon);
}


function renderSearchResult(filteredPokemon) {
    let container = document.getElementById("pokemon-list");

    if (filteredPokemon.length === 0) {
        container.innerHTML = `
            <p class="not-found" data-id="not-found">No match found.</p>`;
        return;
    }
    renderPokemon(filteredPokemon);
}


function openPokemon(id) {
    currentPokemonIndex = allPokemon.findIndex(pokemon => pokemon.id === id);
    renderDialog();
    document.getElementById("pokemon-dialog").showModal();
    document.body.classList.add("no-scroll");
}


function renderDialog() {
    let pokemon = allPokemon[currentPokemonIndex];
    let content = document.getElementById("dialog-content");
    content.innerHTML = dialogTemplate(pokemon);
}


function dialogTemplate(pokemon) {
    let mainType = pokemon.types[0].type.name;
    return `
        <div class="dialog-card ${mainType}" data-id="overlay-pokemon-name">
            <button class="close-button" data-id="close-dialog-button"
                onclick="closeDialog()" aria-label="Close dialog">×</button>
            <h2>${capitalize(pokemon.name)}</h2>
            <p>#${pokemon.id}</p>
            <img class="dialog-image" data-id="dialog-image"
                src="${pokemon.sprites.other["official-artwork"].front_default}"
                alt="${pokemon.name}">
            ${statsTemplate(pokemon)}
            <div class="dialog-navigation">
                <button data-id="prev-button" onclick="previousPokemon()"
                    aria-label="Previous Pokémon">←</button>
                <button data-id="next-button" onclick="nextPokemon()"
                    aria-label="Next Pokémon">→</button>
            </div>
        </div>`;
}


function statsTemplate(pokemon) {
    return `
        <div class="stats">
            <p>HP: ${pokemon.stats[0].base_stat}</p>
            <p>Attack: ${pokemon.stats[1].base_stat}</p>
            <p>Defense: ${pokemon.stats[2].base_stat}</p>
        </div>`;
}


function closeDialog() {
    document.getElementById("pokemon-dialog").close();
    document.body.classList.remove("no-scroll");
}


function previousPokemon() {
    currentPokemonIndex--;
    if (currentPokemonIndex < 0) currentPokemonIndex = allPokemon.length - 1;
    renderDialog();
}


function nextPokemon() {
    currentPokemonIndex++;
    if (currentPokemonIndex >= allPokemon.length) currentPokemonIndex = 0;
    renderDialog();
}


function loadMore() {
    offset = offset + 20;
    loadPokemon();
}


function showLoading(isLoading) {
    let loading = document.getElementById("loading");
    let button = document.querySelector(".load-more-button");
    loading.style.display = isLoading ? "block" : "none";
    button.disabled = isLoading;
}


function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}


document.getElementById("pokemon-dialog").addEventListener("click", function(event) {
    if (event.target === this) closeDialog();
});


loadPokemon();
