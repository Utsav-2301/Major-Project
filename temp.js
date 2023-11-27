$(document).ready(function () {
  const ctx = document.getElementById('chart')
  const labels = [] // Define X-axis labels
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
              const timestamp = getFormattedTimestamp(context.parsed.x)
              const value = context.parsed.y
              return `Time: ${timestamp}, Value: ${value.toFixed(2)}`
            },
          },
        },
      },
    },
  }

  let intervalId
  let intervalSize = 1000
  let currentTime = 0
  let currentInterval = 1

  function getFormattedTimestamp(seconds) {
    const datetime = luxon.DateTime.local().plus({ seconds: seconds })
    return datetime.toFormat('d LLL yyyy HH:mm:ss')
  }

  function startUpdatingChart() {
    intervalId = setInterval(() => {
      currentTime += 1
      chart.data.labels.push(currentTime)
      chart.data.datasets[0].data.push({
        x: currentTime,
        y: Math.random(),
      })
      chart.update()
      if (currentTime % 5 === 0) {
        currentInterval += 1
      }
    }, intervalSize)
  }

  const chart = new Chart(ctx, config)
  startUpdatingChart()
})
