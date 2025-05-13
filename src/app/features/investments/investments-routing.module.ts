import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InvestmentsPageComponent } from './components/investments-page/investments-page.component';
import { InvestmentFormComponent } from './components/investment-form/investment-form.component';

const routes: Routes = [
  {
    path: '', 
    component: InvestmentsPageComponent 
  },
  {
    path: 'new', 
    component: InvestmentFormComponent
  },
  {
    path: 'edit/:id', 
    component: InvestmentFormComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)], 
  exports: [RouterModule]
})
export class InvestmentsRoutingModule { }
