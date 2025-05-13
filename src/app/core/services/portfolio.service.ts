import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, delay, catchError } from 'rxjs/operators';
import { Investment, PortfolioSummary, ChartData } from '../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private investmentsSubject = new BehaviorSubject<Investment[]>([]);
  public investments$: Observable<Investment[]> = this.investmentsSubject.asObservable();

  private initialMockInvestments: Investment[] = [
    { id: 1, assetName: 'Apple Inc. (AAPL)', assetType: 'Stock', quantity: 10, purchasePrice: 150, purchaseDate: '2023-01-15', currentPrice: 175 },
    { id: 2, assetName: 'Vanguard S&P 500 ETF (VOO)', assetType: 'ETF', quantity: 5, purchasePrice: 400, purchaseDate: '2022-11-20', currentPrice: 420 },
    { id: 3, assetName: 'Bitcoin (BTC)', assetType: 'Crypto', quantity: 0.1, purchasePrice: 30000, purchaseDate: '2023-05-01', currentPrice: 40000 },
    { id: 4, assetName: 'US Treasury Bond', assetType: 'Bond', quantity: 2, purchasePrice: 980, purchaseDate: '2023-03-10', currentPrice: 995 },
  ];

  private readonly LOCAL_STORAGE_KEY = 'portfolioInvestments';

  constructor() {
    this.loadInitialInvestments();
  }

  private loadInitialInvestments(): void {
    const storedInvestmentsJson = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (storedInvestmentsJson) {
      try {
        const storedInvestments = JSON.parse(storedInvestmentsJson);
        this.investmentsSubject.next(storedInvestments);
      } catch (e) {
        console.error("Error parsing investments from localStorage", e);
        this.investmentsSubject.next([...this.initialMockInvestments]); 
        this.saveInvestmentsToLocalStorage();
      }
    } else {
      this.investmentsSubject.next([...this.initialMockInvestments]); // Use a copy of mock data
      this.saveInvestmentsToLocalStorage();
    }
  }

  private saveInvestmentsToLocalStorage(): void {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.investmentsSubject.value));
  }

  private getNextId(): number {
    const currentInvestments = this.investmentsSubject.value;
    return currentInvestments.length > 0 ? Math.max(...currentInvestments.map(i => i.id)) + 1 : 1;
  }

  // --- CRUD Operations ---

  /**
   * Retrieves all investments.
   * Simulates an API call with a delay.
   */
  getInvestments(): Observable<Investment[]> {
    return of(this.investmentsSubject.value).pipe(delay(300));
  }

  /**
   * Retrieves a single investment by its ID.
   * Simulates an API call.
   */
  getInvestmentById(id: number): Observable<Investment | undefined> {
    const investment = this.investmentsSubject.value.find(inv => inv.id === id);
    return of(investment).pipe(delay(100));
  }

  /**
   * Adds a new investment.
   * Simulates an API POST request.
   * @param investmentData Data for the new investment (without ID).
   */
  addInvestment(investmentData: Omit<Investment, 'id'>): Observable<Investment> {
    const newInvestment: Investment = {
      ...investmentData,
      id: this.getNextId(),
      currentPrice: investmentData.currentPrice ?? investmentData.purchasePrice
    };

    // Optimistically update the local state
    const currentInvestments = this.investmentsSubject.value;
    this.investmentsSubject.next([...currentInvestments, newInvestment]);
    this.saveInvestmentsToLocalStorage();

    // Simulate API call
    return of(newInvestment).pipe(
      delay(500), 
      catchError(err => {
        this.investmentsSubject.next(currentInvestments);
        this.saveInvestmentsToLocalStorage(); 
        return throwError(() => err); 
      })
    );
  }

  /**
   * Updates an existing investment.
   * Simulates an API PUT request.
   * @param updatedInvestment The investment with updated details.
   */
  updateInvestment(updatedInvestment: Investment): Observable<Investment> {
    const currentInvestments = this.investmentsSubject.value;
    const index = currentInvestments.findIndex(inv => inv.id === updatedInvestment.id);

    if (index === -1) {
      return throwError(() => new Error('Investment not found'));
    }

    const investmentToUpdate = {
        ...updatedInvestment,
        currentPrice: updatedInvestment.currentPrice ?? updatedInvestment.purchasePrice
    };

    const investmentsCopy = [...currentInvestments];
    investmentsCopy[index] = investmentToUpdate;

    this.investmentsSubject.next(investmentsCopy);
    this.saveInvestmentsToLocalStorage();

    // Simulate API call
    return of(investmentToUpdate).pipe(
      delay(500),
      catchError(err => {
        this.investmentsSubject.next(currentInvestments); // Revert on error
        this.saveInvestmentsToLocalStorage();
        return throwError(() => err);
      })
    );
  }

  /**
   * Deletes an investment by its ID.
   * Simulates an API DELETE request.
   */
  deleteInvestment(id: number): Observable<void> {
    const currentInvestments = this.investmentsSubject.value;
    const filteredInvestments = currentInvestments.filter(inv => inv.id !== id);

    if (currentInvestments.length === filteredInvestments.length) {
        return throwError(() => new Error('Investment not found for deletion'));
    }

    this.investmentsSubject.next(filteredInvestments);
    this.saveInvestmentsToLocalStorage();

    // Simulate API call
    return of(undefined).pipe( 
      delay(500),
      catchError(err => {
        this.investmentsSubject.next(currentInvestments); 
        this.saveInvestmentsToLocalStorage();
        return throwError(() => err);
      })
    );
  }

  // --- Dashboard Data Calculation Methods ---

  /**
   * Calculates and returns portfolio summary metrics.
   */
  getPortfolioSummary(): Observable<PortfolioSummary> {
    return this.investments$.pipe( 
      map(investments => {
        let totalValue = 0;
        let totalCost = 0;
        investments.forEach(inv => {
          const currentVal = (inv.currentPrice ?? inv.purchasePrice) * inv.quantity;
          totalValue += currentVal;
          totalCost += inv.purchasePrice * inv.quantity;
        });
        const totalGainLoss = totalValue - totalCost;
        return {
          totalPortfolioValue: totalValue,
          totalGainLoss: totalGainLoss,
          numberOfAssets: investments.length,
        };
      }),
      delay(100) 
    );
  }

  /**
   * Generates data for the asset allocation pie chart.
   */
  getAssetAllocationChartData(): Observable<ChartData> {
    return this.investments$.pipe(
      map(investments => {
        const allocation: { [key: string]: number } = {}; 
        investments.forEach(inv => {
          const value = (inv.currentPrice ?? inv.purchasePrice) * inv.quantity;
          allocation[inv.assetType] = (allocation[inv.assetType] || 0) + value;
        });
        return {
          labels: Object.keys(allocation),
          datasets: [{
            data: Object.values(allocation),
            label: 'Asset Allocation',
            backgroundColor: [
              'rgba(0, 123, 255, 0.7)', // Primary
              'rgba(40, 167, 69, 0.7)',  // Success
              'rgba(255, 193, 7, 0.7)',  // Warning
              'rgba(220, 53, 69, 0.7)',  // Danger
              'rgba(23, 162, 184, 0.7)', // Info
              'rgba(108, 117, 125, 0.7)' // Secondary
            ],
            borderColor: '#fff' 
          }]
        };
      }),
      delay(100)
    );
  }

  /**
   * Generates mock data for the portfolio performance line chart.
   * In a real app, this would come from historical data via an API.
   */
  getPortfolioPerformanceChartData(): Observable<ChartData> {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastValue = this.investmentsSubject.value.reduce((sum, inv) => sum + inv.purchasePrice * inv.quantity, 0) * 0.9; // Start a bit lower
    if (lastValue === 0 && this.investmentsSubject.value.length > 0) lastValue = 50000; // Default if no purchase price data
    else if (lastValue === 0) lastValue = 10000;


    const dataPoints = labels.map(() => {
      lastValue *= (1 + (Math.random() - 0.45) * 0.05); 
      return parseFloat(lastValue.toFixed(2));
    });

    return of({
      labels: labels,
      datasets: [{
        data: dataPoints,
        label: 'Portfolio Value Over Time',
        tension: 0.1, 
        fill: true, 
        borderColor: 'rgba(0, 123, 255, 1)',        
        backgroundColor: 'rgba(0, 123, 255, 0.2)', 
      }]
    }).pipe(delay(200));
  }

  /**
   * Provides mock market trend data.
   */
  getMarketTrends(): Observable<any[]> { 
    return of([
      { name: 'S&P 500', change: '+0.75%', value: '4,532.10', trend: 'up' },
      { name: 'NASDAQ Composite', change: '-0.15%', value: '15,005.50', trend: 'down' },
      { name: 'Dow Jones Industrial Average', change: '+0.50%', value: '35,012.80', trend: 'up' },
      { name: 'Gold (XAU/USD)', change: '+0.20%', value: '$1,805.30/oz', trend: 'up' },
    ]).pipe(delay(150));
  }
}
