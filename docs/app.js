function buildMockCategories() {
  const food = new Category('Food');
  food.deposit(1000, 'initial deposit');
  food.withdraw(10.15, 'groceries');
  food.withdraw(15.89, 'restaurant and more food for me');

  const clothing = new Category('Clothing');
  food.transfer(150, clothing);
  clothing.withdraw(25.55, 'shirt');
  clothing.withdraw(100, 'jeans');

  const auto = new Category('Auto');
  auto.deposit(1000, 'initial deposit');
  auto.withdraw(15, 'gas');
  auto.withdraw(37.5, 'oil change');

  const entertainment = new Category('Entertainment');
  entertainment.deposit(75, 'initial deposit');
  entertainment.withdraw(10, 'movie tickets');

  return [food, clothing, auto, entertainment];
}

const categories = buildMockCategories();
let selectedIndex = categories.length ? 0 : -1;
let pendingAction = null; // 'deposit' | 'withdraw' | 'transfer'

const categoryList = document.getElementById('category-list');
const ledgerTitle = document.getElementById('ledger-title');
const ledgerOutput = document.getElementById('ledger-output');
const newCategoryName = document.getElementById('new-category-name');

const amountDialog = document.getElementById('amount-dialog');
const amountDialogTitle = document.getElementById('amount-dialog-title');
const amountInput = document.getElementById('amount-input');
const descriptionInput = document.getElementById('description-input');
const transferTargetLabel = document.getElementById('transfer-target-label');
const transferTarget = document.getElementById('transfer-target');

const chartDialog = document.getElementById('chart-dialog');
const chartOutput = document.getElementById('chart-output');

function renderCategoryList() {
  categoryList.innerHTML = '';
  categories.forEach((category, index) => {
    const li = document.createElement('li');
    li.textContent = category.name;
    if (index === selectedIndex) li.classList.add('selected');
    li.addEventListener('click', () => {
      selectedIndex = index;
      renderCategoryList();
      renderLedger();
    });
    categoryList.appendChild(li);
  });
}

function renderLedger() {
  const category = categories[selectedIndex];
  if (!category) {
    ledgerTitle.textContent = 'Select a category';
    ledgerOutput.textContent = '';
    return;
  }
  ledgerTitle.textContent = category.name;
  ledgerOutput.textContent = category.toString();
}

document.getElementById('add-category-btn').addEventListener('click', () => {
  const name = newCategoryName.value.trim();
  if (!name) return;
  categories.push(new Category(name));
  newCategoryName.value = '';
  selectedIndex = categories.length - 1;
  renderCategoryList();
  renderLedger();
});

function openAmountDialog(action) {
  const category = categories[selectedIndex];
  if (!category) return;
  pendingAction = action;
  amountDialogTitle.textContent = action.charAt(0).toUpperCase() + action.slice(1);
  amountInput.value = '';
  descriptionInput.value = '';

  if (action === 'transfer') {
    const others = categories.filter((c) => c !== category);
    if (!others.length) {
      alert('Add another category first.');
      return;
    }
    transferTargetLabel.style.display = 'block';
    transferTarget.innerHTML = '';
    others.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      transferTarget.appendChild(opt);
    });
  } else {
    transferTargetLabel.style.display = 'none';
  }

  amountDialog.showModal();
  amountInput.focus();
}

document.getElementById('deposit-btn').addEventListener('click', () => openAmountDialog('deposit'));
document.getElementById('withdraw-btn').addEventListener('click', () => openAmountDialog('withdraw'));
document.getElementById('transfer-btn').addEventListener('click', () => openAmountDialog('transfer'));

document.getElementById('amount-cancel').addEventListener('click', () => amountDialog.close());

document.getElementById('amount-confirm').addEventListener('click', () => {
  const category = categories[selectedIndex];
  const amount = parseFloat(amountInput.value);
  const description = descriptionInput.value;

  if (!category || isNaN(amount) || amount <= 0) {
    alert('Enter a valid amount.');
    return;
  }

  if (pendingAction === 'deposit') {
    category.deposit(amount, description);
  } else if (pendingAction === 'withdraw') {
    if (!category.withdraw(amount, description)) {
      alert('Insufficient funds in this category.');
      return;
    }
  } else if (pendingAction === 'transfer') {
    const target = categories.find((c) => c.name === transferTarget.value);
    if (!target || !category.transfer(amount, target)) {
      alert('Insufficient funds in this category.');
      return;
    }
  }

  amountDialog.close();
  renderLedger();
});

document.getElementById('chart-btn').addEventListener('click', () => {
  if (!categories.some((c) => c.spent)) {
    alert('No withdrawals yet — nothing to chart.');
    return;
  }
  chartOutput.textContent = createSpendChart(categories);
  chartDialog.showModal();
});

document.getElementById('chart-close').addEventListener('click', () => chartDialog.close());

renderCategoryList();
renderLedger();
