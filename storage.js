// ============================================
// GYMDRAMA — storage.js
// ============================================

const STORAGE_KEY = "gymdrama_historico"

const MAPEAMENTO_EXERCICIOS = {
  "peito": [
    "Bench Press (Barbell)", "Bench Press (Dumbbell)", "Cable Fly Crossovers",
    "Chest Fly (Dumbbell)", "Chest Fly (Machine)", "Chest Press (Band)",
    "Incline Bench Press (Dumbbell)", "Incline Chest Fly (Dumbbell)",
    "Incline Chest Press (Machine)", "Low Cable Fly Crossovers",
    "Push Up", "Supino Neutro Halter"
  ],
  "costas": [
    "Bent Over Row (Barbell)", "Bent Over Row (Dumbbell)", "Dumbbell Row",
    "Face Pull", "Lat Pulldown (Cable)", "Lat Pulldown (Machine)",
    "Lat Pulldown - Close Grip (Cable)", "Pull Up (Assisted)",
    "Remada Articulada \\ /", "Reverse Grip Lat Pulldown (Cable)",
    "Seated Cable Row - Bar Grip", "Seated Cable Row - Bar Wide Grip",
    "Shrug (Barbell)", "Shrug (Dumbbell)", "Single Arm Cable Row",
    "Single Arm Lat Pulldown", "Straight Arm Lat Pulldown (Cable)"
  ],
  "ombros": [
    "Arnold Press (Dumbbell)", "Front Raise (Dumbbell)", "Lateral Raise (Cable)",
    "Lateral Raise (Dumbbell)", "Overhead Press (Dumbbell)", "Plate Front Raise",
    "Rear Delt Reverse Fly (Dumbbell)", "Rear Delt Reverse Fly (Machine)",
    "Standing Military Press (Barbell)", "Upright Row (Barbell)",
    "Upright Row (Cable)", "Upright Row (Dumbbell)"
  ],
  "bíceps": [
    "21s Bicep Curl", "Behind the Back Bicep Wrist Curl (Barbell)",
    "Behind the Back Curl (Cable)", "Bicep Curl (Barbell)", "Bicep Curl (Cable)",
    "Bicep Curl (Dumbbell)", "Concentration Curl", "Cross Body Hammer Curl",
    "EZ Bar Biceps Curl", "Hammer Curl (Dumbbell)", "Preacher Curl (Barbell)",
    "Preacher Curl (Dumbbell)", "Preacher Curl (Machine)", "Reverse Curl (Barbell)",
    "Reverse Curl (Cable)", "Reverse Curl (Dumbbell)", "Seated Incline Curl (Dumbbell)",
    "Waiter Curl (Dumbbell)"
  ],
  "tríceps": [
    "Bench Dip", "Overhead Triceps Extension (Cable)", "Seated Dip Machine",
    "Single Arm Tricep Extension (Dumbbell)", "Skullcrusher (Dumbbell)",
    "Triceps Extension (Cable)", "Triceps Extension (Dumbbell)",
    "Triceps Pushdown", "Triceps Rope Pushdown", "Tríceps Band"
  ],
  "glúteos": [
    "Glute Bridge", "Glute Kickback (Machine)", "Glute Kickback on Floor",
    "Gluteo 4 Apoio", "Hip Thrust (Barbell)", "Hip Thrust (Machine)",
    "Hip Abduction (Machine)", "Hip Adduction (Machine)",
    "Single Leg Glute Bridge", "Single Leg Hip Thrust (Dumbbell)", "gluteo polia"
  ],
  "quadríceps": [
    "Agachamento De Gazebo", "Bulgarian Split Squat", "Dumbbell Step Up",
    "Goblet Squat", "Hack Squat (Machine)", "Leg Extension (Machine)",
    "Leg Press (Machine)", "Leg Press Horizontal (Machine)", "Lunge (Dumbbell)",
    "Sissy Squat (Weighted)", "Split Squat (Dumbbell)", "Squat (Barbell)",
    "Squat (Dumbbell)", "Squat (Smith Machine)", "Sumo Squat (Dumbbell)",
    "Walking Lunge (Dumbbell)"
  ],
  "posterior": [
    "Deadlift (Barbell)", "Deadlift (Trap bar)", "Good Morning (Barbell)",
    "Lying Leg Curl (Machine)", "Romanian Deadlift (Barbell)",
    "Romanian Deadlift (Dumbbell)", "Seated Leg Curl (Machine)",
    "Straight Leg Deadlift", "Sumo Deadlift"
  ],
  "panturrilhas": [
    "Calf Extension (Machine)", "Calf Press (Machine)",
    "Seated Calf Raise", "Single Leg Standing Calf Raise (Barbell)"
  ]
}

