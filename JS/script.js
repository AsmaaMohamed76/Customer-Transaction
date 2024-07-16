let customers = [];
let transactions = [];
let filteredTransactions = [];


//!  loader Functions     
function showLoader() {
    $("body").addClass("overflow-hidden")
    $('.loading-screen').fadeIn(1, function () {
        $('.loading-screen').fadeOut(300, function () {
            $("body").removeClass("overflow-hidden")
        })
    })
}

function hideLoader() {
    $("body").addClass("overflow-hidden")
    $('.loading-screen').fadeOut(1000, function () {
        $("body").removeClass("overflow-hidden")
    })
}

//!  Get Data      

async function getData() {

    try {
        let Response = await fetch(`https://raw.githubusercontent.com/AsmaaMohamed76/customer-transaction/main/data/data.json`);
        console.log(Response);
        let data = await Response.json();
        transactions = data.transactions;
        customers = data.customers;
        console.log(transactions); 
        displayTransactions(transactions);

    } catch (error) {
        console.log(error);
    }
}

//!     Display Data      

function displayTransactions(transactions) {
    const transactionTableBody = $('#transactionTableBody');
    transactionTableBody.empty();

    transactions.forEach(transaction => {
        const customer = customers.find(c => c.id == transaction.customer_id);
        transactionTableBody.append(`
            <tr onclick="displayTransactionsOfCustomer(${customer.id}, '${customer.name}')">
                <td class="p-2 px-3">${customer.name}</td>
                <td class="p-2 px-3">${transaction.date}</td>
                <td class="p-2 px-3">${transaction.amount} EGP</td>
              
            </tr>
        `);
    });
    updateChart(transactions);
}

//!  Search Data     

function filterTransactions() {
    showLoader()
    const customerNameFilter = $('#customerNameFilter').val().toLowerCase();
    const transactionAmountFilter = $('#transactionAmountFilter').val();

    console.log(customerNameFilter);
    console.log(transactionAmountFilter);

    filteredTransactions = transactions.filter(transaction => {
        const customer = customers.find(c => c.id == transaction.customer_id);
        const matchesName = customer.name.toLowerCase().includes(customerNameFilter);
        const matchesAmount = transactionAmountFilter ? transaction.amount == transactionAmountFilter : true;
        return matchesName && matchesAmount;
    });

    displayTransactions(filteredTransactions);
}

//!  Display & Update Cart      

function updateChart(transactions) {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    const dates = [...new Set(transactions.map(transaction => transaction.date))];
    const totalAmounts = dates.map(date => {
        return transactions.filter(transaction => transaction.date == date)
            .reduce((sum, transaction) => sum + transaction.amount, 0);
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Transaction Amount',
                data: totalAmounts,
                borderColor: 'rgba(55, 135, 255,0.5)',
                backgroundColor: 'rgba(55, 135, 255,0.5)',
            }]
        }
    });
}


//!  Transaction Amount/day Chat For The Selected Customer  

function calculateTotalAmountPerDay(transactions, customerId) {
    var dataPoints = [];
    var groupedTransactions = transactions.reduce(function (acc, transaction) {
        if (transaction.customer_id === customerId) {
            var date = transaction.date;
            acc[date] = acc[date] || 0;
            acc[date] += transaction.amount;
        }
        return acc;
    }, {});

    for (var date in groupedTransactions) {
        dataPoints.push({ x: new Date(date), y: groupedTransactions[date] });
    }

    return dataPoints;
}


//!  Transaction Amount/day Chart For The Selected Customer  
function displayTransactionsOfCustomer(customerId, customerName) {
    const customerChartSection = $('#customerChartSection');
    const chartContainer = $('#chartContainer');

    customerChartSection.show();

    const dataPoints = calculateTotalAmountPerDay(transactions, customerId);

    // Check if customerName is defined
    if (customerName) {
        const chart = new CanvasJS.Chart(chartContainer[0], {
            title: {
                text: `Total Transaction Amount per Day for Customer: ${customerName}`
            },
            axisX: {
                title: "Date",
                valueFormatString: "DD MMM YYYY"
            },
            axisY: {
                title: "Amount",
                includeZero: false
            },
            data: [{
                type: "spline",
                name: "Transaction Amount",
                dataPoints: dataPoints
            }]
        });

        chart.render();
    } else {
        chartContainer.html('<p>No data available for the selected customer.</p>');
    }
}

//!    Animate Sections    
function animateSections() {
    $("section").each(function (index) {
        if ($(this).offset().top < $(window).scrollTop() + $(window).height()) {
            $(this).animate({
                top: "0rem"
            }, (index + 10) * 100);
        }
    });
}

//!    scroll      
$(window).scroll(function () {
    animateSections();
});

//!     Document Ready      

$(document).ready(function () {
    animateSections();
    hideLoader()
    $('#customerNameFilter, #transactionAmountFilter').on('keyup', filterTransactions);
    displayTransactionsOfCustomer();
    $('#CustomerName').on('click');
    getData();

});