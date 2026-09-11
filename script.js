async function buscarPais(nomePais) {
    const areaResultado = document.getElementById("resultado");
    
    // Mostra estado de carregamento
    areaResultado.innerHTML = "<p aria-busy='true'>Buscando informações...</p>";

    try {
        // Realiza a chamada à REST Countries API
        const resposta = await fetch(`https://restcountries.com/v3.1/name/${nomePais}`);
        
        // Verifica se a resposta foi bem-sucedida (status 200-299)
        if (!resposta.ok) {
            throw new Error("País não encontrado");
        }

        const dados = await resposta.json();
        
        // A API retorna um array. Pegamos o primeiro país retornado.
        const pais = dados[0]; 

        // Extraímos pelo menos 3 informações (nome, bandeira, capital, populacao, continente)
        const nome = pais.name.common;
        const bandeira = pais.flags.svg;
        const capital = pais.capital ? pais.capital[0] : "Não possui";
        const populacao = pais.population.toLocaleString('pt-BR');
        const continente = pais.region;

        // Renderiza os dados no HTML
        areaResultado.innerHTML = `
            <div class="card-pais">
                <img src="${bandeira}" alt="Bandeira de ${nome}">
                <h2>${nome}</h2>
                <p><strong>Capital:</strong> ${capital}</p>
                <p><strong>População:</strong> ${populacao} habitantes</p>
                <p><strong>Continente:</strong> ${continente}</p>
            </div>
        `;

    } catch (erro) {
        // Tratamento de erro amigável
        areaResultado.innerHTML = `
            <div class="erro">
                <p>Ops! Não encontramos nenhum país chamado "${nomePais}". Verifique a ortografia (tente em inglês) e tente novamente.</p>
            </div>
        `;
    }
}

// Configuração do evento de clique no botão
document.getElementById("botao-buscar").addEventListener("click", () => {
    const termo = document.getElementById("campo-busca").value.toLowerCase().trim();
    if (termo) {
        buscarPais(termo);
    }
});

// Permite buscar pressionando a tecla "Enter" no campo de texto
document.getElementById("campo-busca").addEventListener("keypress", (evento) => {
    if (evento.key === "Enter") {
        const termo = document.getElementById("campo-busca").value.toLowerCase().trim();
        if (termo) {
            buscarPais(termo);
        }
    }
});