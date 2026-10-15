import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export const ResearchCharts: React.FC = () => {
  const lineChartRef = useRef<HTMLDivElement>(null);
  const donutChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lineChart: echarts.ECharts | null = null;
    let donutChart: echarts.ECharts | null = null;

    if (lineChartRef.current) {
      lineChart = echarts.init(lineChartRef.current);
      lineChart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#FBFBF9',
          borderColor: '#E4E8DF',
          textStyle: { color: '#1C241D', fontSize: 11 }
        },
        grid: {
          top: 30,
          right: 20,
          bottom: 25,
          left: 45
        },
        xAxis: {
          type: 'category',
          data: ['2019', '2020', '2021', '2022', '2023', '2024', '2025 (YTD)'],
          axisLine: { lineStyle: { color: '#E4E8DF' } },
          axisLabel: { color: '#849085', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#F0F2EB', type: 'dashed' } },
          axisLabel: { color: '#849085', fontSize: 10 }
        },
        series: [
          {
            name: 'Peer-Reviewed Works',
            type: 'line',
            smooth: true,
            data: [1200, 1850, 2900, 4300, 6800, 9400, 12800],
            itemStyle: { color: '#42643A' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(66, 100, 58, 0.35)' },
                { offset: 1, color: 'rgba(66, 100, 58, 0.02)' }
              ])
            }
          },
          {
            name: 'arXiv Preprints',
            type: 'line',
            smooth: true,
            data: [800, 1300, 2200, 3600, 5900, 8100, 11200],
            itemStyle: { color: '#2E6171' },
            lineStyle: { type: 'dashed', width: 2 }
          }
        ]
      });
    }

    if (donutChartRef.current) {
      donutChart = echarts.init(donutChartRef.current);
      donutChart.setOption({
        tooltip: {
          trigger: 'item',
          backgroundColor: '#FBFBF9',
          borderColor: '#E4E8DF',
          textStyle: { color: '#1C241D', fontSize: 11 }
        },
        legend: {
          bottom: 0,
          left: 'center',
          textStyle: { color: '#586359', fontSize: 10 },
          itemWidth: 10,
          itemHeight: 10
        },
        series: [
          {
            name: 'Research Domain',
            type: 'pie',
            radius: ['45%', '72%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#FFFFFF',
              borderWidth: 2
            },
            label: { show: false },
            data: [
              { value: 38, name: 'Quantum & Physics', itemStyle: { color: '#42643A' } },
              { value: 26, name: 'Bio & Genetics', itemStyle: { color: '#2E6171' } },
              { value: 18, name: 'Materials Science', itemStyle: { color: '#8C5A32' } },
              { value: 12, name: 'AI & Interpretability', itemStyle: { color: '#694D75' } },
              { value: 6, name: 'Neuromorphic', itemStyle: { color: '#5F7335' } }
            ]
          }
        ]
      });
    }

    const handleResize = () => {
      lineChart?.resize();
      donutChart?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      lineChart?.dispose();
      donutChart?.dispose();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Trajectory line chart */}
      <div className="lg:col-span-2 bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#42643A]">
              Publication Velocity & Preprint Surge
            </h3>
            <p className="text-[11px] text-[#849085] mt-0.5">
              Verified citations vs arXiv preprints across investigated scientific domains
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E6EDE4] text-[#42643A] font-semibold">
            +38.4% YoY
          </span>
        </div>
        <div ref={lineChartRef} className="w-full h-60" />
      </div>

      {/* Field distribution donut chart */}
      <div className="bg-[#FBFBF9] border border-[#E4E8DF] rounded-xl p-5 shadow-xs space-y-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#42643A]">
            Indexed Research Disciplines
          </h3>
          <p className="text-[11px] text-[#849085] mt-0.5">
            Cross-repository distribution across OpenAlex, arXiv, & Crossref
          </p>
        </div>
        <div ref={donutChartRef} className="w-full h-60" />
      </div>
    </div>
  );
};
