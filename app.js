// ============================================
// GYMDRAMA — app.js
// ============================================

const GRUPOS_MUSCULARES = {
  superior: ["peito", "costas", "ombros", "bíceps", "tríceps"],
  inferior: ["glúteos", "quadríceps", "posterior", "panturrilhas"]
}

let contadorExercicios = 0
let treinoAtual = null
let treinosImportados = []


// === TABS ===

function trocarTab(tab) {
  document.getElementById("tab-manual").style.display = tab === "manual" ? "block" : "none"
  document.getElementById("tab-csv").style.display    = tab === "csv"    ? "block" : "none"

  document.querySelectorAll(".tab-btn").forEach((btn, i) => {
    btn.classList.toggle("active", (i === 0 && tab === "manual") || (i === 1 && tab === "csv"))
  })

  esconderResultados()
}


// === FORMULÁRIO MANUAL ===

function adicionarExercicio() {
  const id = contadorExercicios++
  const container = document.getElementById("lista-exercicios")
  const bloco = document.createElement("div")
  bloco.className = "ex-box"
  bloco.id = `ex-${id}`

  const tagsSuperiores = GRUPOS_MUSCULARES.superior.map(g =>
    `<span class="musculo-tag" data-grupo="${g}" onclick="toggleMusculo(this,${id})">${g}</span>`
  ).join("")

  const tagsInferiores = GRUPOS_MUSCULARES.inferior.map(g =>
    `<span class="musculo-tag" data-grupo="${g}" onclick="toggleMusculo(this,${id})">${g}</span>`
  ).join("")

  bloco.innerHTML = `
    <div class="ex-row">
      <div class="form-field">
        <label class="form-label">exercício</label>
        <input type="text" class="form-input ex-nome" placeholder="ex: Supino Reto" />
      </div>
      <div class="form-field ex-num">
        <label class="form-label">séries</label>
        <input type="number" class="form-input ex-series" placeholder="4" />
      </div>
      <div class="form-field ex-num">
        <label class="form-label">reps</label>
        <input type="number" class="form-input ex-reps" placeholder="10" />
      </div>
      <div class="form-field ex-num">
        <label class="form-label">kg</label>
        <input type="number" class="form-input ex-carga" placeholder="0" />
      </div>
      <button class="btn-remover" onclick="removerExercicio(${id})">×</button>
    </div>
    <div class="musculos-row">
      <span class="musculo-sep">superior</span>${tagsSuperiores}
      <span class="musculo-sep">inferior</span>${tagsInferiores}
    </div>
  `
  container.appendChild(bloco)
}

function removerExercicio(id) {
  const bloco = document.getElementById(`ex-${id}`)
  if (bloco) bloco.remove()
}

function toggleMusculo(el, id) {
  document.getElementById(`ex-${id}`)
    .querySelectorAll(".musculo-tag")
    .forEach(t => t.classList.remove("selecionado"))
  el.classList.add("selecionado")
}

function coletarDadosManuais() {
  const nome    = document.getElementById("input-nome").value || "Treino sem nome"
  const duracao = parseInt(document.getElementById("input-duracao").value) || 0
  const blocos  = document.querySelectorAll(".ex-box")
  const exercicios = []
  let pesoTotal = 0

  blocos.forEach(bloco => {
    const exNome  = bloco.querySelector(".ex-nome").value
    const series  = parseInt(bloco.querySelector(".ex-series").value) || 0
    const reps    = parseInt(bloco.querySelector(".ex-reps").value) || 0
    const carga   = parseFloat(bloco.querySelector(".ex-carga").value) || 0
    const grupoEl = bloco.querySelector(".musculo-tag.selecionado")
    const grupo   = grupoEl ? grupoEl.dataset.grupo : null

    if (exNome) {
      exercicios.push({ nome: exNome, series, reps, carga, grupo, cargaMax: carga, volumeTotal: series * reps * carga })
      pesoTotal += series * reps * carga
    }
  })

  return {
    nome,
    duracao,
    exercicios,
    pesoTotalLevantado: Math.round(pesoTotal),
    data: new Date().toLocaleDateString("pt-BR"),
    dataISO: new Date().toISOString().split("T")[0],
    fonte: "manual"
  }
}

