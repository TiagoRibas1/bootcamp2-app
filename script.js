import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Credenciais do seu Supabase
const SUPABASE_URL = "https://pjhtrqgxuttmauklkkpn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaHRycWd4dXR0bWF1a2xra3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODAzNTcsImV4cCI6MjEwNzU1NjM1N30.cLFBQ-RSrRrrOyE51wr42MCgcQuTF4SDkc-eoVd5RcM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. READ - Listar favoritos do Supabase
async function listarFavoritos() {
  const listaElemento = document.getElementById("lista-favoritos");
  if (!listaElemento) return;

  listaElemento.innerHTML = "Carregando favoritos...";

  try {
    const { data, error } = await supabase
      .from("favoritos")
      .select("*");

    if (error) {
      console.warn("Aviso Supabase:", error);
      listaElemento.innerHTML = "<li>Nenhum país favorito guardado.</li>";
      return;
    }

    if (!data || data.length === 0) {
      listaElemento.innerHTML = "<li>Nenhum país favorito guardado.</li>";
      return;
    }

    listaElemento.innerHTML = "";
    [...data].reverse().forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span><strong>${item.nome_item}</strong> (${item.dados_extra || 'Sem dados'})</span>
        <button class="btn-remover" data-id="${item.id}">Excluir</button>
      `;
      listaElemento.appendChild(li);
    });

    document.querySelectorAll(".btn-remover").forEach((botao) => {
      botao.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        removerFavorito(id);
      });
    });
  } catch (err) {
    console.error("Erro Supabase:", err);
    listaElemento.innerHTML = "<li>Erro ao ligar ao banco de dados.</li>";
  }
}

// 2. CREATE - Guardar favorito
async function salvarFavorito(nome, detalhe) {
  try {
    const { error } = await supabase
      .from("favoritos")
      .insert({ nome_item: nome, dados_extra: detalhe });

    if (error) {
      alert("Erro ao guardar favorito: " + error.message);
    } else {
      listarFavoritos();
    }
  } catch (err) {
    alert("Erro de comunicação com o Supabase.");
  }
}

// 3. DELETE - Remover favorito
async function removerFavorito(id) {
  try {
    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao remover: " + error.message);
    } else {
      listarFavoritos();
    }
  } catch (err) {
    alert("Erro de comunicação com o Supabase.");
  }
}

// 4. FETCH - Consulta de Países
async function buscarDados(termo) {
  const area = document.getElementById("resultado");
  if (!area) return;

  area.innerHTML = "<p>Carregando...</p>";

  const termoLimpo = encodeURIComponent(termo.trim());

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${termoLimpo}&count=1&language=pt&format=json`;
    const resposta = await fetch(url);

    if (!resposta.ok) throw new Error("Erro na rede");

    const dados = await resposta.json();

    if (!dados.results || dados.results.length === 0) {
      throw new Error("País não encontrado");
    }

    const local = dados.results[0];
    const nomePais = local.country || local.name;
    const codigoPais = local.country_code ? local.country_code.toLowerCase() : "";
    const populacaoFormatada = local.population ? local.population.toLocaleString("pt-BR") : "Não informada";
    const regiao = local.admin1 || local.timezone || "N/A";
    
    // Constrói a tag da imagem de forma isolada para evitar erros de interpolação
    let imgTag = "";
    if (codigoPais) {
      imgTag = '<img src="https://flagcdn.com/w160/' + codigoPais + '.png" alt="Bandeira de ' + nomePais + '">';
    }

    area.innerHTML = `
      <div class="card-pais">
        ${imgTag}
        <h2>${nomePais}</h2>
        <p><strong>Região / Fuso:</strong> ${regiao}</p>
        <p><strong>Código do País:</strong> ${local.country_code ? local.country_code.toUpperCase() : "N/A"}</p>
        <p><strong>População estimada:</strong> ${populacaoFormatada} habitantes</p>
        <button id="btn-add-favorito" class="btn-favoritar">⭐ Guardar nos Favoritos</button>
      </div>
    `;

    document.getElementById("btn-add-favorito")?.addEventListener("click", () => {
      salvarFavorito(nomePais, `Região: ${regiao}`);
    });
  } catch (erro) {
    console.error("Erro na busca:", erro);
    area.innerHTML = `
      <div class="erro">
        <p>Ops! Não foi possível encontrar este país. Tente pesquisar por: <strong>Brasil</strong>, <strong>Japão</strong>, <strong>França</strong> ou <strong>Portugal</strong>.</p>
      </div>
    `;
  }
}

// Eventos
document.getElementById("botao-buscar")?.addEventListener("click", () => {
  const campo = document.getElementById("campo-busca");
  if (campo && campo.value.trim()) {
    buscarDados(campo.value);
  }
});

document.getElementById("campo-busca")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const campo = document.getElementById("campo-busca");
    if (campo && campo.value.trim()) {
      buscarDados(campo.value);
    }
  }
});

// Carregar lista de favoritos ao iniciar a página
window.addEventListener("DOMContentLoaded", listarFavoritos);