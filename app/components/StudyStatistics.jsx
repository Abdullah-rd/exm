'use client'

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function StudyStatistics({ studySessions = [] }) {
  // Guard against undefined/null studySessions
  if (!studySessions || studySessions.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Study Statistics</h2>
          <div className="alert">
            <span>No study sessions recorded yet. Start studying to see your statistics!</span>
          </div>
        </div>
      </div>
    );
  }

  const getModuleStats = () => {
    const stats = studySessions.reduce((acc, session) => {
      if (!acc[session.chapter]) {
        acc[session.chapter] = 0;
      }
      acc[session.chapter] += session.duration;
      return acc;
    }, {});
    return Object.entries(stats).map(([module, duration]) => ({
      module,
      duration: Math.round(duration / 60)
    }));
  };

  const getPeriodStats = () => {
    const stats = studySessions.reduce((acc, session) => {
      const hour = new Date(session.timestamp).getHours();
      let period = 'Morning';
      if (hour >= 12 && hour < 18) {
        period = 'Afternoon';
      } else if (hour >= 18) {
        period = 'Evening';
      }
      if (!acc[period]) {
        acc[period] = 0;
      }
      acc[period] += session.duration;
      return acc;
    }, {});
    return Object.entries(stats).map(([period, duration]) => ({
      period,
      duration: Math.round(duration / 60)
    }));
  };

  const getTotalStudyTime = () => {
    return Math.round(studySessions.reduce((acc, session) => acc + session.duration, 0) / 60);
  };

  const getMostStudiedPeriod = () => {
    const periodStats = getPeriodStats();
    if (periodStats.length === 0) return 'No data';
    return periodStats.reduce((max, period) => 
      period.duration > max.duration ? period : max
    ).period;
  };

  const moduleData = {
    labels: getModuleStats().map(stat => stat.module),
    datasets: [
      {
        label: 'Minutes Studied',
        data: getModuleStats().map(stat => stat.duration),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const periodData = {
    labels: getPeriodStats().map(stat => stat.period),
    datasets: [
      {
        label: 'Minutes Studied',
        data: getPeriodStats().map(stat => stat.duration),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes'
        }
      }
    },
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Study Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Study Time</div>
              <div className="stat-value">{getTotalStudyTime()}</div>
              <div className="stat-desc">minutes</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Peak Study Period</div>
              <div className="stat-value text-2xl">{getMostStudiedPeriod()}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">Time Studied per Module</h3>
            <div className="h-64 w-full">
              <Bar data={moduleData} options={options} />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Time Studied per Period</h3>
            <div className="h-64 w-full">
              <Bar data={periodData} options={options} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}