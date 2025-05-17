const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const loan_amount_display = document.getElementById('loan-amount');
const list = document.getElementById('list');
const loan_list = document.getElementById('loan-list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

let transactions = [];
let loans = [];

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
    return;
  }

  const transactionAmount = +amount.value;

  const currentBalance = transactions.reduce((acc, t) => acc + t.amount, 0);

  // If it's an expense and exceeds current balance
  if (transactionAmount < 0 && Math.abs(transactionAmount) > currentBalance) {
    const takeLoan = confirm('❌ Cheque Bounced! Not enough balance. Do you want to take a loan?');

    if (takeLoan) {
      const loanAmount = prompt('Enter loan amount:');

      if (loanAmount && !isNaN(loanAmount) && Number(loanAmount) > 0) {
        const loan = {
          id: generateID(),
          text: 'Loan Taken',
          amount: +loanAmount
        };
        loans.push(loan);
        transactions.push(loan);
        addLoanDOM(loan);

        // 💡 After loan, still add the original expense
        const transaction = {
          id: generateID(),
          text: text.value,
          amount: transactionAmount
        };
        transactions.push(transaction);
        addTransactionDOM(transaction);
        updateValues();

        text.value = '';
        amount.value = '';
        return;
      } else {
        alert('Invalid loan amount');
        return;
      }
    } else {
      return;
    }
  }

  // Otherwise, just add transaction directly
  const transaction = {
    id: generateID(),
    text: text.value,
    amount: transactionAmount
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();

  text.value = '';
  amount.value = '';
}


function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
    ${transaction.text} 
    <span>${sign}$${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

function addLoanDOM(loan) {
  const item = document.createElement('li');
  item.classList.add('loan');
  item.innerHTML = `
    ${loan.text} 
    <span>+$${loan.amount}</span>
  `;
  loan_list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => acc + item, 0)
    .toFixed(2);
  const expense = (
    amounts.filter(item => item < 0)
      .reduce((acc, item) => acc + item, 0) * -1
  ).toFixed(2);
  const loanAmount = loans
    .reduce((acc, loan) => acc + loan.amount, 0)
    .toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `+$${income}`;
  money_minus.innerText = `-$${expense}`;
  loan_amount_display.innerText = `Loan: $${loanAmount}`;
}

function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  loans = loans.filter(loan => loan.id !== id);
  init();
}

function init() {
  list.innerHTML = '';
  loan_list.innerHTML = '';
  transactions.forEach(t => {
    if (loans.some(loan => loan.id === t.id)) {
      addLoanDOM(t);
    } else {
      addTransactionDOM(t);
    }
  });
  updateValues();
}

init();

form.addEventListener('submit', addTransaction);
