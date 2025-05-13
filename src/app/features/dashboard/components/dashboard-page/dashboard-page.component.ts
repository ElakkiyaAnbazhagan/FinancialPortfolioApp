import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs'; 
import { catchError } from 'rxjs/operators';

import { PortfolioService } from '../../../../core/services/portfolio.service';
import { PortfolioSummary, ChartData } from '../../../../core/models/investment.model';
import { MarketTrend } from '../market-trends/market-trends.component'; 

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  portfolioSummary$: Observable<PortfolioSummary | null> | undefined;
  assetAllocationData$: Observable<ChartData | null> | undefined;
  portfolioPerformanceData$: Observable<ChartData | null> | undefined;
  marketTrends$: Observable<MarketTrend[] | null> | undefined; 

  // Loading flags for each section
  isLoadingSummary = true;
  isLoadingAllocation = true;
  isLoadingPerformance = true;
  isLoadingTrends = true;

  constructor(private portfolioService: PortfolioService) { }

  ngOnInit(): void {
    // Fetch portfolio summary
    this.portfolioSummary$ = this.portfolioService.getPortfolioSummary().pipe(
      catchError(err => {
        console.error('Error loading portfolio summary:', err);
        this.isLoadingSummary = false;
        return of(null); 
      })
    );
    this.portfolioSummary$.subscribe(() => this.isLoadingSummary = false);

    // Fetch asset allocation data
    this.assetAllocationData$ = this.portfolioService.getAssetAllocationChartData().pipe(
      catchError(err => {
        console.error('Error loading asset allocation data:', err);
        this.isLoadingAllocation = false;
        return of(null);
      })
    );
    this.assetAllocationData$.subscribe(() => this.isLoadingAllocation = false);

    // Fetch portfolio performance data
    this.portfolioPerformanceData$ = this.portfolioService.getPortfolioPerformanceChartData().pipe(
      catchError(err => {
        console.error('Error loading portfolio performance data:', err);
        this.isLoadingPerformance = false;
        return of(null);
      })
    );
    this.portfolioPerformanceData$.subscribe(() => this.isLoadingPerformance = false);

    // Fetch market trends
    this.marketTrends$ = this.portfolioService.getMarketTrends().pipe(
      catchError(err => {
        console.error('Error loading market trends:', err);
        this.isLoadingTrends = false;
        return of(null); 
      })
    );
    this.marketTrends$.subscribe(() => this.isLoadingTrends = false);
  }
}