function gerarDramaManual() {
  const dados = coletarDadosManuais()

  if (dados.exercicios.length === 0) {
    alert("Adiciona pelo menos um exercício!")
    return
  }

  salvarTreino(dados)
  treinoAtual = dados
  mostrarResultados()
}


// === UPLOAD CSV ===

function handleDrop(event) {
  event.preventDefault()
  document.getElementById("upload-area").classList.remove("dragover")
  const arquivo = event.dataTransfer.files[0]
  if (arquivo) processarArquivo(arquivo)
}

function handleFileInput(event) {
  const arquivo = event.target.files[0]
  if (arquivo) processarArquivo(arquivo)
}

async function processarArquivo(arquivo) {
  const status = document.getElementById("csv-status")
  status.style.display = "block"
  status.className = "csv-status loading"
  status.textContent = "processando arquivo..."

  try {
    const resultado = await processarCSV(arquivo)

    status.className = "csv-status sucesso"
    status.textContent = `✓ ${resultado.novos} treinos novos importados! (${resultado.total} no histórico total)`

    treinosImportados = resultado.treinos.length > 0 ? resultado.treinos : carregarHistorico()

    preencherSeletorTreinos()
    document.getElementById("csv-selector").style.display = "block"

  } catch (err) {
    status.className = "csv-status erro"
    status.textContent = `✗ ${err}`
  }
}

function preencherSeletorTreinos() {
  const select   = document.getElementById("select-treino")
  const historico = carregarHistorico()
    .sort((a, b) => (b.dataISO || "").localeCompare(a.dataISO || ""))

  select.innerHTML = '<option value="">selecione um treino...</option>'

  historico.forEach((t, i) => {
    const option = document.createElement("option")
    option.value = i
    option.textContent = `${t.data || "sem data"} — ${t.nome}`
    select.appendChild(option)
  })
}

function gerarDramaCSV() {
  const select   = document.getElementById("select-treino")
  const idx      = select.value
  const historico = carregarHistorico().sort((a, b) => (b.dataISO || "").localeCompare(a.dataISO || ""))

  if (idx === "" || !historico[idx]) {
    alert("Seleciona um treino primeiro!")
    return
  }

  treinoAtual = historico[idx]
  mostrarResultados()
}


// === MOSTRAR / ESCONDER RESULTADOS ===

function mostrarResultados() {
  ;["resumo", "drama", "personagem", "equivalencias"].forEach(id => {
document.getElementById("btn-novo").style.display = "block"
document.getElementById("btn-exportar-grupo").style.display = "flex"
  })

  document.getElementById("btn-novo").style.display = "block"

  mostrarResumo()
  mostrarDrama()
  mostrarPersonagem()
  mostrarEquivalencias()

  document.getElementById("resumo").scrollIntoView({ behavior: "smooth" })
}

function esconderResultados() {
  ;["resumo", "drama", "personagem", "equivalencias"].forEach(id => {
    document.getElementById(id).style.display = "none"
  })
document.getElementById("btn-novo").style.display = "none"
document.getElementById("btn-exportar-grupo").style.display = "none"
}

function resetar() {
  esconderResultados()
  treinoAtual = null

  // Limpa form manual
  document.getElementById("input-nome").value    = ""
  document.getElementById("input-duracao").value = ""
  document.getElementById("lista-exercicios").innerHTML = ""
  contadorExercicios = 0
  adicionarExercicio()

  // Limpa CSV
  document.getElementById("csv-status").style.display   = "none"
  document.getElementById("csv-selector").style.display = "none"
  document.getElementById("input-csv").value            = ""

  window.scrollTo({ top: 0, behavior: "smooth" })
}


// === DETECTAR MÚSCULOS ===

