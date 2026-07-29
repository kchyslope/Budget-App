// JS port of the Category class and create_spend_chart from main.py

function pyCenter(s, width, fillChar = ' ') {
  const totalPad = width - s.length;
  if (totalPad <= 0) return s;
  const left = Math.floor(totalPad / 2);
  const right = totalPad - left;
  return fillChar.repeat(left) + s + fillChar.repeat(right);
}

class Category {
  constructor(name) {
    this.name = name;
    this.ledger = [];
    this.balance = 0;
    this.spent = 0;
  }

  toString() {
    const firstLine = pyCenter(this.name, 30, '*') + '\n';
    let lines = '';
    for (const entry of this.ledger) {
      const descr = entry.description.slice(0, 23).padEnd(23);
      const amount = entry.amount.toFixed(2).slice(0, 7).padStart(7);
      lines += `${descr}${amount}\n`;
    }
    const total = `Total: ${this.balance.toFixed(2)}`;
    return `${firstLine}${lines}${total}`;
  }

  deposit(amount, description = '') {
    this.ledger.push({ amount: parseFloat(amount), description });
    this.balance += parseFloat(amount);
  }

  withdraw(amount, description = '') {
    if (!this.checkFunds(amount)) return false;
    this.ledger.push({ amount: -parseFloat(amount), description });
    this.balance -= parseFloat(amount);
    this.spent += parseFloat(amount);
    return true;
  }

  getBalance() {
    return this.balance;
  }

  transfer(amount, category) {
    if (!this.checkFunds(amount)) return false;
    this.ledger.push({ amount: -parseFloat(amount), description: `Transfer to ${category.name}` });
    this.balance -= parseFloat(amount);
    category.deposit(amount, `Transfer from ${this.name}`);
    return true;
  }

  checkFunds(amount) {
    return parseFloat(amount) <= this.balance;
  }
}

function createSpendChart(categories) {
  let totalExpenses = 0;
  const obj = {};
  let labelMaxLength = 0;

  for (const category of categories) {
    totalExpenses += category.spent;
    obj[category.name] = { expenses: category.spent, label: category.name.split('') };
    labelMaxLength = Math.max(labelMaxLength, obj[category.name].label.length);
  }

  for (const category of categories) {
    const percent = Math.floor((category.spent / totalExpenses * 100) / 10) * 10;
    obj[category.name].percent = percent;
    obj[category.name].column = [];
    for (let i = 0; i <= 100; i += 10) {
      obj[category.name].column.unshift(percent >= i ? 'o' : ' ');
    }
  }

  const col1 = [];
  for (let i = 0; i <= 100; i += 10) col1.unshift(i);

  const rows = [];
  let finalStr = 'Percentage spent by category\n';
  for (let i = 0; i < 11; i++) {
    rows.push('');
    for (const key in obj) {
      rows[i] += `${obj[key].column[i]}  `;
    }
    finalStr += `${String(col1[i]).padStart(3)}| ${rows[i]}\n`;
  }
  finalStr += `    ${'-'.repeat(1 + 3 * Object.keys(obj).length)}\n   `;

  const labelStrings = [];
  for (let i = 0; i < labelMaxLength; i++) {
    labelStrings.push('  ');
    for (const k in obj) {
      if (obj[k].label.length < labelMaxLength) {
        obj[k].label = obj[k].label.concat(Array(labelMaxLength - obj[k].label.length).fill(' '));
      }
      labelStrings[i] += `${obj[k].label[i]}  `;
    }
    if (i < labelMaxLength - 1) labelStrings[i] += '\n   ';
    finalStr += labelStrings[i];
  }

  return finalStr;
}
