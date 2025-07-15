import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

interface Jar {
  name: string
  balance: number
}

export default function JarChart({ jars }: { jars: Jar[] }) {
  const data = {
    labels: jars.map(j => j.name),
    datasets: [
      {
        data: jars.map(j => j.balance),
        backgroundColor: [
          '#f87171',
          '#60a5fa',
          '#34d399',
          '#fbbf24',
          '#a78bfa',
          '#fb7185',
        ],
      },
    ],
  }

  return <Pie data={data} />
}