function detectarMusculos(exercicios) {
  const grupos = exercicios.map(e => e.grupo).filter(Boolean)
  const unicos = [...new Set(grupos)]

  // Se não tiver grupo selecionado, usa o nome do exercício
  const primeiroExercicio = exercicios[0]?.nome || "treino"
  const segundoExercicio  = exercicios[1]?.nome || exercicios[0]?.nome || "treino"

  const dominante     = unicos[0] || primeiroExercicio
  const secundario    = unicos[1] || segundoExercicio
  const todosGrupos   = [...GRUPOS_MUSCULARES.superior, ...GRUPOS_MUSCULARES.inferior]
  const negligenciado = todosGrupos.find(g => !unicos.includes(g)) || "perna"

  return { dominante, secundario, negligenciado, todos: unicos }
}


// === SUBSTITUIR PLACEHOLDERS ===

function substituir(frase, musculos, exercicios) {
  return frase
    .replace(/\[grupo dominante\]/g,            musculos.dominante)
    .replace(/\[grupo principal\]/g,             musculos.dominante)
    .replace(/\[músculo principal\]/g,           musculos.dominante)
    .replace(/\[parte do corpo principal\]/g,    musculos.dominante)
    .replace(/\[parte do corpo bem treinada\]/g, musculos.dominante)
    .replace(/\[superior\]/g,                    musculos.dominante)
    .replace(/\[exercício principal\]/g,         exercicios[0]?.nome || "exercício")
    .replace(/\[exercício\]/g,                   exercicios[0]?.nome || "exercício")
    .replace(/\[músculo envolvido\]/g,           musculos.dominante)
    .replace(/\[grupo muscular\]/g,              musculos.dominante)
    .replace(/\[grupo muscular negligenciado\]/g, musculos.negligenciado)
    .replace(/\[grupo negligenciado\]/g,         musculos.negligenciado)
    .replace(/\[grupo fraco\]/g,                 musculos.negligenciado)
    .replace(/\[outros\]/g,                      musculos.secundario)
    .replace(/\[outras\]/g,                      musculos.secundario)
    .replace(/\[resto do corpo\]/g,              musculos.secundario)
    .replace(/\[parte ignorada\]/g,              musculos.negligenciado)
    .replace(/\[inferior\]/g,                    musculos.negligenciado)
    .replace(/\[bíceps\]/g,                      musculos.dominante)
    .replace(/\[pernas\]/g,                      musculos.negligenciado)
    .replace(/\[perna\]/g,                       musculos.negligenciado)
    .replace(/\[glúteos\]/g,                     musculos.negligenciado)
    .replace(/\[braços\]/g,                      musculos.dominante)
    .replace(/\[core\]/g,                        "core")
}


// === 1. RESUMO ===

function mostrarResumo() {
  const container = document.getElementById("resumo-conteudo")
  const t = treinoAtual

  const stats = `
    <div class="resumo-stats">
      <div class="stat">
        <div class="stat-numero">${t.duracao}min</div>
        <div class="stat-label">duração</div>
      </div>
      <div class="stat">
        <div class="stat-numero">${t.exercicios.length}</div>
        <div class="stat-label">exercícios</div>
      </div>
      <div class="stat">
        <div class="stat-numero">${t.pesoTotalLevantado.toLocaleString("pt-BR")}kg</div>
        <div class="stat-label">peso total</div>
      </div>
    </div>
  `

  const lista = t.exercicios.map(ex => `
    <div class="exercicio-item">
      <span class="exercicio-nome">
        ${ex.nome}
        ${ex.grupo ? `<span class="ex-grupo-badge">${ex.grupo}</span>` : ""}
      </span>
      <span class="exercicio-detalhe">${ex.series}x${ex.reps} · ${ex.carga}kg</span>
    </div>
  `).join("")

  container.innerHTML = stats + lista
}


// === 2. DRAMA ===

