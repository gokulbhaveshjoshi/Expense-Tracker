import { LightningElement, api, wire, track  } from 'lwc';
import getChartData from '@salesforce/apex/ExpenseTracker.getChartData';

export default class ExpenseChart extends LightningElement {
    @api currentRecord;
    isLoading = true;
    month;
    year;

    @track columns = [];
    @track rows = [];

    @wire(getChartData, {accountId: '$currentRecord', month: 2, year: 2025})
    processData({error, data}) {
        let col = [];
        let row = [];
        console.log(error);
        console.log(data);
        col.push({label: 'Date', fieldName: 'Date'});
        if (error) {}
        if (data) {
            console.log(data);
            let i = 0;
            for (const key in data) {
                console.log(typeof key);
                console.log(typeof data[key]);
                for (const r in data[key]) {
                    if (i > 0 ) {
                        break;
                    }
                    if (i == 0) {
                        col.push({label: r, fieldName: r});
                    }
                }
                i++;
                //data['Date'] = key;
                let r = JSON.parse(JSON.stringify(data[key]));
                r['Date' ] = key;
                row.push(r);
            }
            console.log(JSON.stringify(this.col))
            console.log(JSON.stringify(this.row))
            this.columns = col;
            this.rows = row;
            console.log(JSON.stringify(this.columns))
            console.log(JSON.stringify(this.rows))
        }
        
    }

    showTable() {
        return this.columns.length > 0;
    }
}