function detectarGrupoExercicio(nomeExercicio) {
  const nome = (nomeExercicio || "").trim()
  for (const [grupo, exercicios] of Object.entries(MAPEAMENTO_EXERCICIOS)) {
    if (exercicios.some(e => e.toLowerCase() === nome.toLowerCase())) {
      return grupo
    }
  }
  return null
}


// === SALVAR TREINO ===
function salvarTreino(treino) {
  const historico = carregarHistorico()
  const id = `treino_${Date.now()}`
  const treinoComId = { ...treino, id, savedAt: new Date().toISOString() }
  historico.push(treinoComId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historico))
  return treinoComId
}


// === CARREGAR HISTÓRICO ===
function carregarHistorico() {
  const dados = localStorage.getItem(STORAGE_KEY)
  return dados ? JSON.parse(dados) : []
}


// === DELETAR TREINO ===
function deletarTreino(id) {
  const historico = carregarHistorico().filter(t => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historico))
}


// === EXPORTAR JSON ===
function exportarHistorico() {
  const historico = carregarHistorico()
  if (historico.length === 0) { alert("Nenhum treino salvo ainda!"); return }

  const blob = new Blob([JSON.stringify(historico, null, 2)], { type: "application/json" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = `gymdrama_historico_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.json`
  a.click()
  URL.revokeObjectURL(url)
}


// === EXPORTAR CSV ===
function exportarHistoricoCSV() {
  const historico = carregarHistorico()
  if (historico.length === 0) { alert("Nenhum treino salvo ainda!"); return }

  const linhas = [
    ["data","nome_treino","duracao_min","exercicio","grupo","series","reps","carga_kg","carga_max_kg","volume_total_kg","fonte"].join(",")
  ]

  historico.forEach(t => {
    t.exercicios.forEach(ex => {
      linhas.push([
        `"${t.data || ""}"`,
        `"${t.nome || ""}"`,
        t.duracao || 0,
        `"${ex.nome || ""}"`,
        `"${ex.grupo || ""}"`,
        ex.series || 0,
        ex.reps || 0,
        ex.carga || 0,
        ex.cargaMax || 0,
        ex.volumeTotal || 0,
        `"${t.fonte || "manual"}"`
      ].join(","))
    })
  })

  const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = `gymdrama_historico_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}


// === IMPORTAR JSON ===
function importarHistoricoJSON(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result)
        if (!Array.isArray(dados)) { reject("Arquivo inválido."); return }
        const historicoAtual = carregarHistorico()
        const idsExistentes  = new Set(historicoAtual.map(t => t.id))
        const novos  = dados.filter(t => !idsExistentes.has(t.id))
        const merged = [...historicoAtual, ...novos]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        resolve({ total: merged.length, novos: novos.length })
      } catch { reject("Arquivo JSON inválido.") }
    }
    reader.onerror = () => reject("Erro ao ler o arquivo.")
    reader.readAsText(arquivo)
  })
}


// === PROCESSAR CSV ===
function processarCSV(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const linhas   = e.target.result.split("\n").filter(l => l.trim())
        const cabecalho = parsearLinha(linhas[0])

        const idx = {
          title:      cabecalho.indexOf("title"),
          start_time: cabecalho.indexOf("start_time"),
          end_time:   cabecalho.indexOf("end_time"),
          exercise:   cabecalho.indexOf("exercise_title"),
          set_type:   cabecalho.indexOf("set_type"),
          weight:     cabecalho.indexOf("weight_kg"),
          reps:       cabecalho.indexOf("reps"),
        }

        const mapa = {}

        for (let i = 1; i < linhas.length; i++) {
          const cols      = parsearLinha(linhas[i])
          if (cols.length < 5) continue

          const titulo    = limpar(cols[idx.title])
          const inicio    = limpar(cols[idx.start_time])
          const fim       = limpar(cols[idx.end_time])
          const exercicio = limpar(cols[idx.exercise])
          const setType   = limpar(cols[idx.set_type])
          const peso      = parseFloat(limpar(cols[idx.weight])) || 0
          const reps      = parseInt(limpar(cols[idx.reps])) || 0

          if (!titulo || !exercicio) continue
          if (setType === "warmup") continue

          const chave = `${titulo}__${inicio}`

          if (!mapa[chave]) {
            mapa[chave] = {
              id:       `treino_${chave.replace(/\W/g, "_")}`,
              nome:     titulo,
              data:     formatarData(inicio),
              dataISO:  converterDataISO(inicio),
              duracao:  calcularDuracao(inicio, fim),
              exercicios: {},
              fonte:    "csv",
              savedAt:  new Date().toISOString()
            }
          }

          if (!mapa[chave].exercicios[exercicio]) {
            mapa[chave].exercicios[exercicio] = {
              nome:   exercicio,
              grupo:  detectarGrupoExercicio(exercicio),
              series: []
            }
          }

          mapa[chave].exercicios[exercicio].series.push({ peso, reps })
        }

        const treinos = Object.values(mapa).map(t => {
          const exerciciosArray = Object.values(t.exercicios).map(ex => {
            const series     = ex.series.length
            const repsMedia  = series > 0 ? Math.round(ex.series.reduce((a, s) => a + s.reps, 0) / series) : 0
            const cargaMax   = Math.max(...ex.series.map(s => s.peso))
            const cargaMedia = series > 0 ? Math.round(ex.series.reduce((a, s) => a + s.peso, 0) / series) : 0
            const volume     = ex.series.reduce((a, s) => a + s.peso * s.reps, 0)

            return {
              nome:        ex.nome,
              grupo:       ex.grupo,
              series,
              reps:        repsMedia,
              carga:       cargaMedia,
              cargaMax,
              volumeTotal: volume
            }
          })

          const pesoTotal = exerciciosArray.reduce((a, ex) => a + ex.volumeTotal, 0)

          return { ...t, exercicios: exerciciosArray, pesoTotalLevantado: Math.round(pesoTotal) }
        })

        const historicoAtual = carregarHistorico()
        const idsExistentes  = new Set(historicoAtual.map(t => t.id))
        const novos          = treinos.filter(t => !idsExistentes.has(t.id))
        const merged         = [...historicoAtual, ...novos]

        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        resolve({ total: merged.length, novos: novos.length, treinos: novos })

      } catch (err) {
        reject("Erro ao processar o arquivo: " + err)
      }
    }

    reader.onerror = () => reject("Erro ao ler o arquivo.")
    reader.readAsText(arquivo)
  })
}


// === UTILITÁRIOS ===
function parsearLinha(linha) {
  const resultado = []
  let atual = ""
  let dentroDeAspas = false

  for (let i = 0; i < linha.length; i++) {
    const char = linha[i]
    if (char === '"') {
      dentroDeAspas = !dentroDeAspas
    } else if (char === "," && !dentroDeAspas) {
      resultado.push(atual.trim())
      atual = ""
    } else {
      atual += char
    }
  }

  resultado.push(atual.trim())
  return resultado
}

function limpar(str) {
  return (str || "").replace(/^"|"$/g, "").trim()
}

function formatarData(str) {
  if (!str) return ""
  const partes = str.split(",")[0].trim().split(" ")
  if (partes.length < 3) return str
  return `${partes[0]}/${mesToNumero(partes[1])}/${partes[2]}`
}

function converterDataISO(str) {
  if (!str) return ""
  try {
    const semHora = str.split(",")[0].trim()
    const partes  = semHora.split(" ")
    const dia     = partes[0].padStart(2, "0")
    const mes     = mesToNumero(partes[1]).padStart(2, "0")
    const ano     = partes[2]
    return `${ano}-${mes}-${dia}`
  } catch { return "" }
}

function mesToNumero(mes) {
  const meses = {
    jan:"1", feb:"2", mar:"3", apr:"4", may:"5", jun:"6",
    jul:"7", aug:"8", sep:"9", oct:"10", nov:"11", dec:"12"
  }
  return meses[(mes || "").toLowerCase().slice(0, 3)] || "1"
}

function calcularDuracao(inicio, fim) {
  try {
    const parseDate = str => {
      const [datePart, timePart] = str.split(", ")
      const [day, month, year]   = datePart.trim().split(" ")
      const [h, m]               = (timePart || "00:00").trim().split(":")
      return new Date(`${year}-${mesToNumero(month).padStart(2,"0")}-${day.padStart(2,"0")}T${h.padStart(2,"0")}:${m.padStart(2,"0")}`)
    }
    const diff = (parseDate(fim) - parseDate(inicio)) / 60000
    return Math.round(diff)
  } catch { return 0 }
}
