$(document).ready(function () {
  const ctx = document.getElementById('chart1')
  const labels = []
  const data = {
    labels: labels,
    datasets: [
      {
        data: [],
        label: 'Measuring Current (with Varying Resistance) with Time',
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }
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
          title: {
            display: true,
            text: 'Time Axis', // Change this text to your desired label
          },
          type: 'realtime',
          realtime: {
            onRefresh: function (chart) {
              // const now = web_socket_data.date
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
          title: {
            display: true,
            text: 'Current Axis', // Change this text to your desired label
          },
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
    myChart.update()
  }
  $('#pauseButton').on('click', function () {
    pauseChart()
  })
  const myChart = new Chart(ctx, config)
})
