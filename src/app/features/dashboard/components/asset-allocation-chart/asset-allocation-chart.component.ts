import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData as NgChartJSType, ChartType } from 'chart.js'; 
import { BaseChartDirective } from 'ng2-charts';
import { ChartData as AppChartData } from '../../../../core/models/investment.model'; 

@Component({
  selector: 'app-asset-allocation-chart',
  templateUrl: './asset-allocation-chart.component.html',
  styleUrls: ['./asset-allocation-chart.component.scss']
})
export class AssetAllocationChartComponent implements OnChanges {
  @Input() chartData: AppChartData | null = null; 
  @Input() isLoading: boolean = true;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        display: true,
        position: 'top', 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              const total = context.dataset.data
                .filter((value): value is number => typeof value === 'number')
                .reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? (context.parsed / total * 100).toFixed(1) : 0;
              label += '$' + context.parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` (${percentage}%)`;
            }
            return label;
          }
        }
      }
    }
  };
  public pieChartData: NgChartJSType<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Asset Allocation',
    }]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData && this.chartData.datasets.length > 0) {
      this.pieChartData = {
        labels: this.chartData.labels,
        datasets: this.chartData.datasets.map(ds => ({
          data: ds.data,
          label: ds.label,
          backgroundColor: ds.backgroundColor, 
          borderColor: ds.borderColor,
        }))
      };
      this.chart?.update(); 
    } else if (changes['chartData'] && (!this.chartData || this.chartData.datasets.length === 0)) {
      this.pieChartData = { labels: [], datasets: [{ data: [], label: 'Asset Allocation' }] };
      this.chart?.update();
    }
  }
}
