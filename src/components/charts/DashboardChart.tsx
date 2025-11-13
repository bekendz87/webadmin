'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const chartDataMock = {
  series: [
    {
      name: 'Doanh thu',
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 67, 65, 68],
    },
    {
      name: 'Đơn hàng',
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 86, 115, 108],
    },
  ],
  categories: [
    'Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
    'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'
  ],
};

interface ChartData {
  series: Array<{
    name: string;
    data: number[];
  }>;
  categories: string[];
}

export function DashboardChart(chartData: ChartData) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Vietnamese currency formatter
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value * 1000);
  };

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false,
      },
      background: 'transparent',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Satoshi', 'Inter', system-ui, sans-serif",
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
    },
    colors: ['var(--accent)', 'var(--accent-secondary)'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round',
    },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 1,
        opacityFrom: isDark ? 0.4 : 0.6,
        opacityTo: 0.05,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: 'var(--accent)',
            opacity: isDark ? 0.4 : 0.6
          },
          {
            offset: 90,
            color: 'var(--accent)',
            opacity: 0.1
          },
          {
            offset: 100,
            color: 'var(--accent)',
            opacity: 0.05
          }
        ]
      },
    },
    grid: {
      show: true,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 0,
      },
    },
    xaxis: {
      categories: chartData.categories || chartDataMock.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: 'var(--primary-text-secondary)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
        offsetY: 8,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: 'var(--primary-text-secondary)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
        formatter: (value: number) => formatVND(value),
        offsetX: -15,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      offsetY: -15,
      offsetX: -10,
      labels: {
        colors: 'var(--primary-text)',
        useSeriesColors: false,
      },
      fontSize: '14px',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      fontWeight: 600,
      markers: {
        width: 10,
        height: 10,
        radius: 6,
        offsetX: -3,
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const category = w.globals.categoryLabels[dataPointIndex];
        const seriesName = w.globals.seriesNames[seriesIndex];
        
        const bgColor = isDark 
          ? 'var(--card-bg)' 
          : 'rgba(255, 255, 255, 0.95)';
        
        return `
          <div style="
            padding: 16px 20px;
            margin: 0;
            border-radius: 16px;
            background: ${bgColor};
            backdrop-filter: var(--backdrop-blur);
            -webkit-backdrop-filter: var(--backdrop-blur);
            border: 1px solid var(--card-border);
            box-shadow: var(--glass-shadow);
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            min-width: 200px;
          ">
            <div style="
              font-weight: 700;
              color: var(--primary-text);
              margin-bottom: 8px;
              font-size: 15px;
              letter-spacing: -0.01em;
            ">
              ${category}
            </div>
            <div style="
              color: var(--primary-text-secondary);
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="
                color: ${w.globals.colors[seriesIndex]};
                font-weight: 700;
                font-size: 16px;
                line-height: 1;
              ">●</span>
              <span>
                <strong style="color: var(--primary-text);">${seriesName}:</strong> 
                ${seriesIndex === 0 ? formatVND(value) : value + ' đơn hàng'}
              </span>
            </div>
          </div>
        `;
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 320,
          },
          legend: {
            position: 'bottom',
            offsetY: 15,
            horizontalAlign: 'center',
          },
          grid: {
            padding: {
              right: 10,
            },
          },
        },
      },
    ],
  };

  if (!mounted) {
    return (
      <div className="liquid-glass-card animate-gentle-pulse">
        <div className="flex h-[380px] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-green-400 to-green-600 animate-pulse" />
            <p style={{ color: 'var(--primary-text-secondary)' }} className="font-medium">
              Đang tải biểu đồ...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-glass-card animate-slide-in-up overflow-hidden">
      <div className="flex items-center justify-between mb-8 px-2 pt-2">
        <div>
          <h3 className="text-xl font-bold mb-2" style={{ 
            color: 'var(--primary-text)',
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            letterSpacing: '-0.02em'
          }}>
            Thống kê tổng quan
          </h3>
          <p style={{ 
            color: 'var(--primary-text-secondary)',
            fontSize: '15px',
            fontWeight: 500
          }}>
            Doanh thu và đơn hàng theo tháng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            <div className="w-3 h-3 rounded-full bg-current" />
            Doanh thu
          </div>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent-secondary)' }}>
            <div className="w-3 h-3 rounded-full bg-current" />
            Đơn hàng
          </div>
        </div>
      </div>
      
      <div className="relative h-[350px] w-full -mx-2">
        <ReactApexChart
          options={options}
          series={chartData.series || chartDataMock.series}
          type="area"
          height="100%"
          width="100%"
        />
      </div>

      <style jsx global>{`
        .apexcharts-canvas {
          background: transparent !important;
        }
        .apexcharts-tooltip {
          backdrop-filter: var(--backdrop-blur) !important;
          -webkit-backdrop-filter: var(--backdrop-blur) !important;
          border-radius: 16px !important;
          box-shadow: var(--glass-shadow) !important;
          border: none !important;
        }
        .apexcharts-legend {
          padding: 0 !important;
          margin: 0 !important;
        }
        .apexcharts-legend-series {
          margin: 0 12px !important;
        }
        .apexcharts-svg {
          border-radius: 12px;
        }
        .apexcharts-grid line {
          stroke: var(--primary-border) !important;
        }
        .apexcharts-xaxis-label, .apexcharts-yaxis-label {
          fill: var(--primary-text-secondary) !important;
        }
      `}</style>
    </div>
  );
}