"""Tkinter demo GUI for the budgeting classes in main.py."""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog

from main import Category, create_spend_chart


class BudgetApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Budget App Demo")
        self.geometry("700x450")

        self.categories = [Category(name) for name in ("Food", "Entertainment", "Business")]

        self._build_layout()
        self._refresh_category_list()

    def _build_layout(self):
        left = ttk.Frame(self, padding=10)
        left.pack(side=tk.LEFT, fill=tk.Y)

        ttk.Label(left, text="Categories").pack(anchor=tk.W)
        self.category_listbox = tk.Listbox(left, exportselection=False)
        self.category_listbox.pack(fill=tk.Y, expand=True)
        self.category_listbox.bind("<<ListboxSelect>>", lambda e: self._refresh_ledger())

        add_frame = ttk.Frame(left)
        add_frame.pack(fill=tk.X, pady=(5, 0))
        self.new_category_entry = ttk.Entry(add_frame)
        self.new_category_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(add_frame, text="Add", command=self._add_category).pack(side=tk.LEFT)

        right = ttk.Frame(self, padding=10)
        right.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self.ledger_text = tk.Text(right, width=45, height=18, font=("Courier", 11), state=tk.DISABLED)
        self.ledger_text.pack(fill=tk.BOTH, expand=True)

        button_frame = ttk.Frame(right)
        button_frame.pack(fill=tk.X, pady=5)
        ttk.Button(button_frame, text="Deposit", command=self._deposit).pack(side=tk.LEFT)
        ttk.Button(button_frame, text="Withdraw", command=self._withdraw).pack(side=tk.LEFT)
        ttk.Button(button_frame, text="Transfer", command=self._transfer).pack(side=tk.LEFT)
        ttk.Button(button_frame, text="Show Spend Chart", command=self._show_chart).pack(side=tk.RIGHT)

    def _refresh_category_list(self):
        self.category_listbox.delete(0, tk.END)
        for category in self.categories:
            self.category_listbox.insert(tk.END, category.name)
        if self.categories:
            self.category_listbox.selection_set(0)
        self._refresh_ledger()

    def _selected_category(self):
        selection = self.category_listbox.curselection()
        if not selection:
            return None
        return self.categories[selection[0]]

    def _refresh_ledger(self):
        category = self._selected_category()
        self.ledger_text.config(state=tk.NORMAL)
        self.ledger_text.delete("1.0", tk.END)
        if category:
            self.ledger_text.insert(tk.END, str(category))
        self.ledger_text.config(state=tk.DISABLED)

    def _add_category(self):
        name = self.new_category_entry.get().strip()
        if not name:
            return
        self.categories.append(Category(name))
        self.new_category_entry.delete(0, tk.END)
        self._refresh_category_list()

    def _prompt_amount_description(self, title):
        amount = simpledialog.askfloat(title, "Amount:", parent=self, minvalue=0.01)
        if amount is None:
            return None
        description = simpledialog.askstring(title, "Description (optional):", parent=self) or ""
        return amount, description

    def _deposit(self):
        category = self._selected_category()
        if not category:
            return
        result = self._prompt_amount_description("Deposit")
        if result is None:
            return
        amount, description = result
        category.deposit(amount, description)
        self._refresh_ledger()

    def _withdraw(self):
        category = self._selected_category()
        if not category:
            return
        result = self._prompt_amount_description("Withdraw")
        if result is None:
            return
        amount, description = result
        if not category.withdraw(amount, description):
            messagebox.showerror("Withdraw failed", "Insufficient funds in this category.")
            return
        self._refresh_ledger()

    def _transfer(self):
        category = self._selected_category()
        if not category:
            return
        other_names = [c.name for c in self.categories if c is not category]
        if not other_names:
            messagebox.showinfo("Transfer", "Add another category first.")
            return
        target_name = simpledialog.askstring(
            "Transfer", f"Transfer to which category?\nOptions: {', '.join(other_names)}", parent=self
        )
        target = next((c for c in self.categories if c.name == target_name), None)
        if target is None:
            return
        result = self._prompt_amount_description("Transfer")
        if result is None:
            return
        amount, _ = result
        if not category.transfer(amount, target):
            messagebox.showerror("Transfer failed", "Insufficient funds in this category.")
            return
        self._refresh_ledger()

    def _show_chart(self):
        if not self.categories:
            return
        if not any(c.spent for c in self.categories):
            messagebox.showinfo("Spend Chart", "No withdrawals yet — nothing to chart.")
            return
        chart = create_spend_chart(self.categories)

        chart_window = tk.Toplevel(self)
        chart_window.title("Percentage Spent by Category")
        text = tk.Text(chart_window, font=("Courier", 11), width=60, height=20)
        text.pack(fill=tk.BOTH, expand=True)
        text.insert(tk.END, chart)
        text.config(state=tk.DISABLED)


if __name__ == "__main__":
    BudgetApp().mainloop()
