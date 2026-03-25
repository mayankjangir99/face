import { Line } from 'react-chartjs-2';
import { formatShortDate } from '../../utils/formatters.js';

const AttendanceTrendChart = ({ dataPoints }) => {
  const data = {
    labels: dataPoints.map((point) => formatShortDate(point.dateKey)),
    datasets: [
      {
        label: 'Attendance count',
        data: dataPoints.map((point) => point.count),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.18)',
        fill: true,
        tension: 0.35
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
        <h3 className="section-title">Weekly Trend</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Attendance captured over the last seven days.</p>
      </div>

      <div className="h-72">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default AttendanceTrendChart;
