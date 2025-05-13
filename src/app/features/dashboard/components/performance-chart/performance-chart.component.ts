import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData as NgChartJSType, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData as AppChartData } from '../../../../core/models/investment.model';

@Component({
  selector: 'app-performance-chart',
  templateUrl: './performance-chart.component.html',
  styleUrls: ['./performance-chart.component.scss']
})
export class PerformanceChartComponent implements OnChanges {
  @Input() chartData: AppChartData | null = null;
  @Input() isLoading: boolean = true;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.4 
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: false, 
        ticks: {
          callback: function(value, index, values) {
            if (typeof value === 'number') {
              return '$' + value.toLocaleString();
            }
            return value;
          }
        }
      }
    },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return label;
          }
        }
      }
    }
  };
  public lineChartData: NgChartJSType<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Portfolio Performance',
      // Colors and fill options are typically set in the service when preparing ChartData
    }]
  };
  public lineChartType: ChartType = 'line';

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData && this.chartData.datasets.length > 0) {
      this.lineChartData = {
        labels: this.chartData.labels,
        datasets: this.chartData.datasets.map(ds => ({
          data: ds.data,
          label: ds.label,
          fill: ds.fill,
          borderColor: ds.borderColor,
          backgroundColor: ds.backgroundColor,
          tension: ds.tension
        }))
      };
      this.chart?.update();
    } else if (changes['chartData'] && (!this.chartData || this.chartData.datasets.length === 0)) {
      this.lineChartData = { labels: [], datasets: [{ data: [], label: 'Portfolio Performance' }] };
      this.chart?.update();
    }
  }
}
