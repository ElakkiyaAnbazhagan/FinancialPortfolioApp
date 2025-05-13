import { Component, Input } from '@angular/core';
import { PortfolioSummary } from '../../../../core/models/investment.model';

@Component({
  selector: 'app-portfolio-summary',
  // standalone: true,
  // imports: [],
  templateUrl: './portfolio-summary.component.html',
  styleUrl: './portfolio-summary.component.css'
})
export class PortfolioSummaryComponent {
  @Input() summary: PortfolioSummary | null = null;
  @Input() isLoading: boolean = true;
}