function mostrarDrama() {
  const musculos = detectarMusculos(treinoAtual.exercicios)

  const frases = [
    "Você abandonou [perna] de novo. Elas lembram. Enquanto isso, [grupo dominante] recebe atenção suspeita e [grupo negligenciado] segue em observação silenciosa.",
    "Esse treino foi movido por emoções não resolvidas. A carga em [exercício principal] diz tudo que você não consegue falar. [grupo negligenciado] percebeu.",
    "Isso não foi um treino. Foi um posicionamento. [grupo dominante] está em training arc. [outros] seguem em modo espera, aguardando melhores decisões.",
    "[grupo dominante] está recebendo atenção suspeita. [pernas] sabem. Core também. Isso já virou um ambiente hostil.",
    "Você apareceu. Isso já é built different. O resto é detalhe — mas [grupo negligenciado] gostaria de abrir um chamado.",
    "Hoje você não treinou. Você farmou aura. E, de alguma forma, [grupo dominante] moggou geral enquanto [grupo negligenciado] ficou assistindo.",
    "Você serviu hoje. Não perfeitamente, mas com intenção. [grupo dominante] entregou tudo. [grupo negligenciado] entregou presença simbólica.",
    "Entregou tudo em [grupo dominante]. Em [grupo negligenciado], entregou um conceito. Ainda em fase de validação.",
    "Humilhou sem esforço em [grupo dominante]. [grupo negligenciado] segue em desenvolvimento emocional e físico.",
    "Deu o nome. [grupo dominante] saiu valorizado. [outros] participaram como figurantes.",
    "Esse treino não foi sobre músculos. Foi sobre provar um ponto que ninguém pediu. [grupo negligenciado] inclusive discorda.",
    "Cada repetição em [exercício] carregava mais do que peso. [grupo dominante] sentiu. Os outros… nem tanto.",
    "Você claramente tinha um plano. Ele só não sobreviveu ao primeiro exercício de [grupo dominante].",
    "O foco era [grupo dominante]. A execução… múltiplas interpretações. Algumas delas questionáveis.",
    "Isso aqui foi um evento. [grupo dominante] foi protagonista. [outros] estavam em elenco de apoio."
  ]

  const sorteada = frases[Math.floor(Math.random() * frases.length)]
  let formatada = substituir(sorteada, musculos, treinoAtual.exercicios)

  musculos.todos.concat([musculos.negligenciado]).forEach(m => {
    formatada = formatada.replace(new RegExp(`\\b${m}\\b`, "gi"), `<em>${m}</em>`)
  })

  document.getElementById("drama-texto").innerHTML = formatada
}


// === 3. PERSONAGEM ===

function mostrarPersonagem() {
  const musculos = detectarMusculos(treinoAtual.exercicios)

  const personagens = [
    { emoji: "💅", nome: "Marombeira Caótica",          descricao: "Energia de vilã em pleno training arc. [grupo dominante] recebeu atenção obsessiva, enquanto [grupo negligenciado] foi ignorado com consistência. Farmou aura, moggou geral e saiu antes de fazer sentido." },
    { emoji: "⚔️", nome: "Guerreira Disciplinada",       descricao: "Apareceu. Executou. Foi embora. Zero pensamentos, só repetição. [grupo dominante] evoluiu, [outros] acompanharam como puderam. Consistência silenciosa que humilhou sem esforço." },
    { emoji: "🎬", nome: "Protagonista",                 descricao: "Esse treino tinha trilha sonora. [exercício principal] foi o clímax. [grupo dominante] brilhou, [grupo negligenciado]… teve participação especial. Energia de protagonista, mesmo sem roteiro definido." },
    { emoji: "🤡", nome: "Delulu mas Comprometida",      descricao: "A lógica do treino era questionável, mas a entrega foi total. [grupo dominante] recebeu amor exagerado. [grupo negligenciado] recebeu pensamentos positivos. Serviu muito. Amou, né?" },
    { emoji: "💄", nome: "Ícone Questionável",           descricao: "Entregou estética em [grupo dominante] e narrativa confusa no resto. Ninguém entendeu o plano, mas você sustentou com confiança. Isso por si só já impressiona." },
    { emoji: "🧃", nome: "Energia de Segunda-feira",     descricao: "Você veio. Não necessariamente quis, mas veio. [grupo dominante] foi feito no modo automático. [outros] ficaram para uma próxima versão sua." },
    { emoji: "🐍", nome: "Vilã em Construção",           descricao: "Existe intenção. Existe presença. Falta coerência no treino de [grupo negligenciado]. Mas isso faz parte do arco." },
    { emoji: "💪", nome: "Moggou Geral (Sem Explicação)", descricao: "Você não sabe exatamente o que fez. Mas fez. [grupo dominante] saiu superior. Os outros ficaram confusos. Funcionou mesmo assim." },
    { emoji: "💀", nome: "Caos Controlado",              descricao: "De fora parece bagunça. De dentro… também. Mas [grupo dominante] evoluiu. E no fim, é isso que você vai defender." },
    { emoji: "👑", nome: "Deu o Nome",                   descricao: "Não foi perfeito. Não foi completo. Mas teve presença. [grupo dominante] foi valorizado. E você sustentou isso até o fim. DIVA." }
  ]

  const sorteado  = personagens[Math.floor(Math.random() * personagens.length)]
  const descricao = substituir(sorteado.descricao, musculos, treinoAtual.exercicios)

  document.getElementById("personagem-conteudo").innerHTML = `
    <div class="char-pill">${sorteado.emoji} ${sorteado.nome}</div>
    <p class="char-descricao">${descricao}</p>
  `
}


