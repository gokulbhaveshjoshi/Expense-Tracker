import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllCategories from '@salesforce/apex/ExpenseTracker.getAllCategories';
import addTransaction from '@salesforce/apex/ExpenseTracker.addTransaction';

export default class AddTransaction extends LightningElement {
    @api transaction;
    @api currentRecord;
    @track isLoading = false;
    transactionDate;
    transactionAmount = 0;
    categories = [];
    transactionCategory;
    transactionDescription;

    @wire(getAllCategories) 
    wiredCategories({error, data}) {
        if (data) {
            this.categories = data;
        } 
    };

    connectedCallback() {
        this.transactionDate = new Date().toISOString().split('T')[0];
    }

    

    handleDateChange(event) {
        this.transactionDate = event.target.value;
    }

    handleAmountChange(event) {
        this.transactionAmount = event.target.value;
    }

    handleCategoryChange(event) {
        this.transactionCategory = event.target.value;
    }
    handleDescriptionChange(event) {
        this.transactionDescription = event.target.value;
    }

    @api
    handleAddTransaction() {
        console.log('Add Transaction');
        console.log(this.transactionDate);
        console.log(this.transactionAmount);
        this.isLoading = true;
        if (this.transactionAmount == null ) {
            this.isLoading = false;
            console.log(1);
            this.showToast('Error', 'Amount is missing', 'error');
            console.log(1);
            return;
        }

        if (this.transactionAmount == 0 ) {
            this.isLoading = false;
            console.log(1);
            this.showToast('Error', 'Please enter value in Amount', 'error');
            return;
        }

        if (this.transactionDate == null) {
            this.isLoading = false;
            console.log(1);
            this.showToast('Error', 'Please select date', 'error');
            return;
        }

        if (this.transactionCategory == null || this.transactionCategory == '') {
            this.isLoading = false;
            console.log(1);
            this.showToast('Error', 'Please select category', 'error');
            return;
        }
        if ((!this.transaction) || this.transaction == '' || this.transaction == null){
            this.isLoading = false;
            this.showToast('Error', 'Please select transaction type', 'error');
            return;
        }
        this.createTransaction();
    }

    createTransaction() {
        let transaction = {
            transactionType: this.transaction,
            transactionDate: this.transactionDate,
            transactionAmount: this.transactionAmount,
            transactionCategory: this.transactionCategory,
            transactionDescription: this.transactionDescription,
            accountId: this.currentRecord
        }
        console.log('transaction obj', JSON.stringify(transaction));
        addTransaction({transactionObj: transaction})
        .then(result => {
            this.transactionDate = new Date().toISOString().split('T')[0];
            this.transactionAmount = 0;  
            this.transactionCategory = '';
            this.transactionDescription = '';
            this.showToast(
                'Success',
                'Transaction Added Successfully',
                'success');
            setTimeout(() => {
                this.isLoading = false;
                this.closeModal();
            }, 1000);
        }).catch(e => {
            this.showToast('Error', e.body.message, 'error');
        })
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent('closemodal'));
    }

    showToast(title, msg, type) {
        const evt = new ShowToastEvent({
            title: title,
            message: msg,
            variant: type,
        });
        this.dispatchEvent(evt);
    }



    get categoryOptions() {
        let categoriesOption = [{label: 'Select Category', value: ''}];
        this.categories.forEach(e => {
            categoriesOption.push({
                label: e.Name,
                value: e.Name
            })
        })
        return categoriesOption;
    }
}