import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PortfolioService } from '../../../../core/services/portfolio.service';
import { Investment } from '../../../../core/models/investment.model';

@Component({
  selector: 'app-investment-list',
  templateUrl: './investment-list.component.html',
  styleUrls: ['./investment-list.component.scss']
})
export class InvestmentListComponent implements OnInit {
  investments$!: Observable<Investment[] | null>;
  isLoading = true;
  errorLoading = false;

  constructor(
    private portfolioService: PortfolioService,
    private router: Router 
  ) { }

  ngOnInit(): void {
    this.loadInvestments();
  }

  loadInvestments(): void {
    this.isLoading = true;
    this.errorLoading = false;
    this.investments$ = this.portfolioService.investments$.pipe( // Directly use the BehaviorSubject stream
      catchError(err => {
        console.error('Error loading investments:', err);
        // this.notificationService.showError('Could not load investments.');
        this.isLoading = false;
        this.errorLoading = true;
        return of(null); // Return null or an empty array on error
      })
    );
    // The BehaviorSubject emits immediately, so loading state might be very short
    // For a more realistic loading from an API, you'd use a separate fetch method.
    // Since investments$ is a BehaviorSubject, it will have an initial value.
    this.investments$.subscribe(data => {
        if(data !== null) { // Check if data is not the error state 'null'
            this.isLoading = false;
        }
        // If data is null due to an error, isLoading might already be false from catchError
    });
  }

  /**
   * Navigates to the InvestmentFormComponent to edit the selected investment.
   * @param investmentId The ID of the investment to edit.
   */
  editInvestment(investmentId: number): void {
    // Navigate to '/investments/edit/:id'
    this.router.navigate(['/investments/edit', investmentId]);
  }

  /**
   * Deletes an investment after confirmation.
   * @param investmentId The ID of the investment to delete.
   */
  deleteInvestment(investmentId: number): void {
    // Simple browser confirmation dialog
    if (confirm('Are you sure you want to delete this investment? This action cannot be undone.')) {
      this.portfolioService.deleteInvestment(investmentId).subscribe({
        next: () => {
          // Notification is handled by the service.
          // The list will update automatically because we are subscribed to investments$
          // No need to call loadInvestments() again if using BehaviorSubject correctly.
        },
        error: (err) => {
          // Error notification is also handled by the service.
          console.error('Error deleting investment from component:', err);
        }
      });
    }
  }

  /**
   * Helper function to calculate the current value of an investment.
   * This could also be a pipe if used in many places.
   * @param investment The investment object.
   * @returns The calculated current value.
   */
  calculateCurrentValue(investment: Investment): number {
    return (investment.currentPrice ?? investment.purchasePrice) * investment.quantity;
  }

  /**
   * Helper function to calculate the gain or loss for an investment.
   * @param investment The investment object.
   * @returns The calculated gain or loss.
   */
  calculateGainLoss(investment: Investment): number {
    const currentValue = this.calculateCurrentValue(investment);
    const costBasis = investment.purchasePrice * investment.quantity;
    return currentValue - costBasis;
  }
}
