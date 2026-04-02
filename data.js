// data.js — dados mockados de exemplo
// Esse arquivo é só um fallback.
// Quando você importar um CSV ou inserir treinos manualmente,
// os dados reais ficam salvos no localStorage do navegador.

const treinoExemplo = {
  nome: "Peito e Braço",
  data: "02/04/2025",
  dataISO: "2025-04-02",
  duracao: 58,
  exercicios: [
    { nome: "Supino Reto",    series: 4, reps: 10, carga: 60, grupo: "peito",   cargaMax: 60, volumeTotal: 2400 },
    { nome: "Rosca Direta",   series: 3, reps: 12, carga: 20, grupo: "bíceps",  cargaMax: 20, volumeTotal: 720  },
    { nome: "Tríceps Corda",  series: 3, reps: 15, carga: 25, grupo: "tríceps", cargaMax: 25, volumeTotal: 1125 },
    { nome: "Crucifixo",      series: 3, reps: 12, carga: 16, grupo: "peito",   cargaMax: 16, volumeTotal: 576  }
  ],
  pesoTotalLevantado: 4821,
  fonte: "exemplo"
}
