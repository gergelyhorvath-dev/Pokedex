let offset = 0;

async function loadPokemon() {

    let loading = document.getElementById("loading");
    loading.style.display = "block";

    let response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`
    );

    let data = await response.json();

    console.log(data);

    let pokemonList = data.results;
    let container = document.getElementById("pokemon-list");

    for (let i = 0; i < pokemonList.length; i++) {

        console.log(pokemonList[i].name);
        console.log(pokemonList[i].url);

        let detailResponse = await fetch(pokemonList[i].url);
        let pokemon = await detailResponse.json();

        console.log(pokemon);

        let pokemonType = pokemon.types[0].type.name;

        container.innerHTML += `
            <li>
                <p class="pokemon-number">#${pokemon.id}</p>

                <img src="${pokemon.sprites.front_default}">

                <h2>${pokemon.name}</h2>

                <p class="pokemon-type">
                    Type: ${pokemonType}
                </p>
            </li>
        `;
    }

    loading.style.display = "none";
}

loadPokemon();


function loadMore() {
    offset = offset + 20;
    loadPokemon();
}