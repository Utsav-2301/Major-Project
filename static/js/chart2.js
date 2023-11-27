$(document).ready(function () {
  const ctx = document.getElementById('chart2')
  const labels = []
  const data = {
    labels: labels,
    datasets: [
      {
        data: [],
        fill: false,
        label: 'Measuring Current (with Varying Resistance) with Time',
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  let web_socket_data = null
  const config = {
    type: 'line',
    data: data,
    options: {
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Time (seconds)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Current Axis',
          },
        },
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const dataPoint = context.dataset.data[context.dataIndex]
              const timestamp = dataPoint.x
              const value = dataPoint.y
              return `Time: ${timestamp}, Value: ${value.toFixed(2)}`
            },
          },
        },
      },
      hover: {
        mode: 'nearest',
        intersect: false,
      },
    },
  }

  let intervalId
  let intervalSize = 1000
  let currentTime = 0
  let currentInterval = 1

  function startUpdatingChart() {
    intervalId = setInterval(() => {
      if (web_socket_data) {
        const dataValue = web_socket_data.value
        currentTime += 1
        chart.data.labels.push(currentTime)
        chart.data.datasets[0].data.push({
          x: currentTime,
          y: dataValue,
        })
      }
      chart.update()
      if (currentTime % 5 === 0) {
        currentInterval += 1
      }
    }, intervalSize)
  }

  const socket = io.connect()
  socket.on('updateSensorData', function (data) {
    console.log('Received data:', data)
    web_socket_data = data
  })

  const chart = new Chart(ctx, config)
  startUpdatingChart()
})
