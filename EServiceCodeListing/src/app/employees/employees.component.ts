import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { EmployeeService } from '../api/services/emp.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  constructor(
    private appComp: AppComponent,
    private empService: EmployeeService,
    public ngxSmartModalService: NgxSmartModalService
    ) {
  }

  //vars 
  empObj;
  isAdmin;

  //open the add employee modal
  showAddNewEmp(){
    this.ngxSmartModalService.setModalData({}, 'newEmpModal');
    this.ngxSmartModalService.open('newEmpModal');
  }

  //show the edit employee modal
  openEmpEdit(emp){
    this.ngxSmartModalService.setModalData(emp, 'editEmpModal');
    this.ngxSmartModalService.open('editEmpModal');
  }

  //check if user is admin and load employees for display
  async ngOnInit() {
    this.appComp.loading.show()
    this.isAdmin = this.appComp.getAdmin();
    if(this.isAdmin == null){
     setTimeout( () => this.ngOnInit(), 500);
     return;
    }
    this.empObj = await this.empService.GetEmployeesAsync(); //call api to get all employees
    this.appComp.loading.hide()
  }
}
