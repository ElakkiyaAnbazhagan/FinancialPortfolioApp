import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AssetAllocationChartComponent } from './components/asset-allocation-chart/asset-allocation-chart.component';
import { DashboardPageComponent } from './components/dashboard-page/dashboard-page.component';
import { MarketTrendsComponent } from './components/market-trends/market-trends.component';
import { PerformanceChartComponent } from './components/performance-chart/performance-chart.component';
import { PortfolioSummaryComponent } from './components/portfolio-summary/portfolio-summary.component';
import { BaseChartDirective } from 'ng2-charts';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts'; 

@NgModule({
  declarations: [
    DashboardPageComponent,
    PortfolioSummaryComponent,
    AssetAllocationChartComponent,
    PerformanceChartComponent,
    MarketTrendsComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    CommonModule,             
    DashboardRoutingModule,
    BaseChartDirective          
  ],
  providers: [
    provideCharts(withDefaultRegisterables()) 
  ],
})
export class DashboardModule { }
