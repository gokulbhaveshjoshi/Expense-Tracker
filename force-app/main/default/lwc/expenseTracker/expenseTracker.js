import { LightningElement, track, wire } from 'lwc';
import getAccountCurrentMonthExpense from '@salesforce/apex/ExpenseTracker.getAccountCurrentMonthExpense';

import { CurrentPageReference } from 'lightning/navigation';

export default class ExpenseTracker extends LightningElement {
    @track recordId;
    @track currMonthExpenses = {
        Total_Expense__c : 0,
        Total_Earning__c : 0,
    };
    
    formUpdateHandler(event) {
        console.log(event.detail);
    }

    
    currentPageReference = null; 
    urlStateParameters = null;
  
    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
          console.log(currentPageReference);
          this.recordId = currentPageReference.attributes.recordId; 
          let attributes = currentPageReference.attributes;
          let states = currentPageReference.state;
          let type = currentPageReference.type;
       }
    }

    


    connectedCallback() {
        this.fetchCurrentMonthExpenses();
    }

    fetchCurrentMonthExpenses() {
        getAccountCurrentMonthExpense({accountId: this.recordId}).then(res => {
            console.log(res);
            if (res == null) {
                this.currMonthExpenses.Total_Expense__c = 0;
                this.currMonthExpenses.Total_Earning__c = 0;
                return;
            }
            this.currMonthExpenses = res;
            console.log()
        })
    }
}