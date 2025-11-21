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

// Calculate current balance = total income + loans - total expenses
function calculateBalance() {
  const incomeTotal = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseTotal = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const loanTotal = loans.reduce((acc, loan) => acc + loan.amount, 0);

  return incomeTotal + loanTotal - expenseTotal;
}

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
    return;
  }

  const transactionAmount = +amount.value;

  const currentBalance = calculateBalance();

  if (transactionAmount < 0 && Math.abs(transactionAmount) > currentBalance) {
    const deficit = Math.abs(transactionAmount) - currentBalance;
    const takeLoan = confirm(
      `❌ Not enough balance to cover this expense! You need at least $${deficit.toFixed(
        2
      )} more. Do you want to take a loan to cover it?`
    );

    if (!takeLoan) return;

    let loanAmount = prompt(
      `Enter loan amount (minimum $${deficit.toFixed(2)}):`
    );
    loanAmount = Number(loanAmount);

    if (isNaN(loanAmount) || loanAmount < deficit) {
      alert(`Loan amount must be a number and at least $${deficit.toFixed(2)}`);
      return;
    }

    // Add loan
    const loan = {
      id: generateID(),
      text: 'Loan Taken',
      amount: loanAmount
    };
    loans.push(loan);
    addLoanDOM(loan);

    // Add loan amount also as income transaction for consistent tracking
    // (optional, if you want to show loan in transactions list as income)
    // transactions.push(loan);

    // Add expense transaction after loan is added
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
  }

  // If no loan needed, just add transaction
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
    <span>${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

function addLoanDOM(loan) {
  const item = document.createElement('li');
  item.classList.add('loan');
  item.innerHTML = `
    ${loan.text}
    <span>+$${loan.amount.toFixed(2)}</span>
    <button class="delete-btn" onclick="removeLoan(${loan.id})">x</button>
  `;
  loan_list.appendChild(item);
}

function updateValues() {
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const loanTotal = loans.reduce((acc, loan) => acc + loan.amount, 0);

  const totalBalance = income + loanTotal - expense;

  balance.innerText = `$${totalBalance.toFixed(2)}`;
  money_plus.innerText = `+$${income.toFixed(2)}`;
  money_minus.innerText = `-$${expense.toFixed(2)}`;
  loan_amount_display.innerText = `$${loanTotal.toFixed(2)}`;
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateValues();
  refreshDOM();
}

function removeLoan(id) {
  loans = loans.filter(loan => loan.id !== id);
  updateValues();
  refreshDOM();
}

function refreshDOM() {
  list.innerHTML = '';
  loan_list.innerHTML = '';

  transactions.forEach(addTransactionDOM);
  loans.forEach(addLoanDOM);
}

function init() {
  refreshDOM();
  updateValues();
}

init();

form.addEventListener('submit', addTransaction);
