import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 
import { Observable, Subscription, of } from 'rxjs';
import { switchMap, catchError, filter, take } from 'rxjs/operators';

import { PortfolioService } from '../../../../core/services/portfolio.service';
import { Investment } from '../../../../core/models/investment.model';

@Component({
  selector: 'app-investment-form',
  templateUrl: './investment-form.component.html',
  styleUrls: ['./investment-form.component.scss']
})
export class InvestmentFormComponent implements OnInit, OnDestroy {
  investmentForm: FormGroup = this.fb.group({});
  isEditMode = false;
  private investmentId: number | null = null;
  private routeSubscription: Subscription| undefined;
  private formSubmitSubscription: Subscription | undefined;

  isLoading = false; 
  isSubmitting = false; 

  assetTypes: Investment['assetType'][] = ['Stock', 'Bond', 'Crypto', 'ETF', 'MutualFund', 'RealEstate', 'Other'];

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.routeSubscription = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.investmentId = +id; 
          this.isLoading = true;
          return this.portfolioService.getInvestmentById(this.investmentId);
        }
        return of(null);
      }),
      catchError(error => {
        this.isLoading = false;
        this.router.navigate(['/investments']);
        return of(null); 
      })
    ).subscribe(investment => {
      this.isLoading = false;
      if (this.isEditMode && investment) {
        this.investmentForm?.patchValue(investment);
      } else if (this.isEditMode && !investment) {
        this.router.navigate(['/investments']);
      }
    });
  }

  /**
   * Initializes the reactive form with controls and validators.
   */
  private initForm(): void {
    this.investmentForm = this.fb.group({
      assetName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      assetType: ['', Validators.required], 
      quantity: [null, [Validators.required, Validators.min(0.000001)]], 
      purchasePrice: [null, [Validators.required, Validators.min(0.01)]], 
      purchaseDate: ['', [Validators.required]], 
      currentPrice: [null, [Validators.min(0)]]
    });
  }

  // Getter for easy access to form controls in the template
  get f() {
    return this.investmentForm?.controls;
  }

  /**
   * Handles form submission.
   * If valid, it either adds a new investment or updates an existing one.
   */
  onSubmit(): void {
    if (this.investmentForm?.invalid) {
      this.investmentForm?.markAllAsTouched(); 
      return;
    }

    this.isSubmitting = true;
    const formValue = this.investmentForm?.value || {};

    let operation$: Observable<Investment>;

    if (this.isEditMode && this.investmentId !== null) {
      const updatedInvestment: Investment = {
        id: this.investmentId,
        ...formValue
      };
      operation$ = this.portfolioService.updateInvestment(updatedInvestment);
    } else {
      operation$ = this.portfolioService.addInvestment(formValue);
    }

    this.formSubmitSubscription = operation$.pipe(
        take(1)
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/investments']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Form submission error:', err);
      }
    });
  }

  /**
   * Navigates back to the investment list page.
   */
  onCancel(): void {
    this.router.navigate(['/investments']);
  }

  ngOnDestroy(): void {
    // Unsubscribe from observables to prevent memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.formSubmitSubscription) {
      this.formSubmitSubscription.unsubscribe();
    }
  }
}
