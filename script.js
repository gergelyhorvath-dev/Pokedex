async function loadPokemon() {
    let response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=20"
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

        container.innerHTML += `
            <li>
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.sprites.front_default}">
            </li>
        `;
    }
}

loadPokemon();