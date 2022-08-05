class Stats {
  constructor() {
    fetch("a.csv").then(response => response.text()).then(text => {
      const lines = text.split("\n");
      const data = [];
      for (const line of lines) {
        data.push(line.trim().split(","));
      }
      this.processData(data);
    });
  }

  processData(data) {
    this.perVersione(data.slice(0));
    this.perDocumento(data.slice(0));
    this.perPagine(data.slice(0));
  }

  perVersione(data) {
    this.perVersioneInternal(data, 1, "chart_1_versioni", "chart_2_versioni");
    this.perVersioneInternal(data, 2, "chart_3_versioni", "chart_4_versioni");
  }

  perVersioneInternal(data, id, chart1, chart2) {
    const merge = { "consultazione": ["consultazione", "bozza"],
                    "giugno-2022": ["giugno2022", "giugno-2022"]};

    const versioni = {"consultazione": 0, "giugno-2022":0};
    for (const line of data) {
      if (line.length < 2) continue;
      const path = line[0].split('/');
      for (let a of Object.keys(merge)) {
        for (let b of merge[a]) {
          if (path.includes(b)) {
            versioni[a] += parseInt(line[id], 10);
          }
        }
      }
    }

    const labels = Object.keys(versioni).sort((a, b) => versioni[b] - versioni[a]).map(a => a + " (" + versioni[a] + ")");
    const dataChart = Object.keys(versioni).sort((a, b) => versioni[b] - versioni[a]).map(versione => versioni[versione]);

    this.makeChart(chart1, "Visite per versioni", labels, dataChart);
    this.makePie(chart2, "Visite per versioni", labels, dataChart);
  }

  perDocumento(data) {
    this.perDocumentoInternal(data, 1, "chart_1_documento", "chart_2_documento");
    this.perDocumentoInternal(data, 2, "chart_3_documento", "chart_4_documento");
    this.perDocumentoInternal(data, 2, "chart_5_documento", "chart_6_documento", "consultazione");
  }

  perDocumentoInternal(data, id, chart1, chart2, filter = null) {
    const documenti = {"icdp-pnd-docs": 0, "icdp-pnd-dmp-docs": 0, "icdp-pnd-digitalizzazione-docs": 0, "icdp-pnd-circolazione-riuso-docs": 0, "icdp-pnd-servizi-docs": 0, "icdp-pnd-maturita-docs": 0};
    for (const line of data) {
      if (line.length < 2) continue;
      const path = line[0].split('/');
      for (let a of Object.keys(documenti)) {
        if (filter != null && !path.includes(filter)) continue;
        if (path.includes(a)) {
          documenti[a] += parseInt(line[id], 10);
        }
      }
    }

    const labels = Object.keys(documenti).sort((a, b) => documenti[b] - documenti[a]).map(a => a + " (" + documenti[a] + ")");
    const dataChart = Object.keys(documenti).sort((a, b) => documenti[b] - documenti[a]).map(documento => documenti[documento]);

    this.makeChart(chart1, "Richieste per documento", labels, dataChart);
    this.makePie(chart2, "Richieste per documento", labels, dataChart);
  }

  perPagine(data) {
    this.perPagineInternal(data, "chart_pnd", "pie_pnd", "icdp-pnd-docs");
    this.perPagineInternal(data, "chart_digitalizzazione", "pie_digitalizzazione", "icdp-pnd-digitalizzazione-docs");
    this.perPagineInternal(data, "chart_circolazione", "pie_circolazione", "icdp-pnd-circolazione-riuso-docs");
    this.perPagineInternal(data, "chart_servizi", "pie_servizi", "icdp-pnd-servizi-docs");
    this.perPagineInternal(data, "chart_maturita", "pie_maturita", "icdp-pnd-maturita-docs");
    this.perPagineInternal(data, "chart_dmp", "pie_dmp", "icdp-pnd-dmp-docs");
  }

  perPagineInternal(data, chart1, chart2, str) {
    const documenti = {};
    for (const line of data) {
      if (line.length < 2) continue;
      if (line[0].includes("?")) continue;
      const path = line[0].split('/');
      const i = path.indexOf(str);
      if (i == -1) continue;

      const id = path.slice(i+3).join("/");
      if (!(id in documenti)) documenti[id] = 0;
      documenti[id] += parseInt(line[1], 10);
    }

    const labels = Object.keys(documenti).sort((a, b) => documenti[b] - documenti[a]).map(a => a + " (" + documenti[a] + ")");
    const dataChart = Object.keys(documenti).sort((a, b) => documenti[b] - documenti[a]).map(documento => documenti[documento]);

    this.makeChart(chart1, "Richieste per documento", labels, dataChart);

    this.makePie(chart2, "Richieste pre documento", labels, dataChart);

  }

  makePie(chartElm, label, labels, dataChart) {
    let ctx = document.getElementById(chartElm);
    let chart = new Chart(ctx, {
      type: 'pie',
      plugins: [{
        id: "custom_canvas_background_color",
        beforeDraw: (chart) => {
           const {ctx} = chart;
           ctx.save();
           ctx.globalCompositeOperation = 'destination-over';
           ctx.fillStyle = "white";
           ctx.fillRect(0,0, chart.width, chart.height);
           ctx.restore();
        }
      }],
      data: {
          labels,
          datasets: [{
              label,
              data: dataChart,
              backgroundColor: [
                  'rgb(255, 99, 132)',
                  'rgb(54, 162, 235)',
                  'rgb(255, 206, 86)',
                  'rgb(75, 192, 192)',
                  'rgb(153, 102, 255)',
                  'rgb(255, 159, 64)'
              ],
              borderColor: [
                  'rgb(255, 99, 132)',
                  'rgb(54, 162, 235)',
                  'rgb(255, 206, 86)',
                  'rgb(75, 192, 192)',
                  'rgb(153, 102, 255)',
                  'rgb(255, 159, 64)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  }

  makeChart(chartElm, label, labels, dataChart) {
    let ctx = document.getElementById(chartElm);
    let chart = new Chart(ctx, {
      type: 'bar',
      plugins: [{
        id: "custom_canvas_background_color",
        beforeDraw: (chart) => {
           const {ctx} = chart;
           ctx.save();
           ctx.globalCompositeOperation = 'destination-over';
           ctx.fillStyle = "white";
           ctx.fillRect(0,0, chart.width, chart.height);
           ctx.restore();
        }
      }],
      data: {
          labels,
          datasets: [{
              label,
              data: dataChart,
              backgroundColor: [
                  'rgb(255, 99, 132)',
                  'rgb(54, 162, 235)',
                  'rgb(255, 206, 86)',
                  'rgb(75, 192, 192)',
                  'rgb(153, 102, 255)',
                  'rgb(255, 159, 64)'
              ],
              borderColor: [
                  'rgb(255, 99, 132)',
                  'rgb(54, 162, 235)',
                  'rgb(255, 206, 86)',
                  'rgb(75, 192, 192)',
                  'rgb(153, 102, 255)',
                  'rgb(255, 159, 64)'
              ],
              borderWidth: 1
          }]
      },
      options: {
 legend: {
        display: false
      },
          scales: {
 xAxis: {
          ticks: {
                autoSkip: false,
                maxRotation: 90,
                minRotation: 90
            }
          },
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  }
}

new Stats();
