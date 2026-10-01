let offset = 0;

async function loadPokemon() {
    let loading = document.getElementById("loading");
    let loadMoreButton = document.querySelector(".load-more-button");

    loading.style.display = "block";
    loadMoreButton.disabled = true;

    let response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`
    );

    let data = await response.json();
    let pokemonList = data.results;

    await renderPokemon(pokemonList);

    loading.style.display = "none";
    loadMoreButton.disabled = false;
}


async function renderPokemon(pokemonList) {
    let container = document.getElementById("pokemon-list");

    for (let i = 0; i < pokemonList.length; i++) {
        let detailResponse = await fetch(pokemonList[i].url);
        let pokemon = await detailResponse.json();

        let pokemonTypes = createPokemonTypes(pokemon.types);
        let mainType = pokemon.types[0].type.name;

        container.innerHTML += pokemonTemplate(
            pokemon,
            pokemonTypes,
            mainType
        );
    }
}


function createPokemonTypes(types) {
    let pokemonTypes = "";

    for (let i = 0; i < types.length; i++) {
        let typeName = types[i].type.name;

        pokemonTypes += `
            <span class="pokemon-type ${typeName}">
                ${typeName}
            </span>
        `;
    }

    return pokemonTypes;
}


function pokemonTemplate(pokemon, pokemonTypes, mainType) {
    return `
        <li class="pokemon-card ${mainType}">
            <p class="pokemon-number">#${pokemon.id}</p>

            <img 
                src="${pokemon.sprites.front_default}"
                alt="${pokemon.name}"
                data-id="card-image"
            >

            <h2>${pokemon.name}</h2>

            <div class="pokemon-types">
                ${pokemonTypes}
            </div>
        </li>
    `;
}


function loadMore() {
    offset = offset + 20;
    loadPokemon();
}


loadPokemon();