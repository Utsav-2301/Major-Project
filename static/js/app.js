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
              if (isChartUpdating && !chart.options.plugins.streaming.pause) {
                // Check if the chart should update and if it's not paused
                const now = Date.now()
                if (web_socket_data) {
                  // Use data from the WebSocket if available
                  const dataValue = web_socket_data.value // Replace 'web_socket_data.value' with the actual field name
                  labels.push(now)
                  chart.data.datasets[0].data.push({
                    x: now,
                    y: dataValue,
                  })
                  chart.update()
                }
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

  // Create the WebSocket connection
  const socket = io.connect()

  // Attach the event handler for 'updateSensorData' here
  socket.on('updateSensorData', function (data) {
    console.log('Received data:', data)

    // Store the WebSocket data for later use
    web_socket_data = data

    // Update the chart with data from WebSocket (if the chart isn't paused)
    if (isChartUpdating && !myChart.options.plugins.streaming.pause) {
      const now = Date.now()
      const dataValue = data.value
      labels.push(now)
      myChart.data.datasets[0].data.push({
        x: now,
        y: dataValue,
      })
      myChart.update()
    }
  })

  const myChart = new Chart(ctx, config)
})
function pauseChart(pauseWebSocket) {
  if (myChart) {
    if (myChart.options.plugins.streaming.pause === false) {
      myChart.options.plugins.streaming.pause = true
      if (pauseWebSocket) {
        // Pause WebSocket updates
        isChartUpdating = false
      }
    } else {
      myChart.options.plugins.streaming.pause = false
      if (pauseWebSocket) {
        // Resume WebSocket updates
        isChartUpdating = true
      }
    }
    myChart.update()
  }
}
