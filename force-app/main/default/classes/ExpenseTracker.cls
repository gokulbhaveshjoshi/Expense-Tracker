public with sharing class ExpenseTracker {
    @AuraEnabled(cacheable=true)
    public static Month_Tracker__c getAccountCurrentMonthExpense(String accountId){
        try {
            String currName = System.today().Month() + '-' + System.today().year();
            System.debug(currName);
            List<Month_Tracker__c> monthTrackers = [Select id , Total_Expense__c, Total_Earning__c, Account__c, Name from Month_Tracker__c where  Account__c =: accountId and Name =: currName limit 1];
            System.debug(monthTrackers);
            if (monthTrackers.isEmpty()) {
                return null;
            }
            return monthTrackers[0];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Category__c> getAllCategories(){
        try {
            List<Category__c> allCategories = Category__c.getAll().values();
            return allCategories;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String addTransaction(TransactionObject transactionObj){
        try {
            String monthTrackerName = transactionObj.transactionDate.month() + '-' + transactionObj.transactionDate.year();
            Id monthTracker = getMonthTracker(monthTrackerName, transactionObj.accountId);
            Id dayTracker = getDayTracker(monthTracker, transactionObj.transactionDate);

            Transaction__c t = new Transaction__c();
            t.Amount__c = transactionObj.transactionAmount;
            t.Date__c = transactionObj.transactionDate;
            t.Description__c = transactionObj.transactionDescription;
            t.type__c = transactionObj.transactionType == 'Expense' ? 'Expense' : 'Earning';
            t.Category__c = transactionObj.transactionCategory;
            t.Day_Tracker__c = dayTracker;
            insert t;
            return String.valueOf(t.Id);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static Id getMonthTracker(String monthTrackerName, Id accountId){
        List<Month_Tracker__c> monthTrackers = [Select id , Name, Account__c from Month_Tracker__c where  Account__c =: accountId and Name =: monthTrackerName limit 1];
        if (monthTrackers.isEmpty()) {
            Month_Tracker__c monthTracker = new Month_Tracker__c();
            monthTracker.Name = monthTrackerName;
            monthTracker.Account__c = accountId;

            try {
                insert monthTracker;
                return monthTracker.Id;
            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }
        return monthTrackers[0].Id;
    }

    private static Id getDayTracker(Id monthTrackerId, Date transactionDate){
        List<Day_Tracker__c> dayTrackers = [Select id , Name, Month_Tracker__c, Date__c from Day_Tracker__c where  Month_Tracker__c =: monthTrackerId and Date__c =: transactionDate  limit 1];
        if (dayTrackers.isEmpty()) {
            Day_Tracker__c dayTracker = new Day_Tracker__c();
            dayTracker.Name = '' + transactionDate.day();
            dayTracker.Date__c = transactionDate;
            dayTracker.Month_Tracker__c = monthTrackerId;
            try {
                insert dayTracker;
                return dayTracker.Id;

            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }
        return dayTrackers[0].Id;
    }

    @AuraEnabled(cacheable=true)
    public static List<Category__c> searchCategory(String keyword){
        try {
            System.debug(keyword);
            List<Category__c> allCategories = [Select Id, Name from Category__c where Name like : '%'+keyword+'%' limit 5];

            System.debug(allCategories);
            return allCategories;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void saveCategory(String categoryName){
        try {
            Category__c category = new Category__c();
            category.Name = categoryName;
            insert category;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<Date, Map<String, Decimal>> getChartData(String accountId, Integer month, Integer year) {
        System.debug(accountId + '--' + month + '--' + year);
        List<String> headerName = new List<String>();
        Map<String, Decimal> dataMap = new Map<String, Decimal>();
        chartDataSetUp(headerName, dataMap);
        Date todayDate = Date.Today();

        Map<Date, Map<String, Decimal>> allData = new Map<Date, Map<String, Decimal>>();
        if (month == todayDate.month() && year == todayDate.year()) {
            for (Integer i = 1 ; i <= todayDate.day() ; i++) {
                allData.put(Date.newInstance(year, month, i), dataMap);
            }
        } else {
            Integer numberDays = date.daysInMonth(year, month);
            for (Integer i = 1 ; i <= numberDays ; i++) {
                allData.put(Date.newInstance(year, month, i), dataMap);
            }
        }
        
        prepareData(allData, month + ' - ' + year, accountId);
        System.debug(allData);
        return allData;
    }

    

    private static void chartDataSetUp(List<String> headerName, Map<String, Decimal> dataMap) {
        for (Category__c c : Category__c.getAll().values()) {
            headerName.add(c.Name);
            dataMap.put(c.Name, 0);
        }
        dataMap.put('Total', 0);
    }

    private static void prepareData(Map<Date, Map<String, Decimal>> data, String monthName, String accountId) {
        List<Transaction__c> transactionList = [Select Id, Date__c, Amount__c, Category__c, Day_Tracker__r.Total__c, Day_Tracker__r.Month_Tracker__r.Account__c, Day_Tracker__r.Month_Tracker__r.Name from Transaction__c where Day_Tracker__r.Month_Tracker__r.Account__c =: accountId and Day_Tracker__r.Month_Tracker__r.Name =: monthName];
        for (Transaction__c t : transactionList) {
            Map<String, Decimal> categoryData = data.get(t.Date__c);
            if (!categoryData.containsKey(t.Category__c)) {
                continue;
            }
            Decimal total = categoryData.get(t.Category__c) + t.Amount__c;
            categoryData.put(t.Category__c, total);
            categoryData.put('Total', t.Day_Tracker__r.Total__c);
            data.put(t.Date__c, categoryData);
        }
    }

    class TransactionObject {
        @AuraEnabled public String transactionType {get; set;}
        @AuraEnabled public String transactionCategory {get; set;}
        @AuraEnabled public String transactionDescription {get; set;}
        @AuraEnabled public Date transactionDate {get; set;}
        @AuraEnabled public Decimal transactionAmount {get; set;}
        @AuraEnabled public String accountId {get; set;}
    }
}