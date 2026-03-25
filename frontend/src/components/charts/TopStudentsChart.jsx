import { Bar } from 'react-chartjs-2';

const TopStudentsChart = ({ dataPoints }) => {
  const data = {
    labels: dataPoints.map((point) => point.name),
    datasets: [
      {
        label: 'Attendance count',
        data: dataPoints.map((point) => point.count),
        backgroundColor: ['#34d399', '#38bdf8', '#fb923c', '#c084fc', '#f472b6']
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="surface-panel">
      <div className="mb-4">
        <h3 className="section-title">Top Students</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Most frequent attendees based on recorded history.</p>
      </div>

      <div className="h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TopStudentsChart;