// === 4. EQUIVALÊNCIAS ===

function mostrarEquivalencias() {
  const peso     = treinoAtual.pesoTotalLevantado
  const musculos = detectarMusculos(treinoAtual.exercicios)

  const equivalencias = [
    `Equivalente a <strong>${Math.round(peso / 0.005).toLocaleString("pt-BR")} grãos de arroz</strong>. Uma panela inteira… várias vezes.`,
    `Como carregar <strong>${Math.round(peso / 92)} sacos de feijão</strong> — emocionalmente, muito mais pesado.`,
    `Isso daria pra montar <strong>${Math.round(peso / 350)} marmitas fitness</strong> que você provavelmente não faria.`,
    `Equivalente a <strong>${Math.round(peso / 1.5).toLocaleString("pt-BR")} litros de água</strong>. Hidratação que você não teve.`,
    `Seu treino pesou o mesmo que <strong>${Math.round(peso / 4.5)} gatos empilhados</strong> com carinho.`,
    `Isso aqui foi basicamente levantar um zoológico pequeno — focado em <strong>${musculos.dominante}</strong>.`,
    `Isso em crochê seria <strong>${Math.round(peso / 1500)} horas de ponto alto intenso</strong>.`,
    `Equivalente a <strong>${Math.round(peso / 55)} horas fingindo</strong> que vai arrumar a vida na segunda-feira.`,
    `Isso daria <strong>${Math.round(peso / 2)} idas e voltas na cozinha</strong> sem motivo aparente.`,
    `Equivalente a <strong>${Math.round(peso / 30)} decisões questionáveis</strong> — consistente com o treino.`,
    `Equivalente ao peso de <strong>${Math.round(peso / 25)} expectativas não correspondidas</strong>.`,
    `Isso aqui pesa o mesmo que <strong>${Math.round(peso / 40)} planos que você não seguiu</strong>.`,
    `Levantou mais do que <strong>${Math.round(peso / 18)} desculpas</strong> pra não treinar ${musculos.negligenciado}.`,
    `Muito peso levantado. <strong>Pouca coerência estratégica.</strong>`,
    `Impressionante — principalmente considerando as escolhas feitas em ${musculos.negligenciado}.`
  ]

  const sorteadas = [...equivalencias].sort(() => Math.random() - 0.5).slice(0, 3)
  const lista = document.getElementById("equivalencias-lista")
  lista.className = "equivalencias-lista"
  lista.innerHTML = sorteadas.map(e => `
    <li class="equiv-item">
      <div class="equiv-dot"></div>
      <span>${e}</span>
    </li>
  `).join("")
}


// === INIT ===
adicionarExercicio()
