let db;
const request = window.indexedDB.open('BudgetDb', 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    const storeForBudgetStore = db.createObjectStore('budgetStore', { autoIncrement: true});
};

request.onsuccess = (e) => {
    db = e.target.result;

    if(navigator.onLine) {
        checkDatabase();
    }
    
};

request.onerror = (e) => {
    console.log(e.error);
};

const saveRecord = (record) => {
    const transaction = db.transaction(['budgetStore'], 'readwrite');
    const budgetStore = transaction.objectStore('budgetStore');

    budgetStore.add(record);
}

const checkDatabase = () => {
    const transaction = db.transaction(['budgetStore'], 'readwrite');
    const budgetStore = transaction.objectStore('budgetStore');
    const getAll = budgetStore.getAll();

    getAll.onsuccess = () => {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => res.json())
            .then(() => {
                const transaction = db.transaction(['budgetStore'], 'readwrite');
                const budgetStore = transaction.objectStore('budgetStore');

                budgetStore.clear();
                window.location.reload();
            });
        }
    };
}

window.addEventListener('online', checkDatabase);