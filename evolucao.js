// ============================================
// GYMDRAMA — evolucao.js
// ============================================

let historicoGlobal = []
let chartFrequencia = null
let chartGrupamento = null
let chartCarga      = null

function init() {
  historicoGlobal = carregarHistorico()

  if (historicoGlobal.length === 0) {
    document.getElementById("sem-dados").style.display = "block"
    return
  }

  document.getElementById("com-dados").style.display = "block"
  renderizarStats()
  renderizarFrequencia()
  renderizarGrupamento()
  preencherSelectExercicios()
  renderizarRecordes()
}

function renderizarStats() {
  const h = historicoGlobal
  const totalTreinos = h.length
  const totalPeso    = h.reduce((a, t) => a + (t.pesoTotalLevantado || 0), 0)
  const totalMin     = h.reduce((a, t) => a + (t.duracao || 0), 0)
  const exerciciosUnicos = new Set(h.flatMap(t => t.exercicios.map(e => e.nome))).size

  document.getElementById("stats-grid").innerHTML = `
    <div class="stat"><div class="stat-numero">${totalTreinos}</div><div class="stat-label">treinos</div></div>
    <div class="stat"><div class="stat-numero">${Math.round(totalPeso / 1000)}t</div><div class="stat-label">peso total</div></div>
    <div class="stat"><div class="stat-numero">${Math.round(totalMin / 60)}h</div><div class="stat-label">na academia</div></div>
    <div class="stat"><div class="stat-numero">${exerciciosUnicos}</div><div class="stat-label">exercícios</div></div>
  `
}

function renderizarFrequencia() {
  const contagem = {}
  historicoGlobal.forEach(t => {
    const iso = t.dataISO || ""
    if (!iso) return
    const chave = iso.slice(0, 7)
    contagem[chave] = (contagem[chave] || 0) + 1
  })

  const chaves  = Object.keys(contagem).sort()
  const nomes   = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
  const labels  = chaves.map(c => { const [ano, mes] = c.split("-"); return `${nomes[parseInt(mes)-1]}/${ano.slice(2)}` })
  const valores = chaves.map(c => contagem[c])

  const ctx = document.getElementById("chart-frequencia").getContext("2d")
  if (chartFrequencia) chartFrequencia.destroy()

  chartFrequencia = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: valores, backgroundColor: "#ff4d6d44", borderColor: "#ff4d6d", borderWidth: 2, borderRadius: 6 }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "Space Grotesk", size: 11 } }, grid: { color: "#f0ebe0" } },
        x: { ticks: { font: { family: "Space Grotesk", size: 11 } }, grid: { display: false } }
      }
    }
  })
}

function renderizarGrupamento() {
  const volume = {}
  historicoGlobal.forEach(t => {
    t.exercicios.forEach(ex => {
      if (!ex.grupo) return
      volume[ex.grupo] = (volume[ex.grupo] || 0) + (ex.volumeTotal || 0)
    })
  })

  const entradas = Object.entries(volume).sort((a, b) => b[1] - a[1])
  const labels   = entradas.map(e => e[0])
  const valores  = entradas.map(e => Math.round(e[1]))

  const cores = {
    "peito":"#ff4d6d", "costas":"#7b8cff", "bíceps":"#00c897",
    "tríceps":"#f5c842", "ombros":"#ff9f43", "glúteos":"#ee5a24",
    "quadríceps":"#0652dd", "posterior":"#1289a7", "panturrilhas":"#c4e538"
  }

  const ctx = document.getElementById("chart-grupamento").getContext("2d")
  if (chartGrupamento) chartGrupamento.destroy()

  chartGrupamento = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: labels.map(l => (cores[l] || "#ccc") + "55"),
        borderColor:     labels.map(l => cores[l] || "#ccc"),
        borderWidth: 2, borderRadius: 6
      }]
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { font: { family: "Space Grotesk", size: 11 }, callback: v => `${(v/1000).toFixed(0)}t` },
          grid: { color: "#f0ebe0" }
        },
        y: { ticks: { font: { family: "Space Grotesk", size: 11 } }, grid: { display: false } }
      }
    }
  })
}

function preencherSelectExercicios() {
  const exercicios = {}
  historicoGlobal.forEach(t => {
    t.exercicios.forEach(ex => {
      if (!exercicios[ex.nome]) exercicios[ex.nome] = 0
      exercicios[ex.nome]++
    })
  })

  const ordenados = Object.entries(exercicios).sort((a, b) => b[1] - a[1]).map(e => e[0])
  const select    = document.getElementById("select-exercicio")
  select.innerHTML = '<option value="">selecione...</option>'
  ordenados.forEach(nome => {
    const opt = document.createElement("option")
    opt.value = nome; opt.textContent = nome
    select.appendChild(opt)
  })

  if (ordenados.length > 0) {
    select.value = ordenados[0]
    atualizarGraficoCarga()
  }
}

function atualizarGraficoCarga() {
  const exercicio = document.getElementById("select-exercicio").value
  if (!exercicio) return

  const pontos = []
  historicoGlobal
    .filter(t => t.dataISO)
    .sort((a, b) => a.dataISO.localeCompare(b.dataISO))
    .forEach(t => {
      const ex = t.exercicios.find(e => e.nome === exercicio)
      if (!ex) return
      pontos.push({ y: ex.cargaMax || ex.carga || 0, label: t.data || t.dataISO })
    })

  const ctx = document.getElementById("chart-carga").getContext("2d")
  if (chartCarga) chartCarga.destroy()

  chartCarga = new Chart(ctx, {
    type: "line",
    data: {
      labels: pontos.map(p => p.label),
      datasets: [{
        data: pontos.map(p => p.y),
        borderColor: "#7b8cff", backgroundColor: "#7b8cff22",
        borderWidth: 2.5, pointBackgroundColor: "#7b8cff",
        pointRadius: 4, tension: 0.3, fill: true
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: false,
          ticks: { font: { family: "Space Grotesk", size: 11 }, callback: v => `${v}kg` },
          grid: { color: "#f0ebe0" }
        },
        x: { ticks: { font: { family: "Space Grotesk", size: 10 }, maxRotation: 45 }, grid: { display: false } }
      }
    }
  })
}

function renderizarRecordes() {
  const recordes = {}
  historicoGlobal.forEach(t => {
    t.exercicios.forEach(ex => {
      const cargaMax = ex.cargaMax || ex.carga || 0
      if (!recordes[ex.nome] || cargaMax > recordes[ex.nome].carga) {
        recordes[ex.nome] = { carga: cargaMax, data: t.data || t.dataISO || "—" }
      }
    })
  })

  const ordenados = Object.entries(recordes).sort((a, b) => b[1].carga - a[1].carga).slice(0, 10)
  const container = document.getElementById("lista-recordes")

  if (ordenados.length === 0) {
    container.innerHTML = `<p style="font-size:13px; color:#999">nenhum recorde encontrado ainda</p>`
    return
  }

  container.innerHTML = ordenados.map(([nome, r], i) => `
    <div class="exercicio-item">
      <span class="exercicio-nome">
        ${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "　"}
        ${nome}
        <span style="font-size:11px; color:#bbb; margin-left:4px">${r.data}</span>
      </span>
      <span class="exercicio-detalhe" style="font-weight:700; color:#1a1a1a">${r.carga}kg</span>
    </div>
  `).join("")
}

function confirmarLimpar() {
  if (confirm("Tem certeza? Isso vai apagar todos os treinos salvos. Exporta antes se quiser guardar!")) {
    localStorage.removeItem("gymdrama_historico")
    location.reload()
  }
}

init()
