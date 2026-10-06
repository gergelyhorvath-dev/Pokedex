let offset = 0;
let allPokemon = [];
let currentPokemonIndex = 0;
let pokemonCache = {};
let speciesCache = {};


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
        let pokemon = await getPokemonData(pokemonList[i].url);
        if (!allPokemon.some(item => item.id === pokemon.id)) allPokemon.push(pokemon);
    }
}


async function getPokemonData(url) {
    if (pokemonCache[url]) return pokemonCache[url];
    let response = await fetch(url);
    let pokemon = await response.json();
    pokemonCache[url] = pokemon;
    return pokemon;
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


function updateSearchButton() {
    let input = document.getElementById("search-input").value.trim();
    document.getElementById("search-button").disabled = input.length < 3;
}


function searchPokemon() {
    let input = document.getElementById("search-input").value.trim().toLowerCase();

    if (input.length < 3) {
        renderPokemon(allPokemon);
        return;
    }

    let filteredPokemon = allPokemon.filter(
        pokemon => pokemon.name.includes(input) || pokemon.id.toString() === input
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


async function openPokemon(id) {
    currentPokemonIndex = allPokemon.findIndex(pokemon => pokemon.id === id);
    renderDialog("Loading extra details...");
    document.getElementById("pokemon-dialog").showModal();
    document.body.classList.add("no-scroll");
    let species = await loadSpeciesLazy(allPokemon[currentPokemonIndex]);
    renderDialog(getSpeciesText(species));
}


function renderDialog(description = "") {
    let pokemon = allPokemon[currentPokemonIndex];
    let content = document.getElementById("dialog-content");
    content.innerHTML = dialogTemplate(pokemon, description);
}


async function loadSpeciesLazy(pokemon) {
    let url = pokemon.species.url;
    if (speciesCache[url]) return speciesCache[url];
    let response = await fetch(url);
    let species = await response.json();
    speciesCache[url] = species;
    return species;
}


function getSpeciesText(species) {
    let entry = species.flavor_text_entries.find(item => item.language.name === "en");
    return entry ? entry.flavor_text.replace(/\f|\n/g, " ") : "No description available.";
}


function dialogTemplate(pokemon, description) {
    let mainType = pokemon.types[0].type.name;
    let image = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
    return `<div class="dialog-card ${mainType}" data-id="overlay-pokemon-name">
        <div class="dialog-hero">
            <button class="close-button" data-id="close-dialog-button"
                onclick="closeDialog()" aria-label="Close dialog">×</button>
            <div class="dialog-title-row">
                <h2>${capitalize(pokemon.name)}</h2><p>#${pokemon.id}</p>
            </div>
            <div class="dialog-types">${createPokemonTypes(pokemon.types)}</div>
            <img class="dialog-image" data-id="dialog-image" src="${image}" alt="${pokemon.name}">
        </div>
        <div class="dialog-info">
            ${tabsTemplate()}
            <div id="tab-content">${aboutTemplate(pokemon, description)}</div>
            ${navigationTemplate()}
        </div>
    </div>`;
}


function tabsTemplate() {
    return `<div class="info-tabs">
        <button class="tab-button active-tab" onclick="showTab('about')">About</button>
        <button class="tab-button" onclick="showTab('stats')">Base Stats</button>
        <button class="tab-button" onclick="showTab('details')">Details</button>
    </div>`;
}


function showTab(tabName) {
    let pokemon = allPokemon[currentPokemonIndex];
    let content = document.getElementById("tab-content");
    if (tabName === "stats") content.innerHTML = statsTemplate(pokemon);
    else if (tabName === "details") content.innerHTML = detailsTemplate(pokemon);
    else content.innerHTML = aboutTemplate(pokemon, "");
    setActiveTab(tabName);
}


function setActiveTab(tabName) {
    let names = ["about", "stats", "details"];
    document.querySelectorAll(".tab-button").forEach((button, index) => {
        button.classList.toggle("active-tab", names[index] === tabName);
    });
}


function detailsTemplate(pokemon) {
    let abilities = pokemon.abilities.map(item => capitalize(item.ability.name)).join(", ");
    return `<div class="details">
        <p><strong>Abilities</strong><span>${abilities}</span></p>
        <p><strong>Experience</strong><span>${pokemon.base_experience ?? "-"}</span></p>
        <p><strong>Types</strong><span>${pokemon.types.map(item => capitalize(item.type.name)).join(", ")}</span></p>
    </div>`;
}


function aboutTemplate(pokemon, description) {
    return `<div class="about">
        <p><strong>Species</strong><span>${capitalize(pokemon.species.name)}</span></p>
        <p><strong>Height</strong><span>${pokemon.height / 10} m</span></p>
        <p><strong>Weight</strong><span>${pokemon.weight / 10} kg</span></p>
        <p class="description">${description}</p>
    </div>`;
}


function navigationTemplate() {
    return `<div class="dialog-navigation">
        <button data-id="prev-button" onclick="previousPokemon()" aria-label="Previous Pokémon">←</button>
        <button data-id="next-button" onclick="nextPokemon()" aria-label="Next Pokémon">→</button>
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


async function previousPokemon() {
    currentPokemonIndex--;
    if (currentPokemonIndex < 0) currentPokemonIndex = allPokemon.length - 1;
    await showCurrentPokemon();
}


async function nextPokemon() {
    currentPokemonIndex++;
    if (currentPokemonIndex >= allPokemon.length) currentPokemonIndex = 0;
    await showCurrentPokemon();
}


async function showCurrentPokemon() {
    renderDialog("Loading extra details...");
    let species = await loadSpeciesLazy(allPokemon[currentPokemonIndex]);
    renderDialog(getSpeciesText(species));
}


function loadMore() {
    offset = offset + 20;
    loadPokemon();
}


function showLoading(isLoading) {
    let loading = document.getElementById("loading");
    let button = document.querySelector(".load-more-button");
    loading.style.display = isLoading ? "flex" : "none";
    button.disabled = isLoading;
}


function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}


document.getElementById("pokemon-dialog").addEventListener("click", function(event) {
    if (event.target === this) closeDialog();
});


updateSearchButton();
loadPokemon();
