import { LightningElement, api } from 'lwc';
import LightningModal from 'lightning/modal';


export default class ExpenseUtility extends  LightningModal {
    @api content;
    @api currentRecord;

    tansaction = 'Earning';

    showModal = false;
    showTransModal = false;
    showCategoryModal = false;
    showChartModal = false;
    
    handleAddExpense(){
        this.tansaction = 'Expense';
        this.showModal = true;
        this.showTransModal = true
    }
    
    handleAddEarning(){
        this.tansaction = 'Earning';
        this.showModal = true;
        this.showTransModal = true;
    }
    handleCategory(){
        this.tansaction = "Category"
        this.showModal = true;
        this.showCategoryModal = true;
    }
    handleMonthChart(){
        this.tansaction = "Month Chart";
        this.showModal = true;
        this.showChartModal = true;
    }

    hideModalBox() {
        this.showModal = false;
        this.showCategoryModal = false;
        this.showChartModal = false;
        this.showTransModal = false;
    }

    saveRecord() {
        console.log('SAVE RECORD');
        if (this.showTransModal) {
            this.template.querySelector('c-add-transaction').handleAddTransaction();
        }
        if (this.showCategoryModal) {
            console.log('SEND EVENT TO CHILD CATEGORY CMP');
            this.template.querySelector('c-add-category').handleSave();
        }
    }

    get heading() {
        if (this.tansaction == "Earning") {
            return "Add Earning";
        }
        if (this.tansaction == "Expense") {
            return "Add Expense";
        }
        if (this.tansaction == "Category") {
            return "Add Category";
        }
        if (this.tansaction == "Month Chart") {
            return "Show Month Chart";
        }
    }

    get showTransactionModal() {
        return (this.tansaction == "Earning" || this.tansaction == "Expense");
    }

    get showCategoryModal() {
        return (this.tansaction == "Category");
    }

    get showChartModal() {
        return (this.tansaction == "Month Chart");
    }
}