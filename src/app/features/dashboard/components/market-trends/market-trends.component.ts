// src/app/features/dashboard/components/market-trends/market-trends.component.ts
import { Component, Input } from '@angular/core';

// Define an interface for a trend item for better type safety
export interface MarketTrend {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral'; // 'neutral' can be for no change
}

@Component({
  selector: 'app-market-trends',
  templateUrl: './market-trends.component.html',
  styleUrls: ['./market-trends.component.scss']
})
export class MarketTrendsComponent {
  @Input() trends: MarketTrend[] | null = null;
  @Input() isLoading: boolean = true;

  constructor() { }
}
