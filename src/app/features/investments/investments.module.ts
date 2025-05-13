import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';        
import { ReactiveFormsModule } from '@angular/forms'; 
import { InvestmentsRoutingModule } from './investments-routing.module';
import { InvestmentsPageComponent } from './components/investments-page/investments-page.component';
import { InvestmentListComponent } from './components/investment-list/investment-list.component';
import { InvestmentFormComponent } from './components/investment-form/investment-form.component';

@NgModule({
  declarations: [
    InvestmentsPageComponent,
    InvestmentListComponent,
    InvestmentFormComponent
  ],
  imports: [
    CommonModule,               
    ReactiveFormsModule,        
    InvestmentsRoutingModule
  ]
})
export class InvestmentsModule { }
