let myChart
let isChartUpdating = true
$(document).ready(function () {
  const ctx = document.getElementById('chart')
  const labels = []
  const data = {
    labels: labels,
    datasets: [
      {
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  // let isChartUpdating = true // Variable to track chart update state
  let web_socket_data = null // Variable to store WebSocket data

  const config = {
    type: 'line',
    data: data,
    options: {
      plugins: {
        streaming: {
          duration: 20000,
          frameRate: 30,
          pause: false, // Initially, the chart is not paused
        },
      },
      scales: {
        x: {
          type: 'realtime',
          realtime: {
            onRefresh: function (chart) {
              const now = Date.now()
              if (web_socket_data) {
                const dataValue = web_socket_data.value
                labels.push(now)
                chart.data.datasets[0].data.push({
                  x: now,
                  y: dataValue,
                })
                chart.update()
              }
            },
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  }

  const socket = io.connect()
  socket.on('updateSensorData', function (data) {
    console.log('Received data:', data)
    web_socket_data = data
  })
  function pauseChart() {
    if (myChart.options.plugins.streaming.pause === false) {
      myChart.options.plugins.streaming.pause = true
    } else {
      myChart.options.plugins.streaming.pause = false
    }
    chart.update()
  }
  $('#pauseButton').on('click', function () {
    pauseChart()
  })
  const myChart = new Chart(ctx, config)
})
