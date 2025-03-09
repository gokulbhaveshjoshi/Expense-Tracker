import { LightningElement, api  } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveCategory from '@salesforce/apex/ExpenseTracker.saveCategory';
import searchCategory from '@salesforce/apex/ExpenseTracker.searchCategory';

export default class AddCategory extends LightningElement {
    newCategory = '';
    isLoading = true;
    existCategories = [];
    caching = [];
    connectedCallback() {
        this.caching = [];
        this.isLoading = false;
    }

    handleChange(event) {
        console.log('Handle changes');
        this.newCategory = event.target.value;
        this.showCategories();
    }

    showCategories() {
        if (this.caching[this.newCategory]) {
            this.existCategories = this.caching[this.newCategory];
            return;
        }
        searchCategory({ keyword: this.newCategory })
            .then(result => {
                console.log(JSON.stringify(result));
                this.existCategories = result;
                this.caching[this.newCategory] = result;
            })
            .catch (error => {
                console.log('unable to fetch records');
            })
    }
    @api
    handleSave() {
        console.log('Save');
        this.isLoading = false;
        saveCategory({ categoryName: this.newCategory })
            .then(() => {
                this.showToast('Success', 'Category added', 'success');
                this.closeModal();
            }).catch (error => {
                this.showToast('Success', 'Category added', 'success');
            }).finally(() => {
                this.isLoading = false;
            })
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent('closemodal'));
    }

    disconnectedCallback() {
        this.newCategory = '';
    }

    showToast(title, msg, type) {
            const evt = new ShowToastEvent({
                title: title,
                message: msg,
                variant: type,
            });
            this.dispatchEvent(evt);
        }
}