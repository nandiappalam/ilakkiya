import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sqlite3
import pandas as pd
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import tempfile, os
from datetime import datetime


# ---------- Theme Colors ----------
BG_COLOR = "#FFFFFF"
HEADER_BG = "#005F99"
HEADER_FG = "white"
FRAME_BG = "#E6F0FA"
BUTTON_BG = "#005F99"
BUTTON_FG = "white"

# ---------- Database Setup ----------
conn = sqlite3.connect("inventory.db")
cursor = conn.cursor()

# Master tables
cursor.execute("""
    CREATE TABLE IF NOT EXISTS item_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_code TEXT UNIQUE,
        item_name TEXT,
        print_name TEXT,
        item_group TEXT,
        tax REAL,
        hsn_code TEXT
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS item_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_code TEXT UNIQUE,
        group_name TEXT,
        print_name TEXT,
        tax REAL
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS deduction_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ded_code TEXT UNIQUE,
        ded_name TEXT,
        print_name TEXT,
        adjust_with_sales TEXT,
        account_head TEXT,
        ded_type TEXT,
        calc_type TEXT
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS deduction_purchase (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ded_code TEXT UNIQUE,
        ded_name TEXT,
        print_name TEXT,
        debit_adjust TEXT,
        account_head TEXT,
        credit_adjust TEXT,
        ded_type TEXT,
        calc_type TEXT
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS customer_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        print_name TEXT,
        contact_person TEXT,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        gst_number TEXT,
        phone_off TEXT,
        phone_res TEXT,
        mobile1 TEXT,
        mobile2 TEXT,
        area TEXT,
        opening_balance REAL
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS supplier_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        print_name TEXT,
        contact_person TEXT,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        gst_number TEXT,
        phone_off TEXT,
        phone_res TEXT,
        mobile1 TEXT,
        mobile2 TEXT,
        area TEXT,
        opening_balance REAL
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS flour_mill_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flourmill TEXT UNIQUE,
        print_name TEXT,
        contact_person TEXT,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        gst_number TEXT,
        phone_off TEXT,
        phone_res TEXT,
        mobile1 TEXT,
        mobile2 TEXT,
        area TEXT,
        wages_kg REAL,
        opening_balance REAL
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS papad_company_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        contact_person TEXT,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        gst_no TEXT,
        phone_off TEXT,
        phone_res TEXT,
        mobile1 TEXT,
        mobile2 TEXT,
        area TEXT,
        wages_kg REAL,
        opening_balance REAL,
        opening_advance REAL
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS papad_wages_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        papad_company TEXT,
        from_date TEXT,
        to_date TEXT,
        papad_kg_bag REAL,
        wages_bag REAL,
        adv_ded_bag REAL,
        FOREIGN KEY(papad_company) REFERENCES papad_company_master(name)
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS weightmaster (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        printname TEXT,
        weight REAL
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS ledgergroupmaster (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        printname TEXT,
        under TEXT
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS ledgermaster (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        printname TEXT,
        under TEXT,
        openingbalance REAL,
        area TEXT,
        credit REAL,
        debit REAL
    )
""")

# Transaction tables from web app
cursor.execute("""
    CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        s_no INTEGER NOT NULL,
        date DATE NOT NULL,
        inv_no TEXT,
        supplier TEXT,
        pay_type TEXT DEFAULT 'Credit',
        inv_date DATE,
        type TEXT DEFAULT 'Urad',
        address TEXT,
        tax_type TEXT DEFAULT 'Exclusive',
        godown TEXT,
        remarks TEXT,
        total_qty REAL DEFAULT 0,
        total_weight REAL DEFAULT 0,
        total_amount REAL DEFAULT 0,
        base_amount REAL DEFAULT 0,
        disc_amount REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        net_amount REAL DEFAULT 0,
        auto_wages REAL DEFAULT 0,
        vat_percent REAL DEFAULT 0,
        vat REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS purchase_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id INTEGER,
        item_name TEXT NOT NULL,
        weight REAL,
        qty REAL,
        total_wt REAL,
        rate REAL,
        disc_percent REAL DEFAULT 0,
        tax_percent REAL DEFAULT 0,
        amount REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS purchase_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        s_no INTEGER NOT NULL,
        date DATE NOT NULL,
        return_inv_no TEXT,
        supplier TEXT,
        pay_type TEXT DEFAULT 'Credit',
        inv_date DATE,
        type TEXT DEFAULT 'Urad',
        address TEXT,
        tax_type TEXT DEFAULT 'Exclusive',
        godown TEXT,
        remarks TEXT,
        total_qty REAL DEFAULT 0,
        total_weight REAL DEFAULT 0,
        total_amount REAL DEFAULT 0,
        base_amount REAL DEFAULT 0,
        disc_amount REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        net_amount REAL DEFAULT 0,
        auto_wages REAL DEFAULT 0,
        vat_percent REAL DEFAULT 0,
        vat REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS purchase_return_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_return_id INTEGER,
        lot_no TEXT,
        item_name TEXT NOT NULL,
        weight REAL,
        qty REAL,
        total_wt REAL,
        rate REAL,
        disc_percent REAL DEFAULT 0,
        tax_percent REAL DEFAULT 0,
        amount REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_return_id) REFERENCES purchase_returns(id) ON DELETE CASCADE
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS grains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        s_no INTEGER NOT NULL,
        flour_mill TEXT,
        date DATE NOT NULL,
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS grain_input_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grain_id INTEGER,
        item_name TEXT NOT NULL,
        lot_no TEXT,
        weight REAL,
        qty REAL,
        total_wt REAL,
        wages_kg REAL,
        total_wages REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE CASCADE
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS grain_output_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grain_id INTEGER,
        item_name TEXT NOT NULL,
        weight REAL,
        qty REAL,
        total_wt REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE CASCADE
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS flour_out (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        s_no INTEGER NOT NULL,
        date DATE NOT NULL,
        papad_company TEXT,
        remarks TEXT,
        total_qty REAL DEFAULT 0,
        total_weight REAL DEFAULT 0,
        total_wages REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS flour_out_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flour_out_id INTEGER,
        item_name TEXT NOT NULL,
        lot_no TEXT,
        weight REAL,
        qty REAL,
        total_wt REAL,
        papad_kg REAL,
        wages_bag REAL,
        wages REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flour_out_id) REFERENCES flour_out(id) ON DELETE CASCADE
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS flour_out_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        s_no INTEGER NOT NULL,
        date DATETIME NOT NULL,
        tax_type TEXT DEFAULT 'Cash',
        remarks TEXT,
        total_qty REAL DEFAULT 0,
        total_weight REAL DEFAULT 0,
        total_wages REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS flour_out_return_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flour_out_return_id INTEGER,
        item_name TEXT NOT NULL,
        weight REAL,
        qty REAL,
        total_wt REAL,
        papad_kg REAL,
        cost REAL,
        wages_bag REAL,
        wages REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flour_out_return_id) REFERENCES flour_out_returns(id) ON DELETE CASCADE
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        s_no INTEGER NOT NULL,
        date DATE NOT NULL,
        customer TEXT,
        remarks TEXT,
        total_qty REAL DEFAULT 0,
        total_wt REAL DEFAULT 0,
        total_amt REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sales_id INTEGER,
        item_name TEXT NOT NULL,
        lot_no TEXT,
        weight REAL,
        qty REAL,
        total_wt REAL,
        rate REAL,
        disc_perc REAL DEFAULT 0,
        tax_perc REAL DEFAULT 0,
        total_amt REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_id) REFERENCES sales(id)
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales_return (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        s_no INTEGER NOT NULL,
        date DATE NOT NULL,
        customer TEXT,
        remarks TEXT,
        total_qty REAL DEFAULT 0,
        total_wt REAL DEFAULT 0,
        total_amt REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales_return_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sales_return_id INTEGER,
        item_name TEXT NOT NULL,
        lot_no TEXT,
        weight REAL,
        qty REAL,
        total_wt REAL,
        rate REAL,
        disc_perc REAL DEFAULT 0,
        tax_perc REAL DEFAULT 0,
        total_amt REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_return_id) REFERENCES sales_return(id)
    )
""")

conn.commit()


# ---------- Helper Functions ----------
def get_next_item_code():
    cursor.execute("SELECT MAX(id) FROM item_master")
    last_id = cursor.fetchone()[0]
    return f"ITM{(last_id + 1) if last_id else 1:04d}"

# ---------- Item Master Windows ----------
def open_create_item():
    win = tk.Toplevel(root)
    win.title("Create Item")
    win.geometry("600x450")
    win.configure(bg=BG_COLOR)
    win.grab_set()

    item_code_var = tk.StringVar(value=get_next_item_code())
    item_name_var = tk.StringVar()
    print_name_var = tk.StringVar()
    tax_var = tk.StringVar()
    hsn_code_var = tk.StringVar()
    group_var = tk.StringVar()

    # Header
    tk.Label(win, text="🧾 Create New Item", font=("Arial Rounded MT Bold", 16),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    # Entry Frame
    entry_frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=20)
    entry_frame.pack(fill="both", expand=True, padx=20, pady=10)

    def add_entry(row, label, variable):
        tk.Label(entry_frame, text=label, bg=FRAME_BG, fg="black", anchor="w").grid(row=row,column=0,sticky="w", pady=5)
        tk.Entry(entry_frame, textvariable=variable, bg="white", fg="black", width=30).grid(row=row,column=1, pady=5)

    add_entry(0, "Item Code", item_code_var)
    add_entry(1, "Item Name", item_name_var)
    add_entry(2, "Print Name", print_name_var)
    tk.Label(entry_frame, text="Item Group", bg=FRAME_BG, fg="black", anchor="w").grid(row=3, column=0, sticky="w", pady=5)
    item_group_combo = ttk.Combobox(entry_frame, values=["Raw","Finished","Packing","Other"], textvariable=group_var, width=28)
    item_group_combo.grid(row=3,column=1,pady=5)
    add_entry(4, "Tax (%)", tax_var)
    add_entry(5, "HSN Code", hsn_code_var)

    # Functions
    def save_item():
        if not item_name_var.get():
            messagebox.showwarning("Validation","Item Name is required!")
            return
        try:
            cursor.execute("""
                INSERT INTO item_master (item_code, item_name, print_name, item_group, tax, hsn_code)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                item_code_var.get(),
                item_name_var.get(),
                print_name_var.get(),
                group_var.get(),
                tax_var.get() or 0,
                hsn_code_var.get()
            ))
            conn.commit()
            messagebox.showinfo("Success","Item saved successfully!")
            item_code_var.set(get_next_item_code())
            item_name_var.set("")
            print_name_var.set("")
            group_var.set("")
            tax_var.set("")
            hsn_code_var.set("")
        except sqlite3.IntegrityError:
            messagebox.showerror("Error","Item code already exists!")

    # Buttons
    btn_frame = tk.Frame(win, bg=BG_COLOR)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="💾 Save", command=save_item, bg=BUTTON_BG, fg=BUTTON_FG, width=12).grid(row=0,column=0,padx=10)
    tk.Button(btn_frame, text="🧹 Clear", command=lambda: [item_name_var.set(""), print_name_var.set(""), group_var.set(""), tax_var.set(""), hsn_code_var.set("")],
              bg=BUTTON_BG, fg=BUTTON_FG, width=12).grid(row=0,column=1,padx=10)
    tk.Button(btn_frame, text="❌ Close", command=win.destroy, bg="#f44336", fg="white", width=12).grid(row=0,column=2,padx=10)

def open_display_item():
    win = tk.Toplevel(root)
    win.title("Display Items")
    win.geometry("850x500")
    win.configure(bg=BG_COLOR)
    win.grab_set()

    tk.Label(win, text="📋 Item List", font=("Arial Rounded MT Bold", 16), bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    search_frame = tk.Frame(win, bg=FRAME_BG, padx=10, pady=5)
    search_frame.pack(fill="x", padx=10, pady=5)
    tk.Label(search_frame, text="Search Name/Group:", bg=FRAME_BG).pack(side="left")
    search_var = tk.StringVar()
    tk.Entry(search_frame, textvariable=search_var, width=30).pack(side="left", padx=5)

    columns = ("item_code","item_name","print_name","item_group","tax","hsn_code")
    tree = ttk.Treeview(win, columns=columns, show="headings")
    for col in columns:
        tree.heading(col, text=col.replace("_"," ").title())
        tree.column(col, width=120)
    tree.pack(fill="both", expand=True, padx=10, pady=5)

    def load_data(*args):
        for row in tree.get_children():
            tree.delete(row)
        val = search_var.get()
        if val:
            cursor.execute("SELECT item_code,item_name,print_name,item_group,tax,hsn_code FROM item_master WHERE item_name LIKE ? OR item_group LIKE ?", (f"%{val}%",f"%{val}%"))
        else:
            cursor.execute("SELECT item_code,item_name,print_name,item_group,tax,hsn_code FROM item_master")
        for row in cursor.fetchall():
            tree.insert("", tk.END, values=row)

    search_var.trace("w", load_data)
    load_data()

    btn_frame = tk.Frame(win, bg=BG_COLOR)
    btn_frame.pack(pady=10)
    def export_excel():
        data = [tree.item(i)['values'] for i in tree.get_children()]
        if not data:
            messagebox.showinfo("Info","No data to export")
            return
        df = pd.DataFrame(data, columns=columns)
        file = filedialog.asksaveasfilename(defaultextension=".xlsx")
        if file:
            df.to_excel(file, index=False)
            messagebox.showinfo("Exported","Data exported successfully")

    tk.Button(btn_frame, text="📤 Export Excel", command=export_excel, bg="#4CAF50", fg="white").pack(side="left", padx=5)
    tk.Button(btn_frame, text="🖨 Print", command=lambda:messagebox.showinfo("Print","Printing..."), bg="#2196F3", fg="white").pack(side="left", padx=5)
    tk.Button(btn_frame, text="❌ Close", command=win.destroy, bg="#f44336", fg="white").pack(side="right", padx=5)

def open_edit_item():
    win = tk.Toplevel(root)
    win.title("Edit Item")
    win.geometry("600x450")
    win.configure(bg=BG_COLOR)
    win.grab_set()

    item_code_var = tk.StringVar()
    item_name_var = tk.StringVar()
    print_name_var = tk.StringVar()
    tax_var = tk.StringVar()
    hsn_code_var = tk.StringVar()
    group_var = tk.StringVar()

    tk.Label(win, text="✏️ Edit Item", font=("Arial Rounded MT Bold", 16), bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    select_frame = tk.Frame(win, bg=FRAME_BG, padx=10, pady=10)
    select_frame.pack(fill="x", padx=10, pady=5)
    tk.Label(select_frame, text="Select Item Code:", bg=FRAME_BG).grid(row=0,column=0,padx=5,pady=5)
    cursor.execute("SELECT item_code FROM item_master")
    code_list = [row[0] for row in cursor.fetchall()]
    code_combo = ttk.Combobox(select_frame, values=code_list, textvariable=item_code_var, width=30)
    code_combo.grid(row=0,column=1,padx=5,pady=5)

    entry_frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=20)
    entry_frame.pack(fill="both", expand=True, padx=20, pady=10)
    def add_entry(row,label,variable):
        tk.Label(entry_frame, text=label, bg=FRAME_BG, fg="black", anchor="w").grid(row=row,column=0,sticky="w", pady=5)
        tk.Entry(entry_frame,textvariable=variable,bg="white",fg="black",width=30).grid(row=row,column=1,pady=5)
    add_entry(0,"Item Name",item_name_var)
    add_entry(1,"Print Name",print_name_var)
    tk.Label(entry_frame,text="Item Group",bg=FRAME_BG,fg="black").grid(row=2,column=0,sticky="w", pady=5)
    item_group_combo = ttk.Combobox(entry_frame, values=["Raw","Finished","Packing","Other"], textvariable=group_var, width=28)
    item_group_combo.grid(row=2,column=1,pady=5)
    add_entry(3,"Tax (%)",tax_var)
    add_entry(4,"HSN Code",hsn_code_var)

    def load_item(event=None):
        cursor.execute("SELECT item_name,print_name,item_group,tax,hsn_code FROM item_master WHERE item_code=?",(item_code_var.get(),))
        row = cursor.fetchone()
        if row:
            item_name_var.set(row[0])
            print_name_var.set(row[1])
            group_var.set(row[2])
            tax_var.set(row[3])
            hsn_code_var.set(row[4])

    code_combo.bind("<<ComboboxSelected>>", load_item)

    def update_item():
        cursor.execute("""
            UPDATE item_master SET item_name=?, print_name=?, item_group=?, tax=?, hsn_code=? WHERE item_code=?
        """, (item_name_var.get(), print_name_var.get(), group_var.get(), tax_var.get() or 0, hsn_code_var.get(), item_code_var.get()))
        conn.commit()
        messagebox.showinfo("Success","Item updated successfully!")

    btn_frame = tk.Frame(win, bg=BG_COLOR)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="💾 Update", command=update_item, bg="#4CAF50", fg="white", width=12).grid(row=0,column=0,padx=10)
    tk.Button(btn_frame, text="❌ Close", command=win.destroy, bg="#f44336", fg="white", width=12).grid(row=0,column=1,padx=10)

# ---------- Main Window ----------
root = tk.Tk()
root.title("Production Industry Inventory Management System")
root.geometry("1200x700")
root.configure(bg="#E6F0FA")

# ---------- Title ----------
tk.Label(root, text="🏭 Production Industry Inventory Management System", font=("Arial Rounded MT Bold", 20, "bold"),
         bg=HEADER_BG, fg=HEADER_FG, pady=15).pack(fill=tk.X)

# ---------- Menu ----------
menubar = tk.Menu(root)
def init_db():
    conn = sqlite3.connect("inventory.db")
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sno TEXT,
        inv_no TEXT,
        inv_date TEXT,
        datetime TEXT,
        supplier TEXT,
        addr1 TEXT,
        addr2 TEXT,
        pay_type TEXT,
        tax_type TEXT,
        godown TEXT,
        remarks TEXT,
        total_qty REAL,
        total_wt REAL,
        base_amt REAL,
        disc_amt REAL,
        tax_amt REAL,
        net_amt REAL,
        ded_total REAL,
        grand_total REAL,
        created_at TEXT
    )''')
    c.execute('''
    CREATE TABLE IF NOT EXISTS purchase_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sno INTEGER,
        purchase_id INTEGER,
        s_no INTEGER,
        lot_no TEXT,
        item_name TEXT,
        weight REAL,
        qty REAL,
        total_wt REAL,
        pur_rate REAL,
        disc_perc REAL,
        tax_perc REAL,
        total_amt REAL,
        FOREIGN KEY(purchase_id) REFERENCES purchases(id)
    )''')
    c.execute('''
    CREATE TABLE IF NOT EXISTS purchase_deductions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id INTEGER,
        description TEXT,
        perc REAL,
        amount REAL,
        party_amt REAL,
        total REAL,
        FOREIGN KEY(purchase_id) REFERENCES purchases(id)
    )''')
    conn.commit()
    conn.close()

init_db()
DB_FILE = "inventory.db"

# ---------- Purchase Window ----------
class PurchaseWindow:
    def __init__(self, root):
        self.root = root
        self.root.title("Purchase Entry")
        self.root.geometry("1400x860")
        self.root.configure(bg="#ffffff")

        self.default_font = ("Segoe UI", 10, "bold")

        # Suppliers
        self.suppliers = {
            "Supplier A": ("123 Main St", "City A"),
            "Supplier B": ("456 Market Rd", "City B"),
            "Supplier C": ("789 Industrial Ave", "City C"),
        }

        # Columns
        self.item_columns = ["Item Name", "Weight", "Qty", "Lot No", "Total Wt",
                             "Pur. Rate", "Disc %", "Tax %", "Total Amt"]
        self.deduction_columns = ["Description", "%", "Amount", "Party Amt", "Total Amt"]

        self.item_entries = []
        self.deduction_entries = []

        # Totals
        self.total_qty_var = tk.StringVar(value="0")
        self.total_wt_var = tk.StringVar(value="0.00")
        self.base_amt_var = tk.StringVar(value="0.00")
        self.disc_amt_var = tk.StringVar(value="0.00")
        self.tax_amt_var = tk.StringVar(value="0.00")
        self.net_amt_var = tk.StringVar(value="0.00")
        self.ded_total_var = tk.StringVar(value="0.00")
        self.grand_total_var = tk.StringVar(value="0.00")

        self.create_top_frame()
        self.create_mid_frame()
        self.create_bottom_frame()

    # ---------- Top Frame ----------
    def create_top_frame(self):
        frame = ttk.LabelFrame(self.root, text="Purchase Info", padding=10)
        frame.pack(fill="x", padx=10, pady=(10, 5))
        style = {"font": self.default_font}

        ttk.Label(frame, text="S.No", **style).grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.sno_var = tk.StringVar(value="1")
        ttk.Entry(frame, textvariable=self.sno_var, width=8, font=self.default_font).grid(row=0, column=1, sticky="w")

        ttk.Label(frame, text="Date & Time", **style).grid(row=0, column=2, padx=8, sticky="w")
        self.datetime_var = tk.StringVar(value=datetime.now().strftime("%d-%m-%Y %H:%M"))
        ttk.Entry(frame, textvariable=self.datetime_var, width=22, font=self.default_font).grid(row=0, column=3, sticky="w")

        ttk.Label(frame, text="Pay Type", **style).grid(row=0, column=4, padx=8, sticky="w")
        self.paytype = ttk.Combobox(frame, values=["Cash", "Credit"], width=14, font=self.default_font)
        self.paytype.current(0); self.paytype.grid(row=0, column=5, sticky="w")

        ttk.Label(frame, text="Invoice No", **style).grid(row=0, column=6, padx=8, sticky="w")
        self.inv_no = ttk.Entry(frame, width=18, font=self.default_font); self.inv_no.grid(row=0, column=7, sticky="w")

        ttk.Label(frame, text="Invoice Date", **style).grid(row=0, column=8, padx=8, sticky="w")
        self.inv_date = ttk.Entry(frame, width=14, font=self.default_font); self.inv_date.insert(0, datetime.now().strftime("%d-%m-%Y")); self.inv_date.grid(row=0, column=9, sticky="w")

        ttk.Label(frame, text="Tax Type", **style).grid(row=1, column=0, padx=4, pady=6, sticky="w")
        self.tax_type = ttk.Combobox(frame, values=["GST","IGST","Non-GST"], width=14, font=self.default_font); self.tax_type.current(0); self.tax_type.grid(row=1, column=1, sticky="w")

        ttk.Label(frame, text="Supplier", **style).grid(row=1, column=2, padx=8, sticky="w")
        self.supplier_cb = ttk.Combobox(frame, values=list(self.suppliers.keys()), width=30, font=self.default_font)
        self.supplier_cb.grid(row=1, column=3, sticky="w")
        self.supplier_cb.bind("<<ComboboxSelected>>", self.on_supplier_select)

        ttk.Label(frame, text="Address1", **style).grid(row=1, column=4, padx=8, sticky="w")
        self.addr1 = ttk.Entry(frame, width=30, font=self.default_font); self.addr1.grid(row=1, column=5, columnspan=3, sticky="w")
        ttk.Label(frame, text="Address2", **style).grid(row=2, column=4, padx=8, sticky="w")
        self.addr2 = ttk.Entry(frame, width=30, font=self.default_font); self.addr2.grid(row=2, column=5, columnspan=3, sticky="w")

        ttk.Label(frame, text="Remarks", **style).grid(row=2, column=0, padx=4, sticky="w")
        self.remarks = ttk.Entry(frame, width=40, font=self.default_font); self.remarks.grid(row=2, column=1, columnspan=3, sticky="w")

        ttk.Label(frame, text="Godown", **style).grid(row=2, column=8, padx=8, sticky="w")
        self.godown = ttk.Combobox(frame, values=["Main Storage","Mill","Warehouse A"], width=18, font=self.default_font); self.godown.current(0); self.godown.grid(row=2, column=9, sticky="w")

    def on_supplier_select(self, event):
        sel = self.supplier_cb.get(); a1,a2=self.suppliers.get(sel, ("",""))
        self.addr1.delete(0, tk.END); self.addr1.insert(0,a1)
        self.addr2.delete(0, tk.END); self.addr2.insert(0,a2)

    # ---------- Middle Frame ----------
    def create_mid_frame(self):
        frame = tk.LabelFrame(self.root, text="Items", font=self.default_font, bg="#e7f0ff", fg="#004080", bd=2)
        frame.pack(fill="both", expand=True, padx=10, pady=(5,10))

        canvas_frame = tk.Frame(frame, bg="#e7f0ff"); canvas_frame.pack(fill="both", expand=True)
        self.canvas = tk.Canvas(canvas_frame, height=300, bg="#ffffff"); self.canvas.pack(side="left", fill="both", expand=True)
        vscroll = ttk.Scrollbar(canvas_frame, orient="vertical", command=self.canvas.yview); vscroll.pack(side="right", fill="y")
        self.canvas.configure(yscrollcommand=vscroll.set)

        self.items_frame = tk.Frame(self.canvas, bg="#ffffff")
        self.canvas.create_window((0,0), window=self.items_frame, anchor="nw")
        self.items_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))

        for c,h in enumerate(self.item_columns):
            tk.Label(self.items_frame, text=h, font=self.default_font, relief="raised",
                     width=18, bg="#dce9ff", fg="#003366").grid(row=0, column=c, padx=1, pady=1)

        for _ in range(6): self.add_item_row()

        hscroll = ttk.Scrollbar(frame, orient="horizontal", command=self.canvas.xview); hscroll.pack(fill="x")
        self.canvas.configure(xscrollcommand=hscroll.set)

        totals = tk.Frame(frame, bg="#e7f0ff"); totals.pack(fill="x", padx=6, pady=(10,6))
        for txt,var,w in [("Total Qty:",self.total_qty_var,10),("Total Wt:",self.total_wt_var,12),
                          ("Base Amt:",self.base_amt_var,14),("Disc Amt:",self.disc_amt_var,12),
                          ("Tax Amt:",self.tax_amt_var,12),("Net Amt:",self.net_amt_var,14)]:
            tk.Label(totals,text=txt,font=self.default_font,bg="#e7f0ff",fg="#004080").pack(side="left",padx=6)
            tk.Entry(totals,textvariable=var,width=w,font=self.default_font,
                     bg="#ffffff",relief="sunken",justify="right",state="readonly").pack(side="left")

    def add_item_row(self):
        row_widgets = []
        grid_row = len(self.item_entries)+1
        for c in range(len(self.item_columns)):
            ent = tk.Entry(self.items_frame, width=18, font=self.default_font, relief="groove", bg="#ffffff", justify="center")
            ent.grid(row=grid_row, column=c, padx=1, pady=1, ipady=4)
            ent.bind("<KeyRelease>", lambda ev:self.recalculate_items())
            row_widgets.append(ent)
        self.item_entries.append(row_widgets)

    def recalculate_items(self):
        total_qty=total_wt=total_base=total_disc=total_tax=total_net=0.0
        lot=1
        for row in self.item_entries:
            try:
                qty=float(row[2].get() or 0)
                wt=float(row[1].get() or 0)
                rate=float(row[5].get() or 0)
                disc=float(row[6].get() or 0)
                tax=float(row[7].get() or 0)
            except: qty=wt=rate=disc=tax=0
            base=qty*rate; disc_amt=base*disc/100; after_disc=base-disc_amt
            tax_amt=after_disc*tax/100; net=after_disc+tax_amt; tot_wt=qty*wt
            row[4].delete(0,tk.END); row[4].insert(0,f"{tot_wt:.2f}")
            row[8].delete(0,tk.END); row[8].insert(0,f"{net:.2f}")
            if qty>0: row[3].delete(0,tk.END); row[3].insert(0,str(lot)); lot+=1
            total_qty+=qty; total_wt+=tot_wt; total_base+=base; total_disc+=disc_amt
            total_tax+=tax_amt; total_net+=net
        self.total_qty_var.set(f"{total_qty:.2f}"); self.total_wt_var.set(f"{total_wt:.2f}")
        self.base_amt_var.set(f"{total_base:.2f}"); self.disc_amt_var.set(f"{total_disc:.2f}")
        self.tax_amt_var.set(f"{total_tax:.2f}"); self.net_amt_var.set(f"{total_net:.2f}")
        self.recalculate_deductions()
        if self.item_entries and (self.item_entries[-1][0].get().strip() or self.item_entries[-1][2].get().strip()):
            self.add_item_row()

    # ---------- Bottom Frame ----------
    def create_bottom_frame(self):
        frame=tk.Frame(self.root,bg="#e7f0ff"); frame.pack(fill="x", padx=10, pady=(0,5))
        left=tk.LabelFrame(frame,text="Bill Summary",font=self.default_font,bg="#e7f0ff",fg="#004080"); left.pack(side="left",fill="y",padx=6,pady=2)
        for i,(lbl,var) in enumerate([("Total Qty",self.total_qty_var),("Total Wt",self.total_wt_var),("Base Amount",self.base_amt_var),
                                      ("Discount Amount",self.disc_amt_var),("Tax Amount",self.tax_amt_var),("Net Amount",self.net_amt_var)]):
            tk.Label(left,text=lbl,font=self.default_font,bg="#e7f0ff",fg="#004080").grid(row=i,column=0,padx=6,pady=3,sticky="w")
            tk.Entry(left,textvariable=var,state="readonly",font=self.default_font,bg="#ffffff",width=18,justify="right").grid(row=i,column=1,padx=6,pady=3)
        right=tk.LabelFrame(frame,text="Deductions (Editable)",font=self.default_font,bg="#e7f0ff",fg="#004080"); right.pack(side="left",fill="both",expand=True,padx=6,pady=2)
        canvas_frame=tk.Frame(right,bg="#e7f0ff"); canvas_frame.pack(fill="both",expand=True)
        self.ded_canvas=tk.Canvas(canvas_frame,height=180,bg="#ffffff"); self.ded_canvas.pack(side="left",fill="both",expand=True)
        vscroll=ttk.Scrollbar(canvas_frame,orient="vertical",command=self.ded_canvas.yview); vscroll.pack(side="right",fill="y")
        self.ded_canvas.configure(yscrollcommand=vscroll.set)
        self.ded_frame=tk.Frame(self.ded_canvas,bg="#ffffff"); self.ded_canvas.create_window((0,0),window=self.ded_frame,anchor="nw")
        self.ded_frame.bind("<Configure>",lambda e:self.ded_canvas.configure(scrollregion=self.ded_canvas.bbox("all")))
        for c,h in enumerate(self.deduction_columns):
            tk.Label(self.ded_frame,text=h,font=self.default_font,relief="raised",bg="#dce9ff",fg="#003366",width=16).grid(row=0,column=c,padx=1,pady=1)
        for _ in range(4): self.add_deduction_row()
        bottom_right=tk.Frame(right,bg="#e7f0ff"); bottom_right.pack(fill="x",pady=(8,5))
        tk.Label(bottom_right,text="Deductions Total:",font=self.default_font,bg="#e7f0ff",fg="#004080").pack(side="left",padx=6)
        tk.Entry(bottom_right,textvariable=self.ded_total_var,width=16,font=self.default_font,state="readonly",bg="#ffffff",justify="right").pack(side="left",padx=6)
        tk.Label(bottom_right,text="Grand Net Amount:",font=self.default_font,bg="#e7f0ff",fg="#004080").pack(side="left",padx=10)
        tk.Entry(bottom_right,textvariable=self.grand_total_var,width=18,font=self.default_font,state="readonly",bg="#ffffff",justify="right").pack(side="left",padx=6)
        tk.Button(bottom_right,text="Save Purchase",font=self.default_font,bg="#004080",fg="#ffffff",command=self.save_purchase).pack(side="right",padx=8)

    def add_deduction_row(self):
        row_widgets=[]; grid_row=len(self.deduction_entries)+1
        for c in range(len(self.deduction_columns)):
            ent=tk.Entry(self.ded_frame,width=16,font=self.default_font,relief="groove",bg="#ffffff",justify="center")
            ent.grid(row=grid_row,column=c,padx=1,pady=1,ipady=4); ent.bind("<KeyRelease>",lambda ev:self.recalculate_deductions())
            row_widgets.append(ent)
        self.deduction_entries.append(row_widgets)

    def recalculate_deductions(self):
        try: net=float(self.net_amt_var.get() or 0.0)
        except: net=0.0
        ded_sum=0.0
        for row in self.deduction_entries:
            try: perc=float(row[1].get() or 0.0)
            except: perc=0.0
            try: amt=float(row[2].get() or 0.0)
            except: amt=0.0
            try: party=float(row[3].get() or 0.0)
            except: party=0.0
            total=(perc*net/100)+amt+party
            row[4].delete(0,tk.END); row[4].insert(0,f"{total:.2f}"); ded_sum+=total
        self.ded_total_var.set(f"{ded_sum:.2f}"); self.grand_total_var.set(f"{net+ded_sum:.2f}")
        if self.deduction_entries and any(row[0].get().strip() for row in [self.deduction_entries[-1]]): self.add_deduction_row()

    def save_purchase(self):
        try:
            conn=sqlite3.connect("inventory.db"); c=conn.cursor()
            c.execute('''INSERT INTO purchases(sno,inv_no,inv_date,datetime,supplier,addr1,addr2,pay_type,tax_type,godown,remarks,
                        total_qty,total_wt,base_amt,disc_amt,tax_amt,net_amt,ded_total,grand_total,created_at)
                        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',(
                            self.sno_var.get(), self.inv_no.get(), self.inv_date.get(), self.datetime_var.get(),
                            self.supplier_cb.get(), self.addr1.get(), self.addr2.get(), self.paytype.get(), self.tax_type.get(),
                            self.godown.get(), self.remarks.get(), float(self.total_qty_var.get() or 0),
                            float(self.total_wt_var.get() or 0), float(self.base_amt_var.get() or 0), float(self.disc_amt_var.get() or 0),
                            float(self.tax_amt_var.get() or 0), float(self.net_amt_var.get() or 0), float(self.ded_total_var.get() or 0),
                            float(self.grand_total_var.get() or 0), datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        ))
            purchase_id=c.lastrowid
            for row in self.item_entries:
                if not row[0].get().strip() and not row[1].get().strip(): continue
                c.execute('''INSERT INTO purchase_items(purchase_id,s_no,lot_no,item_name,weight,qty,total_wt,pur_rate,disc_perc,tax_perc,total_amt)
                             VALUES(?,?,?,?,?,?,?,?,?,?,?)''',(
                                 purchase_id,row[0].get(),row[3].get(),row[0].get(),float(row[1].get() or 0),
                                 float(row[2].get() or 0),float(row[4].get() or 0),float(row[5].get() or 0),
                                 float(row[6].get() or 0),float(row[7].get() or 0),float(row[8].get() or 0)
                             ))
            for row in self.deduction_entries:
                if not row[0].get().strip(): continue
                c.execute('''INSERT INTO purchase_deductions(purchase_id,description,perc,amount,party_amt,total)
                             VALUES(?,?,?,?,?,?)''',(
                                 purchase_id,row[0].get(),float(row[1].get() or 0),float(row[2].get() or 0),
                                 float(row[3].get() or 0),float(row[4].get() or 0)
                             ))
            conn.commit(); conn.close(); messagebox.showinfo("Saved","Purchase saved successfully!")
        except Exception as e: messagebox.showerror("Error",str(e))

# --------- MENU INTEGRATION ----------
def open_purchase_create():
    win = tk.Toplevel(root)
    win.title("Purchase Entry")
    win.geometry("1400x860")
    win.configure(bg="#ffffff")
    PurchaseWindow(win)
'''
def open_purchase_display():
    win = tk.Toplevel(root)
    win.title("Display Purchases")
    win.geometry("1000x500")
    win.configure(bg="#e7f0ff")
    tree = ttk.Treeview(win, columns=("S.No", "Inv No", "Date", "Supplier", "Total Qty", "Grand Total"), show="headings")
    for col in tree["columns"]:
        tree.heading(col, text=col)
        tree.column(col, width=160)
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT id, inv_no, inv_date, supplier, total_qty, grand_total FROM purchases")
    for row in c.fetchall():
        tree.insert("", "end", values=row)
    conn.close()
    tree.pack(fill="both", expand=True)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=12).pack(pady=10)
'''
def open_purchase_items_display():
    win = tk.Toplevel(root)
    win.title("Purchase Item Details")
    win.geometry("1200x500")
    win.configure(bg="#e6f0ff")

    # Columns for purchase item details
    columns = ("S.No", "Invoice No", "Item Name", "Qty", "Lot No", "Tot. Wt", "Rate", "Disc %", "Tax %", "Total Amt")
    tree = ttk.Treeview(win, columns=columns, show="headings")
    for col in columns:
        tree.heading(col, text=col)
        tree.column(col, width=120)

    # Get items from DB
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        SELECT purchase_items.id, purchases.inv_no, purchase_items.item_name,
               purchase_items.qty, purchase_items.lot_no, purchase_items.total_wt,
               purchase_items.pur_rate, purchase_items.disc_perc, purchase_items.tax_perc, purchase_items.total_amt
        FROM purchase_items
        JOIN purchases ON purchase_items.purchase_id = purchases.id
        ORDER BY purchase_items.id
    ''')
    for row in c.fetchall():
        tree.insert("", "end", values=row)
    conn.close()

    tree.pack(fill="both", expand=True, padx=10, pady=10)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=12).pack(pady=8)

def open_purchase_edit():
    win = tk.Toplevel(root)
    win.title("Edit/Update/Delete Purchases (Date Range)")
    win.geometry("1200x600")
    win.configure(bg="#e7f0ff")

    # Date range selection
    tk.Label(win, text="From Date (dd-mm-yyyy):", bg="#e7f0ff").pack(side="top", padx=4, pady=3)
    from_date = tk.Entry(win, width=14)
    from_date.pack(side="top", padx=2)
    from_date.insert(0, datetime.now().strftime("%d-%m-%Y"))
    tk.Label(win, text="To Date (dd-mm-yyyy):", bg="#e7f0ff").pack(side="top", padx=4, pady=3)
    to_date = tk.Entry(win, width=14)
    to_date.pack(side="top", padx=2)
    to_date.insert(0, datetime.now().strftime("%d-%m-%Y"))
    def load_purchases():
        tree.delete(*tree.get_children())
        conn = sqlite3.connect("inventory.db")
        c = conn.cursor()
        f_date = datetime.strptime(from_date.get(), "%d-%m-%Y")
        t_date = datetime.strptime(to_date.get(), "%d-%m-%Y")
        c.execute('''SELECT id, inv_no, inv_date, supplier FROM purchases
                     WHERE date(substr(inv_date,7,4)||'-'||substr(inv_date,4,2)||'-'||substr(inv_date,1,2))
                     BETWEEN ? AND ?''', (f_date.strftime("%Y-%m-%d"), t_date.strftime("%Y-%m-%d")))
        results = c.fetchall()
        for pur in results:
            c.execute('''SELECT item_name, qty, lot_no, total_wt, pur_rate, disc_perc, tax_perc, total_amt 
                        FROM purchase_items WHERE purchase_id=?''', (pur[0],))
            items = c.fetchall()
            if not items: # Show at least the header row if no items
                tree.insert("", "end", values=(pur[1], pur[2], pur[3], "", "", "", "", "", "", "", ""))
            else:
                for item in items:
                    tree.insert("", "end", values=(pur[1], pur[2], pur[3], *item))
        conn.close()

    tk.Button(win, text="Load", command=load_purchases, bg="#005F99", fg="white").pack(side="top", padx=8)

    # Columns
    columns = ("Invoice No", "Inv Date", "Supplier", "Item Name", "Qty", "Lot No", "Tot. Wt",
               "Rate", "Disc %", "Tax %", "Total Amt")
    tree = ttk.Treeview(win, columns=columns, show="headings", height=16)
    for col in columns:
        tree.heading(col, text=col)
        tree.column(col, width=100)
    tree.pack(fill="both", expand=True, padx=8, pady=16)

    # Editing selected purchase
    def edit_selected():
        selected = tree.focus()
        vals = tree.item(selected)["values"]
        if not vals:
            messagebox.showwarning("Select", "Select a row to edit.")
            return
        inv_no = vals[0]
        # Load full edit interface for this invoice number as before...
        # (You can pop up the detailed edit window shown in previous replies, loading by inv_no)

    tk.Button(win, text="Edit Selected", command=edit_selected, bg="#4CAF50", fg="white", width=14).pack(side="left", padx=5)
    def delete_selected():
        selected = tree.focus()
        vals = tree.item(selected)["values"]
        if not vals:
            messagebox.showwarning("Select", "Select a row to delete.")
            return
        inv_no = vals[0]
        if messagebox.askyesno("Confirm Delete", f"Delete invoice {inv_no}?"):
            conn = sqlite3.connect("inventory.db")
            c = conn.cursor()
            # Remove purchase and item rows
            c.execute("SELECT id FROM purchases WHERE inv_no=?", (inv_no,))
            row = c.fetchone()
            if row:
                pid = row[0]
                c.execute("DELETE FROM purchase_items WHERE purchase_id=?", (pid,))
                c.execute("DELETE FROM purchase_deductions WHERE purchase_id=?", (pid,))
                c.execute("DELETE FROM purchases WHERE id=?", (pid,))
            conn.commit()
            conn.close()
            tree.delete(selected)
            messagebox.showinfo("Deleted", f"Purchase {inv_no} deleted.")
    tk.Button(win, text="Delete Selected", command=delete_selected, bg="#FF5733", fg="white", width=14).pack(side="left", padx=5)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=14).pack(side="right", padx=12)

entry_menu = tk.Menu(menubar, tearoff=0)
purchase_menu = tk.Menu(entry_menu, tearoff=0)
purchase_menu.add_command(label="Create", command=open_purchase_create)
purchase_menu.add_command(label="Display", command=open_purchase_items_display)
purchase_menu.add_command(label="Edit/Update/Delete", command=open_purchase_edit)
entry_menu.add_cascade(label="Purchase", menu=purchase_menu)
menubar.add_cascade(label="Entry", menu=entry_menu)



# ENTRY MENU (dummy)

for main in ["Purchase Order","Purchase Return","Grind","Flour Out","Flour Out Return","Papad In","Sales","Sales Order","Quotation","Sales Return","Stock Adjust","Packing","Weight","Conversion","Advance","Open","Papad Adjust","Voucher"]:
    submenu = tk.Menu(entry_menu, tearoff=0)
    for s in ["Entry","Display","Print"]:
        submenu.add_command(label=s, command=lambda:messagebox.showinfo("Info","Under Development"))
    entry_menu.add_cascade(label=main, menu=submenu)


# MASTER MENU
master_menu = tk.Menu(menubar, tearoff=0)
# Item submenu
item_menu = tk.Menu(master_menu, tearoff=0)
item_menu.add_command(label="Create", command=open_create_item)
item_menu.add_command(label="Display", command=open_display_item)
item_menu.add_command(label="Edit/Update", command=open_edit_item)
master_menu.add_cascade(label="Item", menu=item_menu)

# ==============================================================
# ITEM GROUP MASTER MODULE  (add below your imports and DB setup)
# ==============================================================

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sqlite3
import pandas as pd

# ---------- DATABASE SETUP & SAFE ALTER ----------
conn = sqlite3.connect("inventory.db")
cursor = conn.cursor()
cursor.execute("""
    CREATE TABLE IF NOT EXISTS item_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT
    )
""")

# Safe add columns (avoids duplicate / UNIQUE crash)
safe_columns = {
    "group_code": "TEXT",
    "group_name": "TEXT",
    "print_name": "TEXT",
    "tax": "REAL"
}
for col, dtype in safe_columns.items():
    cursor.execute(f"PRAGMA table_info(item_groups)")
    existing_cols = [r[1] for r in cursor.fetchall()]
    if col not in existing_cols:
        cursor.execute(f"ALTER TABLE item_groups ADD COLUMN {col} {dtype}")

conn.commit()


# ---------- Helper ----------
def get_next_group_code():
    cursor.execute("SELECT MAX(id) FROM item_groups")
    last_id = cursor.fetchone()[0]
    return f"GRP{(last_id + 1) if last_id else 1:04d}"


# ==============================================================
# 1️⃣ CREATE ITEM GROUP WINDOW
# ==============================================================
def open_item_group_create():
    win = tk.Toplevel(root)
    win.title("Create Item Group")
    win.geometry("500x400")
    win.config(bg="#E6F0FA")
    win.grab_set()

    tk.Label(win, text="🆕 Create Item Group", font=("Segoe UI", 14, "bold"),
             bg="#005F99", fg="white", pady=10).pack(fill="x")

    frm = tk.Frame(win, bg="#E6F0FA", padx=20, pady=20)
    frm.pack(fill="both", expand=True)

    group_code = tk.StringVar(value=get_next_group_code())
    group_name = tk.StringVar()
    print_name = tk.StringVar()
    tax = tk.StringVar()

    def add_row(row, label, var):
        tk.Label(frm, text=label, bg="#E6F0FA", anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        tk.Entry(frm, textvariable=var, width=35).grid(row=row, column=1, pady=5)

    add_row(0, "Group Code:", group_code)
    add_row(1, "Group Name:", group_name)
    add_row(2, "Print Name:", print_name)
    add_row(3, "Tax (%):", tax)

    def save_group():
        if not group_name.get().strip():
            messagebox.showwarning("Warning", "Group Name is required!")
            return
        try:
            cursor.execute("""
                INSERT INTO item_groups (group_code, group_name, print_name, tax)
                VALUES (?, ?, ?, ?)
            """, (group_code.get(), group_name.get(), print_name.get(), tax.get() or 0))
            conn.commit()
            messagebox.showinfo("Success", "Item Group added successfully!")
            group_code.set(get_next_group_code())
            group_name.set("")
            print_name.set("")
            tax.set("")
        except sqlite3.IntegrityError:
            messagebox.showerror("Error", "Group Code already exists!")

    btnf = tk.Frame(win, bg="#E6F0FA")
    btnf.pack(pady=10)
    tk.Button(btnf, text="💾 Save", bg="#005F99", fg="white", width=12, command=save_group).grid(row=0, column=0, padx=10)
    tk.Button(btnf, text="❌ Close", bg="#f44336", fg="white", width=12, command=win.destroy).grid(row=0, column=1, padx=10)


# ==============================================================
# 2️⃣ DISPLAY ITEM GROUP WINDOW
# ==============================================================
def open_item_group_display():
    win = tk.Toplevel(root)
    win.title("Display Item Groups")
    win.geometry("700x500")
    win.config(bg="#E6F0FA")
    win.grab_set()

    tk.Label(win, text="📋 Item Group List", font=("Segoe UI", 14, "bold"),
             bg="#005F99", fg="white", pady=10).pack(fill="x")

    search_var = tk.StringVar()

    sf = tk.Frame(win, bg="#E6F0FA")
    sf.pack(fill="x", padx=10, pady=5)
    tk.Label(sf, text="Search:", bg="#E6F0FA").pack(side="left", padx=5)
    tk.Entry(sf, textvariable=search_var, width=40).pack(side="left", padx=5)

    cols = ("group_code", "group_name", "print_name", "tax")
    tree = ttk.Treeview(win, columns=cols, show="headings")
    for c in cols:
        tree.heading(c, text=c.replace("_", " ").title())
        tree.column(c, width=150, anchor="center")
    tree.pack(fill="both", expand=True, padx=10, pady=10)

    def load_data(*args):
        for i in tree.get_children():
            tree.delete(i)
        q = search_var.get()
        if q:
            cursor.execute("SELECT group_code, group_name, print_name, tax FROM item_groups WHERE group_name LIKE ? OR group_code LIKE ?", (f"%{q}%", f"%{q}%"))
        else:
            cursor.execute("SELECT group_code, group_name, print_name, tax FROM item_groups")
        for row in cursor.fetchall():
            tree.insert("", "end", values=row)

    search_var.trace("w", load_data)
    load_data()

    def export_excel():
        data = [tree.item(i)["values"] for i in tree.get_children()]
        if not data:
            messagebox.showinfo("Info", "No data to export")
            return
        df = pd.DataFrame(data, columns=cols)
        file = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel files", "*.xlsx")])
        if file:
            df.to_excel(file, index=False)
            messagebox.showinfo("Exported", "Data exported successfully!")

    bf = tk.Frame(win, bg="#E6F0FA")
    bf.pack(pady=10)
    tk.Button(bf, text="📤 Export Excel", bg="#4CAF50", fg="white", width=15, command=export_excel).pack(side="left", padx=5)
    tk.Button(bf, text="❌ Close", bg="#f44336", fg="white", width=12, command=win.destroy).pack(side="right", padx=5)


# ==============================================================
# 3️⃣ EDIT / UPDATE ITEM GROUP WINDOW
# ==============================================================
def open_item_group_edit():
    win = tk.Toplevel(root)
    win.title("Edit / Update Item Group")
    win.geometry("500x420")
    win.config(bg="#E6F0FA")
    win.grab_set()

    tk.Label(win, text="✏️ Edit Item Group", font=("Segoe UI", 14, "bold"),
             bg="#005F99", fg="white", pady=10).pack(fill="x")

    frm = tk.Frame(win, bg="#E6F0FA", padx=20, pady=20)
    frm.pack(fill="both", expand=True)

    code_var = tk.StringVar()
    name_var = tk.StringVar()
    print_var = tk.StringVar()
    tax_var = tk.StringVar()

    tk.Label(frm, text="Select Group Code:", bg="#E6F0FA").grid(row=0, column=0, sticky="w", pady=5)
    cursor.execute("SELECT group_code FROM item_groups")
    codes = [r[0] for r in cursor.fetchall()]
    code_combo = ttk.Combobox(frm, values=codes, textvariable=code_var, width=30)
    code_combo.grid(row=0, column=1, pady=5)

    def add_row(row, label, var):
        tk.Label(frm, text=label, bg="#E6F0FA").grid(row=row, column=0, sticky="w", pady=5)
        tk.Entry(frm, textvariable=var, width=35).grid(row=row, column=1, pady=5)

    add_row(1, "Group Name:", name_var)
    add_row(2, "Print Name:", print_var)
    add_row(3, "Tax (%):", tax_var)

    def load_selected(event=None):
        cursor.execute("SELECT group_name, print_name, tax FROM item_groups WHERE group_code=?", (code_var.get(),))
        r = cursor.fetchone()
        if r:
            name_var.set(r[0])
            print_var.set(r[1])
            tax_var.set(r[2])

    code_combo.bind("<<ComboboxSelected>>", load_selected)

    def update_group():
        cursor.execute("UPDATE item_groups SET group_name=?, print_name=?, tax=? WHERE group_code=?",
                       (name_var.get(), print_var.get(), tax_var.get(), code_var.get()))
        conn.commit()
        messagebox.showinfo("Updated", "Group details updated successfully!")

    bf = tk.Frame(win, bg="#E6F0FA")
    bf.pack(pady=10)
    tk.Button(bf, text="💾 Update", bg="#4CAF50", fg="white", width=12, command=update_group).grid(row=0, column=0, padx=10)
    tk.Button(bf, text="❌ Close", bg="#f44336", fg="white", width=12, command=win.destroy).grid(row=0, column=1, padx=10)


# In your Master menu setup:
item_group_menu = tk.Menu(master_menu, tearoff=0)
item_group_menu.add_command(label="Create", command=open_item_group_create)
item_group_menu.add_command(label="Display", command=open_item_group_display)
item_group_menu.add_command(label="Edit/Update", command=open_item_group_edit)
master_menu.add_cascade(label="Item Group", menu=item_group_menu)

# ---------- DEDUCTION SALES MODULE ----------
import pandas as pd
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import tempfile, os

# ---------- Database Safe Setup ----------
conn = sqlite3.connect("inventory.db")
cursor = conn.cursor()
cursor.execute("""CREATE TABLE IF NOT EXISTS deduction_sales (id INTEGER PRIMARY KEY AUTOINCREMENT)""")

safe_columns = {
    "ded_code": "TEXT",
    "ded_name": "TEXT",
    "print_name": "TEXT",
    "adjust_with_sales": "TEXT",
    "account_head": "TEXT",
    "ded_type": "TEXT",
    "calc_type": "TEXT"
}
cursor.execute("PRAGMA table_info(deduction_sales)")
existing = [r[1] for r in cursor.fetchall()]
for col, dtype in safe_columns.items():
    if col not in existing:
        cursor.execute(f"ALTER TABLE deduction_sales ADD COLUMN {col} {dtype}")
conn.commit()

def next_deduction_code():
    cursor.execute("SELECT MAX(id) FROM deduction_sales")
    last = cursor.fetchone()[0]
    return f"DED{(last or 0) + 1:03d}"

# ---------- CREATE ----------
def open_deduction_create():
    win = tk.Toplevel(root)
    win.title("Create Deduction (Sales)")
    win.geometry("600x500")
    win.config(bg="#E6F0FA")
    win.grab_set()
    tk.Label(win, text="🧾 Create Deduction (Sales)", font=("Segoe UI", 14, "bold"),
             bg="#005F99", fg="white", pady=10).pack(fill="x")

    frm = tk.Frame(win, bg="#E6F0FA", padx=30, pady=20)
    frm.pack(fill="both", expand=True)

    ded_code = tk.StringVar(value=next_deduction_code())
    ded_name = tk.StringVar()
    print_name = tk.StringVar()
    adjust_var = tk.StringVar(value="Yes")
    account_head = tk.StringVar()
    ded_type = tk.StringVar(value="Add")
    calc_type = tk.StringVar(value="Amount")

    def add_field(r, lbl, widget):
        f = tk.Frame(frm, bg="#E6F0FA")
        f.pack(fill="x", pady=5)
        tk.Label(f, text=lbl, bg="#E6F0FA", fg="#005F99", font=("Segoe UI", 10, "bold"), width=22, anchor="w").pack(side="left")
        widget.pack(fill="x", expand=True, padx=10)

    add_field(0, "Deduction Code:", tk.Entry(frm, textvariable=ded_code))
    add_field(1, "Deduction Name:", tk.Entry(frm, textvariable=ded_name))
    add_field(2, "Print Name:", tk.Entry(frm, textvariable=print_name))
    add_field(3, "Adjust with Sales Amount:", ttk.Combobox(frm, values=["Yes","No"], textvariable=adjust_var, state="readonly"))
    add_field(4, "Account Head:", tk.Entry(frm, textvariable=account_head))
    add_field(5, "Deduction Type:", ttk.Combobox(frm, values=["Add","Subtract"], textvariable=ded_type, state="readonly"))
    add_field(6, "Calculation Type:", ttk.Combobox(frm, values=["Amount","%"], textvariable=calc_type, state="readonly"))

    def save_ded():
        if not ded_name.get().strip():
            messagebox.showwarning("Warning", "Deduction Name required!")
            return
        cursor.execute("""INSERT INTO deduction_sales
            (ded_code,ded_name,print_name,adjust_with_sales,account_head,ded_type,calc_type)
            VALUES (?,?,?,?,?,?,?)""",
            (ded_code.get(), ded_name.get(), print_name.get(), adjust_var.get(),
             account_head.get(), ded_type.get(), calc_type.get()))
        conn.commit()
        messagebox.showinfo("Success", "Deduction added successfully!")
        ded_code.set(next_deduction_code())
        ded_name.set(""); print_name.set(""); account_head.set("")

    tk.Button(frm, text="💾 Save", bg="#005F99", fg="white", font=("Segoe UI",11,"bold"),
              command=save_ded).pack(fill="x", pady=20)

# ---------- DISPLAY ----------
def open_deduction_display():
    win = tk.Toplevel(root)
    win.title("Display Deductions (Sales)")
    win.geometry("950x550")
    win.config(bg="#E6F0FA")
    win.grab_set()

    tk.Label(win, text="📋 Deductions List", font=("Segoe UI",14,"bold"),
             bg="#005F99", fg="white", pady=10).pack(fill="x")

    search_var = tk.StringVar()
    sf = tk.Frame(win, bg="#E6F0FA")
    sf.pack(fill="x", padx=10, pady=5)
    tk.Label(sf, text="Search:", bg="#E6F0FA").pack(side="left", padx=5)
    tk.Entry(sf, textvariable=search_var, width=40).pack(side="left", padx=5)

    cols = ("ded_code","ded_name","print_name","adjust_with_sales","account_head","ded_type","calc_type")
    tree = ttk.Treeview(win, columns=cols, show="headings")
    for c in cols:
        tree.heading(c, text=c.replace("_"," ").title())
        tree.column(c, width=130, anchor="center")
    tree.pack(fill="both", expand=True, padx=10, pady=10)

    def load(*_):
        tree.delete(*tree.get_children())
        q = f"%{search_var.get()}%"
        cursor.execute("""SELECT ded_code,ded_name,print_name,adjust_with_sales,account_head,ded_type,calc_type
                          FROM deduction_sales WHERE ded_name LIKE ? OR ded_code LIKE ?""", (q,q))
        for r in cursor.fetchall():
            tree.insert("", "end", values=r)
    search_var.trace("w", load)
    load()

    # ---------- Export / Print ----------
    def export_excel():
        rows = [tree.item(i)["values"] for i in tree.get_children()]
        if not rows:
            messagebox.showinfo("Info","No data to export!")
            return
        df = pd.DataFrame(rows, columns=cols)
        file = filedialog.asksaveasfilename(defaultextension=".xlsx")
        if file:
            df.to_excel(file, index=False)
            messagebox.showinfo("Exported","Excel exported successfully!")

    def export_pdf():
        rows = [tree.item(i)["values"] for i in tree.get_children()]
        if not rows:
            messagebox.showinfo("Info","No data to export!")
            return
        file = filedialog.asksaveasfilename(defaultextension=".pdf")
        if not file: return
        doc = SimpleDocTemplate(file, pagesize=A4)
        styles = getSampleStyleSheet()
        data = [cols] + rows
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#005F99")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ]))
        doc.build([Paragraph("Deduction Sales Report", styles["Heading2"]), Spacer(1,10), table])
        messagebox.showinfo("Exported","PDF exported successfully!")

    def print_table():
        tmp = tempfile.mktemp(".txt")
        rows = [tree.item(i)["values"] for i in tree.get_children()]
        with open(tmp,"w",encoding="utf-8") as f:
            f.write("Deduction Sales Report\n\n")
            for r in rows:
                f.write("\t".join(map(str,r)) + "\n")
        os.startfile(tmp, "print")

    bf = tk.Frame(win, bg="#E6F0FA")
    bf.pack(pady=10)
    tk.Button(bf, text="📤 Excel", bg="#4CAF50", fg="white", width=15, command=export_excel).pack(side="left", padx=5)
    tk.Button(bf, text="📄 PDF", bg="#2196F3", fg="white", width=15, command=export_pdf).pack(side="left", padx=5)
    tk.Button(bf, text="🖨️ Print", bg="#9C27B0", fg="white", width=15, command=print_table).pack(side="left", padx=5)
    tk.Button(bf, text="❌ Close", bg="#f44336", fg="white", width=12, command=win.destroy).pack(side="right", padx=5)

# ---------- EDIT / UPDATE / DELETE ----------
def open_deduction_edit():
    win = tk.Toplevel(root)
    win.title("Edit / Delete Deduction (Sales)")
    win.geometry("600x520")
    win.config(bg="#E6F0FA")
    win.grab_set()

    # ----- Header -----
    tk.Label(win, text="✏️ Edit / Delete Deduction (Sales)", font=("Segoe UI", 14, "bold"),
             bg="#005F99", fg="white", pady=10).pack(fill="x")

    # ----- Frame -----
    frm = tk.Frame(win, bg="#E6F0FA", padx=20, pady=20)
    frm.pack(fill="both", expand=True)

    # ----- Dropdown for selecting record -----
    code_var = tk.StringVar()
    cursor.execute("SELECT ded_code FROM deduction_sales ORDER BY ded_code")
    codes = [r[0] for r in cursor.fetchall()]
    ttk.Label(frm, text="Select Code:", background="#E6F0FA", foreground="#005F99",
              font=("Segoe UI", 10, "bold")).grid(row=0, column=0, sticky="w", pady=5)
    code_box = ttk.Combobox(frm, values=codes, textvariable=code_var, width=30, state="readonly")
    code_box.grid(row=0, column=1, pady=5, sticky="ew")

    # ----- Variables -----
    name_var = tk.StringVar()
    print_var = tk.StringVar()
    adj_var = tk.StringVar()
    acc_var = tk.StringVar()
    type_var = tk.StringVar()
    calc_var = tk.StringVar()

    # ----- Field Layout -----
    fields = [
        ("Deduction Name:", name_var),
        ("Print Name:", print_var),
        ("Adjust with Sales:", adj_var),
        ("Account Head:", acc_var),
        ("Deduction Type:", type_var),
        ("Calculation Type:", calc_var)
    ]

    for i, (label, var) in enumerate(fields, start=1):
        tk.Label(frm, text=label, bg="#E6F0FA", fg="#005F99", font=("Segoe UI", 10, "bold")).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(frm, textvariable=var, width=35).grid(row=i, column=1, pady=5, sticky="ew")

    frm.columnconfigure(1, weight=1)

    # ----- Load selected record -----
    def load_selected(event=None):
        cursor.execute("""
            SELECT ded_name, print_name, adjust_with_sales, account_head, ded_type, calc_type
            FROM deduction_sales WHERE ded_code=?
        """, (code_var.get(),))
        r = cursor.fetchone()
        if r:
            name_var.set(r[0])
            print_var.set(r[1])
            adj_var.set(r[2])
            acc_var.set(r[3])
            type_var.set(r[4])
            calc_var.set(r[5])

    code_box.bind("<<ComboboxSelected>>", load_selected)

    # ----- Update record -----
    def update_record():
        if not code_var.get():
            messagebox.showwarning("Select Record", "Please select a deduction code to update.")
            return
        cursor.execute("""
            UPDATE deduction_sales SET
                ded_name=?, print_name=?, adjust_with_sales=?, account_head=?, ded_type=?, calc_type=?
            WHERE ded_code=?
        """, (name_var.get(), print_var.get(), adj_var.get(), acc_var.get(),
              type_var.get(), calc_var.get(), code_var.get()))
        conn.commit()
        messagebox.showinfo("Updated", "Deduction updated successfully!")

    # ----- Delete record -----
    def delete_record():
        if not code_var.get():
            messagebox.showwarning("Select Record", "Please select a deduction code to delete.")
            return
        confirm = messagebox.askyesno("Confirm Delete",
                                      f"Are you sure you want to delete deduction '{code_var.get()}'?")
        if confirm:
            cursor.execute("DELETE FROM deduction_sales WHERE ded_code=?", (code_var.get(),))
            conn.commit()
            messagebox.showinfo("Deleted", f"Deduction '{code_var.get()}' deleted successfully!")
            # Clear all fields
            name_var.set(""); print_var.set(""); adj_var.set("")
            acc_var.set(""); type_var.set(""); calc_var.set("")
            # Refresh dropdown list
            cursor.execute("SELECT ded_code FROM deduction_sales ORDER BY ded_code")
            codes = [r[0] for r in cursor.fetchall()]
            code_box["values"] = codes
            code_var.set("")

    # ----- Buttons -----
    bf = tk.Frame(win, bg="#E6F0FA")
    bf.pack(pady=20, fill="x")

    tk.Button(bf, text="💾 Update", bg="#4CAF50", fg="white", font=("Segoe UI", 10, "bold"),
              width=15, command=update_record).pack(side="left", padx=10)
    tk.Button(bf, text="🗑️ Delete", bg="#FF5733", fg="white", font=("Segoe UI", 10, "bold"),
              width=15, command=delete_record).pack(side="left", padx=10)
    tk.Button(bf, text="❌ Close", bg="#005F99", fg="white", font=("Segoe UI", 10, "bold"),
              width=15, command=win.destroy).pack(side="right", padx=10)

deduction_sales_menu = tk.Menu(master_menu, tearoff=0)
deduction_sales_menu.add_command(label="Create", command=open_deduction_create)
deduction_sales_menu.add_command(label="Display", command=open_deduction_display)
deduction_sales_menu.add_command(label="Edit/Update", command=open_deduction_edit)
deduction_sales_menu.add_command(label="Print", command=open_deduction_display)  # same display window handles export/print
master_menu.add_cascade(label="Deduction Sales", menu=deduction_sales_menu)

# deduction purchase menu

# ==============================================================
# DEDUCTION PURCHASE MODULE
# ==============================================================

# Safe table setup
cursor.execute("""CREATE TABLE IF NOT EXISTS deduction_purchase (id INTEGER PRIMARY KEY AUTOINCREMENT)""")
safe_cols = {
    "ded_code":"TEXT",
    "ded_name":"TEXT",
    "print_name":"TEXT",
    "debit_adjust":"TEXT",
    "account_head":"TEXT",
    "credit_adjust":"TEXT",
    "ded_type":"TEXT",
    "calc_type":"TEXT"
}
cursor.execute("PRAGMA table_info(deduction_purchase)")
existing_cols = [r[1] for r in cursor.fetchall()]
for col,dtype in safe_cols.items():
    if col not in existing_cols:
        cursor.execute(f"ALTER TABLE deduction_purchase ADD COLUMN {col} {dtype}")
conn.commit()

def next_ded_purchase_code():
    cursor.execute("SELECT MAX(id) FROM deduction_purchase")
    last = cursor.fetchone()[0]
    return f"DP{(last or 0)+1:03d}"

# ---------- CREATE ----------
def open_deduction_purchase_create():
    win = tk.Toplevel(root)
    win.title("Create Deduction (Purchase)")
    win.geometry("600x550")
    win.config(bg=FRAME_BG)
    win.grab_set()
    tk.Label(win, text="🧾 Create Deduction (Purchase)", font=("Segoe UI",14,"bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    frm = tk.Frame(win, bg=FRAME_BG, padx=20, pady=20)
    frm.pack(fill="both", expand=True)

    ded_code = tk.StringVar(value=next_ded_purchase_code())
    ded_name = tk.StringVar()
    print_name = tk.StringVar()
    debit_adjust = tk.StringVar(value="Purchase")
    account_head = tk.StringVar()
    credit_adjust = tk.StringVar(value="Supplier")
    ded_type = tk.StringVar(value="Add")
    calc_type = tk.StringVar(value="Amount")

    fields = [
        ("Deduction Code:", ded_code),
        ("Deduction Name:", ded_name),
        ("Print Name:", print_name),
        ("Debit Adjust (Purchase/A/c Head):", debit_adjust),
        ("Account Head:", account_head),
        ("Credit Adjust (Supplier/Cash):", credit_adjust),
        ("Deduction Type (Add/Sub):", ded_type),
        ("Calculation Type (Amount/%):", calc_type)
    ]

    for i,(lbl,var) in enumerate(fields):
        tk.Label(frm, text=lbl, bg=FRAME_BG, fg="#005F99", font=("Segoe UI",10,"bold")).grid(row=i,column=0,sticky="w", pady=5)
        if "Adjust" in lbl or "Type" in lbl:
            ttk.Combobox(frm, values=["Purchase","A/c Head"] if "Debit" in lbl else ["Supplier","Cash"] if "Credit" in lbl else ["Add","Subtract"] if "Deduction" in lbl else ["Amount","%"], textvariable=var, state="readonly", width=30).grid(row=i,column=1,pady=5)
        else:
            tk.Entry(frm,textvariable=var,width=32).grid(row=i,column=1,pady=5)

    def save_ded_purchase():
        if not ded_name.get().strip():
            messagebox.showwarning("Validation","Deduction Name required!")
            return
        cursor.execute("""INSERT INTO deduction_purchase
            (ded_code,ded_name,print_name,debit_adjust,account_head,credit_adjust,ded_type,calc_type)
            VALUES (?,?,?,?,?,?,?,?)""",
            (ded_code.get(),ded_name.get(),print_name.get(),debit_adjust.get(),account_head.get(),
             credit_adjust.get(),ded_type.get(),calc_type.get()))
        conn.commit()
        messagebox.showinfo("Success","Deduction Purchase added successfully!")
        ded_code.set(next_ded_purchase_code())
        ded_name.set(""); print_name.set(""); account_head.set("")

    tk.Button(frm, text="💾 Save", bg=BUTTON_BG, fg=BUTTON_FG, width=15, command=save_ded_purchase).grid(row=len(fields),columnspan=2,pady=20)

# ---------- DISPLAY / PRINT ----------
def open_deduction_purchase_display():
    win = tk.Toplevel(root)
    win.title("Display Deduction (Purchase)")
    win.geometry("950x550")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="📋 Deduction Purchase List", font=("Segoe UI",14,"bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    search_var = tk.StringVar()
    sf = tk.Frame(win, bg=FRAME_BG)
    sf.pack(fill="x", padx=10, pady=5)
    tk.Label(sf,text="Search:", bg=FRAME_BG).pack(side="left", padx=5)
    tk.Entry(sf, textvariable=search_var, width=40).pack(side="left", padx=5)

    cols = ("ded_code","ded_name","print_name","debit_adjust","account_head","credit_adjust","ded_type","calc_type")
    tree = ttk.Treeview(win, columns=cols, show="headings")
    for c in cols:
        tree.heading(c,text=c.replace("_"," ").title())
        tree.column(c,width=120,anchor="center")
    tree.pack(fill="both", expand=True, padx=10, pady=10)

    def load(*_):
        tree.delete(*tree.get_children())
        q = f"%{search_var.get()}%"
        cursor.execute("""SELECT ded_code,ded_name,print_name,debit_adjust,account_head,credit_adjust,ded_type,calc_type
                          FROM deduction_purchase WHERE ded_name LIKE ? OR ded_code LIKE ?""",(q,q))
        for r in cursor.fetchall():
            tree.insert("", "end", values=r)
    search_var.trace("w", load)
    load()

    def export_excel():
        rows = [tree.item(i)["values"] for i in tree.get_children()]
        if not rows: messagebox.showinfo("Info","No data to export!"); return
        df = pd.DataFrame(rows, columns=cols)
        file = filedialog.asksaveasfilename(defaultextension=".xlsx")
        if file:
            df.to_excel(file,index=False)
            messagebox.showinfo("Exported","Excel exported successfully!")

    tk.Button(win, text="📤 Export Excel", bg="#4CAF50", fg="white", width=15, command=export_excel).pack(pady=10, side="left", padx=10)
    tk.Button(win, text="❌ Close", bg="#f44336", fg="white", width=12, command=win.destroy).pack(pady=10, side="right", padx=10)

# ---------- EDIT / UPDATE / DELETE ----------
def open_deduction_purchase_edit():
    win = tk.Toplevel(root)
    win.title("Edit / Delete Deduction Purchase")
    win.geometry("600x550")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="✏️ Edit / Delete Deduction Purchase", font=("Segoe UI",14,"bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    frm = tk.Frame(win, bg=FRAME_BG, padx=20, pady=20)
    frm.pack(fill="both", expand=True)

    code_var = tk.StringVar()
    cursor.execute("SELECT ded_code FROM deduction_purchase ORDER BY ded_code")
    codes = [r[0] for r in cursor.fetchall()]
    tk.Label(frm,text="Select Code:", bg=FRAME_BG,fg="#005F99").grid(row=0,column=0,sticky="w", pady=5)
    code_box = ttk.Combobox(frm, values=codes, textvariable=code_var, width=30, state="readonly")
    code_box.grid(row=0,column=1,pady=5, sticky="ew")

    name_var = tk.StringVar()
    print_var = tk.StringVar()
    debit_var = tk.StringVar()
    acc_var = tk.StringVar()
    credit_var = tk.StringVar()
    type_var = tk.StringVar()
    calc_var = tk.StringVar()

    fields = [
        ("Deduction Name:", name_var),
        ("Print Name:", print_var),
        ("Debit Adjust:", debit_var),
        ("Account Head:", acc_var),
        ("Credit Adjust:", credit_var),
        ("Deduction Type:", type_var),
        ("Calculation Type:", calc_var)
    ]

    for i,(lbl,var) in enumerate(fields,start=1):
        tk.Label(frm,text=lbl,bg=FRAME_BG,fg="#005F99").grid(row=i,column=0,sticky="w", pady=5)
        tk.Entry(frm,textvariable=var,width=35).grid(row=i,column=1,pady=5)

    def load_selected(event=None):
        cursor.execute("""SELECT ded_name,print_name,debit_adjust,account_head,credit_adjust,ded_type,calc_type
                          FROM deduction_purchase WHERE ded_code=?""",(code_var.get(),))
        r = cursor.fetchone()
        if r:
            name_var.set(r[0]); print_var.set(r[1]); debit_var.set(r[2])
            acc_var.set(r[3]); credit_var.set(r[4]); type_var.set(r[5]); calc_var.set(r[6])
    code_box.bind("<<ComboboxSelected>>", load_selected)

    def update_record():
        if not code_var.get(): messagebox.showwarning("Select Record","Select a code!"); return
        cursor.execute("""UPDATE deduction_purchase SET ded_name=?, print_name=?, debit_adjust=?, account_head=?, credit_adjust=?, ded_type=?, calc_type=? WHERE ded_code=?""",
                       (name_var.get(), print_var.get(), debit_var.get(), acc_var.get(), credit_var.get(), type_var.get(), calc_var.get(), code_var.get()))
        conn.commit()
        messagebox.showinfo("Updated","Deduction Purchase updated successfully!")

    def delete_record():
        if not code_var.get(): messagebox.showwarning("Select Record","Select a code!"); return
        if messagebox.askyesno("Confirm Delete",f"Delete '{code_var.get()}'?"):
            cursor.execute("DELETE FROM deduction_purchase WHERE ded_code=?",(code_var.get(),))
            conn.commit()
            messagebox.showinfo("Deleted","Deleted successfully!")
            name_var.set(); print_var.set(); debit_var.set(); acc_var.set(); credit_var.set(); type_var.set(); calc_var.set("")
            cursor.execute("SELECT ded_code FROM deduction_purchase ORDER BY ded_code")
            codes = [r[0] for r in cursor.fetchall()]
            code_box["values"] = codes
            code_var.set("")

    bf = tk.Frame(win, bg=FRAME_BG)
    bf.pack(pady=15)
    tk.Button(bf,text="💾 Update",bg="#4CAF50",fg="white",width=12,command=update_record).pack(side="left", padx=5)
    tk.Button(bf,text="🗑️ Delete",bg="#FF5733",fg="white",width=12,command=delete_record).pack(side="left", padx=5)
    tk.Button(bf,text="❌ Close",bg="#f44336",fg="white",width=12,command=win.destroy).pack(side="right", padx=5)

# ---------- Add to Master Menu ----------
deduction_purchase_menu = tk.Menu(master_menu, tearoff=0)
deduction_purchase_menu.add_command(label="Create", command=open_deduction_purchase_create)
deduction_purchase_menu.add_command(label="Display", command=open_deduction_purchase_display)
deduction_purchase_menu.add_command(label="Edit/Update", command=open_deduction_purchase_edit)
deduction_purchase_menu.add_command(label="Print", command=open_deduction_purchase_display)
master_menu.add_cascade(label="Deduction Purchase", menu=deduction_purchase_menu)

# ==============================================================
# CUSTOMERS  MODULE
# ==============================================================

cursor.execute("""
CREATE TABLE IF NOT EXISTS customer_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    print_name TEXT,
    contact_person TEXT,
    address1 TEXT,
    address2 TEXT,
    address3 TEXT,
    address4 TEXT,
    gst_number TEXT,
    phone_off TEXT,
    phone_res TEXT,
    mobile1 TEXT,
    mobile2 TEXT,
    area TEXT,
    opening_balance REAL
)
""")
conn.commit()

def opencustomerwindow():
    win = tk.Toplevel(root)
    win.title("Customer Entry")
    win.geometry("950x650")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Customer Details", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=15)
    frame.pack(fill=tk.BOTH, expand=True)

    fields = [
        "Name", "Print Name", "Contact Person",
        "Address1", "Address2", "Address3", "Address4",
        "GST No", "Phone (Off)", "Phone (Res)", "Mobile1", "Mobile2",
        "Area", "Opening Balance (Cr)"
    ]

    entries = {}
    for i, label in enumerate(fields):
        tk.Label(frame, text=label, bg=FRAME_BG, anchor="w").grid(row=i, column=0, sticky="w", pady=3)
        entries[label] = tk.Entry(frame, width=40)
        entries[label].grid(row=i, column=1, pady=3, padx=5)

    def save_customer():
        data = [entries[f].get() for f in fields]
        if not data[0]:
            messagebox.showwarning("Validation", "Customer Name is required!")
            return
        cursor.execute("""INSERT INTO customer_master
            (name, print_name, contact_person, address1, address2, address3, address4,
             gst_number, phone_off, phone_res, mobile1, mobile2, area, opening_balance)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", tuple(data))
        conn.commit()
        messagebox.showinfo("Success", "Customer saved successfully!")
        for f in entries.values():
            f.delete(0, tk.END)

    tk.Button(win, text="Save", command=save_customer,
              bg=BUTTON_BG, fg=BUTTON_FG, width=15).pack(pady=15)

def opencustomerdisplay():
    win = tk.Toplevel(root)
    win.title("Display Customers")
    win.geometry("850x500")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Customer List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    columns = ("S.No", "Customer Name", "Area", "Contact Person", "Mobile")
    tree = ttk.Treeview(win, columns=columns, show="headings")
    for c in columns:
        tree.heading(c, text=c)
        tree.column(c, width=150)
    tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    cursor.execute("SELECT name, area, contact_person, mobile1 FROM customer_master")
    for i, row in enumerate(cursor.fetchall(), 1):
        tree.insert("", "end", values=(i, *row))

    def export_excel():
        data = [tree.item(i)['values'] for i in tree.get_children()]
        if not data:
            messagebox.showinfo("Info", "No data to export")
            return
        df = pd.DataFrame(data, columns=columns)
        file = filedialog.asksaveasfilename(defaultextension=".xlsx")
        if file:
            df.to_excel(file, index=False)
            messagebox.showinfo("Exported", "Data exported successfully")

    def export_pdf():
        rows = [tree.item(i, "values") for i in tree.get_children()]
        if not rows:
            messagebox.showinfo("Info", "No data to export.")
            return
        file = filedialog.asksaveasfilename(defaultextension=".pdf")
        if not file:
            return
        doc = SimpleDocTemplate(file, pagesize=A4)
        styles = getSampleStyleSheet()
        data = [columns] + [list(r) for r in rows]
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#005F99")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 0.5, colors.grey)
        ]))
        doc.build([Paragraph("Customer List", styles["Heading2"]), Spacer(1,10), table])
        messagebox.showinfo("Exported", "PDF file saved successfully.")

    def print_customers():
        tmp = tempfile.mktemp(".txt")
        rows = [tree.item(i, "values") for i in tree.get_children()]
        with open(tmp, "w", encoding="utf-8") as f:
            f.write("Customer List\n\n")
            for r in rows:
                f.write(", ".join([str(x) for x in r]) + "\n")
        os.startfile(tmp, "print")

    bf = tk.Frame(win, bg=FRAME_BG)
    bf.pack(pady=10)
    tk.Button(bf, text="📤 Excel", command=export_excel, bg="#4CAF50", fg="white", width=12).pack(side=tk.LEFT, padx=5)
    tk.Button(bf, text="📄 PDF", command=export_pdf, bg="#2196F3", fg="white", width=12).pack(side=tk.LEFT, padx=5)
    tk.Button(bf, text="🖨️ Print", command=print_customers, bg="#9C27B0", fg="white", width=12).pack(side=tk.LEFT, padx=5)
    tk.Button(bf, text="❌ Close", command=win.destroy, bg="red", fg="white", width=12).pack(side=tk.LEFT, padx=5)

def load_customer_details(event=None):
    name = customer_name_var.get()
    cursor.execute("SELECT gst_number, address1, address2, address3, address4 FROM customer_master WHERE name=?", (name,))
    row = cursor.fetchone()
    if row:
        gst_var.set(row[0])
        full_address_var.set("\n".join([r for r in row[1:] if r]))


import pandas as pd
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import tempfile, os

def opencustomeredit():
    win = tk.Toplevel(root)
    win.title("Edit / Update Customer")
    win.geometry("850x600")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Edit / Update Customer", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    cursor.execute("SELECT name FROM customer_master ORDER BY name")
    names = [r[0] for r in cursor.fetchall()]

    selected_name = tk.StringVar()
    ttk.Label(win, text="Select Customer:", background=FRAME_BG).pack(pady=10)
    name_cb = ttk.Combobox(win, values=names, textvariable=selected_name, width=40)
    name_cb.pack(pady=5)

    frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=20)
    frame.pack(fill=tk.BOTH, expand=True)

    fields = [
        "Print Name", "Contact Person", "Address1", "Address2",
        "Address3", "Address4", "GST No", "Phone (Off)", "Phone (Res)",
        "Mobile1", "Mobile2", "Area", "Opening Balance (Cr)"
    ]
    entries = {}
    for i, f in enumerate(fields):
        tk.Label(frame, text=f, bg=FRAME_BG, anchor="w").grid(row=i, column=0, sticky="w", pady=3)
        entries[f] = tk.Entry(frame, width=40)
        entries[f].grid(row=i, column=1, padx=5, pady=3)

    def load_customer(event=None):
        name = selected_name.get()
        cursor.execute("""SELECT print_name, contact_person, address1, address2, address3, address4,
                        gst_number, phone_off, phone_res, mobile1, mobile2, area, opening_balance
                        FROM customer_master WHERE name=?""", (name,))
        row = cursor.fetchone()
        if row:
            for f, val in zip(fields, row):
                entries[f].delete(0, tk.END)
                entries[f].insert(0, val)

    name_cb.bind("<<ComboboxSelected>>", load_customer)

    def update_customer():
        data = [entries[f].get() for f in fields]
        cursor.execute(f"""UPDATE customer_master SET print_name=?, contact_person=?, 
            address1=?, address2=?, address3=?, address4=?, gst_number=?, 
            phone_off=?, phone_res=?, mobile1=?, mobile2=?, area=?, opening_balance=? 
            WHERE name=?""", tuple(data + [selected_name.get()]))
        conn.commit()
        messagebox.showinfo("Updated", f"Customer '{selected_name.get()}' updated successfully.")

    tk.Button(win, text="Update", command=update_customer,
              bg="green", fg="white", width=15).pack(pady=15)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack()

def opencustomerprint():
    win = tk.Toplevel(root)
    win.title("Print Customers")
    win.geometry("900x550")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Customer List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    columns = ("S.No", "Customer Name", "Area", "Contact Person", "Mobile")
    tree = ttk.Treeview(win, columns=columns, show="headings")
    for c in columns:
        tree.heading(c, text=c)
        tree.column(c, width=160)
    tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    cursor.execute("SELECT name, area, contact_person, mobile1 FROM customer_master")
    for i, row in enumerate(cursor.fetchall(), 1):
        tree.insert("", "end", values=(i, *row))

    def exportpdf():
        rows = [tree.item(i, "values") for i in tree.get_children()]
        if not rows:
            messagebox.showinfo("Info", "No data to export.")
            return
        file = filedialog.asksaveasfilename(defaultextension=".pdf")
        if not file:
            return
        doc = SimpleDocTemplate(file, pagesize=A4)
        styles = getSampleStyleSheet()
        data = [columns] + [list(r) for r in rows]
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#005F99")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 0.5, colors.grey)
        ]))
        doc.build([Paragraph("Customer List", styles["Heading2"]), Spacer(1,10), table])
        messagebox.showinfo("Exported", "PDF file saved successfully.")

    def print_customers():
        tmp = tempfile.mktemp(".txt")
        rows = [tree.item(i, "values") for i in tree.get_children()]
        with open(tmp, "w", encoding="utf-8") as f:
            f.write("Customer List\n\n")
            for r in rows:
                f.write(", ".join([str(x) for x in r]) + "\n")
        os.startfile(tmp, "print")

    bf = tk.Frame(win, bg=FRAME_BG)
    bf.pack(pady=10)
    tk.Button(bf, text="Export PDF", command=exportpdf, bg="#2196F3", fg="white", width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(bf, text="Print", command=print_customers, bg="#9C27B0", fg="white", width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(bf, text="Close", command=win.destroy, bg="red", fg="white", width=12).pack(side=tk.RIGHT, padx=10)


customermenu = tk.Menu(master_menu, tearoff=0)
customermenu.add_command(label="Create", command=opencustomerwindow)
customermenu.add_command(label="Display", command=opencustomerdisplay)
customermenu.add_command(label="Edit / Update", command=opencustomeredit)
customermenu.add_command(label="Print", command=opencustomerprint)
master_menu.add_cascade(label="Customer", menu=customermenu)

# ==============================================================
# SUPPLIERS MODULE
# ==============================================================


cursor.execute("""
CREATE TABLE IF NOT EXISTS supplier_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    print_name TEXT,
    contact_person TEXT,
    address1 TEXT,
    address2 TEXT,
    address3 TEXT,
    address4 TEXT,  
    gst_number TEXT,
    phone_off TEXT,
    phone_res TEXT,
    mobile1 TEXT,
    mobile2 TEXT,
    area TEXT,
    opening_balance REAL
)
""")
conn.commit()

# Create Supplier Entry (Add Window)
def opensuppliercreate():
    win = tk.Toplevel(root)
    win.title("Supplier Entry")
    win.geometry("950x650")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Supplier Details", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    frm = tk.Frame(win, bg=FRAME_BG, padx=20, pady=20)
    frm.pack(fill=tk.BOTH, expand=True)

    fields = [
        "Name", "Print Name", "Contact Person", "Address1", "Address2", "Address3",
        "Address4", "GST No", "Phone (Off)", "Phone (Res)", "Mobile1", "Mobile2",
        "Area", "Opening Balance (Dr)"
    ]

    entries = {}
    for i, f in enumerate(fields):
        tk.Label(frm, text=f, bg=FRAME_BG, anchor="w").grid(row=i, column=0, sticky="w", pady=3)
        entries[f] = tk.Entry(frm, width=40)
        entries[f].grid(row=i, column=1, padx=5, pady=3)

    def save_supplier():
        data = [entries[f].get() for f in fields]
        if not data[0]:
            messagebox.showwarning("Validation", "Supplier Name is required!")
            return
        cursor.execute("""INSERT INTO supplier_master
            (name, print_name, contact_person, address1, address2, address3, address4, 
             gst_number, phone_off, phone_res, mobile1, mobile2, area, opening_balance)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", tuple(data))
        conn.commit()
        messagebox.showinfo("Saved", f"Supplier '{data[0]}' added successfully.")
        for e in entries.values(): e.delete(0, tk.END)

    tk.Button(win, text="Save", command=save_supplier, bg=BUTTON_BG, fg=BUTTON_FG, width=15).pack(pady=15)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack()
# Supplier Display Windowpython

def opensupplierdisplay():
    win = tk.Toplevel(root)
    win.title("Display Suppliers")
    win.geometry("850x500")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Supplier List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    columns = ("S.No", "Supplier Name", "Area", "Contact Person", "Mobile")
    tree = ttk.Treeview(win, columns=columns, show="headings")
    for c in columns:
        tree.heading(c, text=c)
        tree.column(c, width=160)
    tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    cursor.execute("SELECT name, area, contact_person, mobile1 FROM supplier_master")
    for i, row in enumerate(cursor.fetchall(), 1):
        tree.insert("", "end", values=(i, *row))

    tk.Button(win, text="Close", bg="red", fg="white", width=12, command=win.destroy).pack(pady=10)

# Supplier Edit/Update Window
def opensupplieredit():
    win = tk.Toplevel(root)
    win.title("Edit / Update Supplier")
    win.geometry("850x620")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Edit / Update Supplier", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    cursor.execute("SELECT name FROM supplier_master ORDER BY name")
    names = [r[0] for r in cursor.fetchall()]

    selected = tk.StringVar()
    ttk.Label(win, text="Select Supplier:", background=FRAME_BG).pack(pady=5)
    combo = ttk.Combobox(win, values=names, textvariable=selected, width=45)
    combo.pack(pady=5)

    frm = tk.Frame(win, bg=FRAME_BG, padx=20, pady=20)
    frm.pack(fill=tk.BOTH, expand=True)

    fields = [
        "Print Name", "Contact Person", "Address1", "Address2", "Address3", "Address4",
        "GST No", "Phone (Off)", "Phone (Res)", "Mobile1", "Mobile2", "Area", "Opening Balance (Dr)"
    ]
    entries = {}
    for i, f in enumerate(fields):
        tk.Label(frm, text=f, bg=FRAME_BG, anchor="w", font=("Segoe UI", 10)).grid(row=i, column=0, sticky="w", pady=3)
        entries[f] = tk.Entry(frm, width=40)
        entries[f].grid(row=i, column=1, padx=8, pady=3)

    def load_supplier(event=None):
        cursor.execute("""SELECT print_name, contact_person, address1, address2, address3, address4,
                        gst_number, phone_off, phone_res, mobile1, mobile2, area, opening_balance
                        FROM supplier_master WHERE name=?""", (selected.get(),))
        r = cursor.fetchone()
        if r:
            for f, v in zip(fields, r):
                entries[f].delete(0, tk.END)
                entries[f].insert(0, v)
        else:
            for f in fields:
                entries[f].delete(0, tk.END)
    combo.bind("<<ComboboxSelected>>", load_supplier)

    def update_supplier():
        data = [entries[f].get() for f in fields]
        if not selected.get():
            messagebox.showwarning("Alert", "Select a supplier before updating!")
            return
        cursor.execute(f"""UPDATE supplier_master SET print_name=?, contact_person=?, 
            address1=?, address2=?, address3=?, address4=?, gst_number=?, 
            phone_off=?, phone_res=?, mobile1=?, mobile2=?, area=?, opening_balance=? 
            WHERE name=?""", tuple(data + [selected.get()]))
        conn.commit()
        messagebox.showinfo("Updated", f"Supplier '{selected.get()}' updated successfully!")

    # Button Frame - ensures visibility and proper alignment
    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=15)

    tk.Button(btn_frame, text="Update", command=update_supplier, bg="green", fg="white",
              font=("Segoe UI", 10, "bold"), width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white",
              font=("Segoe UI", 10, "bold"), width=12).pack(side=tk.LEFT, padx=10)


def opensupplierprint():
    win = tk.Toplevel(root)
    win.title("Print Suppliers")
    win.geometry("900x550")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Supplier List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    columns = ("S.No", "Supplier Name", "Area", "Contact Person", "Mobile")
    tree = ttk.Treeview(win, columns=columns, show="headings")
    for c in columns:
        tree.heading(c, text=c)
        tree.column(c, width=160)
    tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    cursor.execute("SELECT name, area, contact_person, mobile1 FROM supplier_master")
    for i, row in enumerate(cursor.fetchall(), 1):
        tree.insert("", "end", values=(i, *row))

    def exportpdf():
        rows = [tree.item(i, "values") for i in tree.get_children()]
        if not rows:
            messagebox.showinfo("Info", "No data to export.")
            return
        file = filedialog.asksaveasfilename(defaultextension=".pdf", filetypes=[("PDF files", "*.pdf")])
        if not file:
            return
        doc = SimpleDocTemplate(file, pagesize=A4)
        styles = getSampleStyleSheet()
        data = [columns] + [list(r) for r in rows]
        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#005F99")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 0.5, colors.grey)
        ]))
        doc.build([Paragraph("Supplier List", styles["Heading2"]), Spacer(1,10), table])
        messagebox.showinfo("Exported", f"PDF saved: {file}")

    def print_suppliers():
        tmp = tempfile.mktemp(".txt")
        rows = [tree.item(i, "values") for i in tree.get_children()]
        with open(tmp, "w", encoding="utf-8") as f:
            f.write("Supplier List\n\n")
            for r in rows:
                f.write(", ".join(str(x) for x in r) + "\n")
        try:
            os.startfile(tmp, "print")
        except Exception as e:
            messagebox.showerror("Error", f"Could not send file to printer: {e}")

    button_frame = tk.Frame(win, bg=FRAME_BG)
    button_frame.pack(pady=10)
    tk.Button(button_frame, text="Export PDF", command=exportpdf,
              bg="#2196F3", fg="white", width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(button_frame, text="Print", command=print_suppliers,
              bg="#9C27B0", fg="white", width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(button_frame, text="Close", command=win.destroy,
              bg="red", fg="white", width=12).pack(side=tk.RIGHT, padx=10)

    bf = tk.Frame(win, bg=FRAME_BG)
    bf.pack(pady=10)
    tk.Button(bf, text="Export PDF", command=exportpdf, bg="#2196F3", fg="white", width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(bf, text="Print", command=print_suppliers, bg="#9C27B0", fg="white", width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(bf, text="Close", command=win.destroy, bg="red", fg="white", width=12).pack(side=tk.RIGHT, padx=10)



#  Add Supplier Menu in Main Window

suppliermenu = tk.Menu(master_menu, tearoff=0)
suppliermenu.add_command(label="Create", command=opensuppliercreate)
suppliermenu.add_command(label="Display", command=opensupplierdisplay)
suppliermenu.add_command(label="Edit / Update", command=opensupplieredit)
suppliermenu.add_command(label="Print", command=opensupplierprint)
master_menu.add_cascade(label="Suppliers", menu=suppliermenu)


# ==============================================================
# FLOUR MILL MODULE
# ==============================================================

# Create Flour Mill Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS flour_mill_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flourmill TEXT UNIQUE,
    print_name TEXT,
    contact_person TEXT,
    address1 TEXT,
    address2 TEXT,
    address3 TEXT,
    address4 TEXT,
    gst_number TEXT,
    phone_off TEXT,
    phone_res TEXT,
    mobile1 TEXT,
    mobile2 TEXT,
    area TEXT,
    wages_kg REAL,
    opening_balance REAL
)
""")
conn.commit()

#  Flour Mill Create Window

def openflourmillcreate():
    win = tk.Toplevel(root)
    win.title("Create Flour Mill")
    win.geometry("950x650")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Flour Mill Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=20)
    frame.pack(fill=tk.BOTH, expand=True)

    # Use StringVars for dynamic linking
    flourmill_var = tk.StringVar()
    printname_var = tk.StringVar()

    # Auto-fill: When flour mill name changes, set same text in print name
    def autofill_printname(*args):
        # If user hasn’t edited print name yet, update automatically
        if not printname_var.get() or printname_var.get() == old_value[0]:
            printname_var.set(flourmill_var.get())
            old_value[0] = flourmill_var.get()
    old_value = [""]  # track last auto-generated value
    flourmill_var.trace("w", autofill_printname)

    # Entry Fields
    tk.Label(frame, text="Flour Mill", bg=FRAME_BG, anchor="w").grid(row=0, column=0, sticky="w", pady=3)
    ent_flourmill = tk.Entry(frame, textvariable=flourmill_var, width=40)
    ent_flourmill.grid(row=0, column=1, padx=5, pady=3)

    tk.Label(frame, text="Print Name", bg=FRAME_BG, anchor="w").grid(row=1, column=0, sticky="w", pady=3)
    ent_print = tk.Entry(frame, textvariable=printname_var, width=40)
    ent_print.grid(row=1, column=1, padx=5, pady=3)

    other_fields = [
        "Contact Person", "Address1", "Address2", "Address3", "Address4", "GST No",
        "Phone (Off)", "Phone (Res)", "Mobile1", "Mobile2", "Area", "Wages/kg", "Opening Balance (Cr)"
    ]
    entries = {}

    for i, f in enumerate(other_fields, start=2):
        tk.Label(frame, text=f, bg=FRAME_BG, anchor="w").grid(row=i, column=0, sticky="w", pady=3)
        entries[f] = tk.Entry(frame, width=40)
        entries[f].grid(row=i, column=1, padx=5, pady=3)

    def save_mill():
        data = [flourmill_var.get(), printname_var.get()] + [entries[f].get() for f in other_fields]
        if not data[0]:
            messagebox.showwarning("Validation", "Flour Mill Name is required!")
            return
        try:
            cursor.execute("""
                INSERT INTO flour_mill_master 
                (flourmill, print_name, contact_person, address1, address2, address3, address4, gst_number,
                 phone_off, phone_res, mobile1, mobile2, area, wages_kg, opening_balance)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, tuple(data))
            conn.commit()
            messagebox.showinfo("Success", f"{data[0]} added successfully.")
            flourmill_var.set("")
            printname_var.set("")
            for e in entries.values(): e.delete(0, tk.END)
        except sqlite3.IntegrityError:
            messagebox.showerror("Error", f"{data[0]} already exists!")

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=15)

    tk.Button(btn_frame, text="Save", command=save_mill, bg=BUTTON_BG, fg=BUTTON_FG,
              width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white",
              width=12).pack(side=tk.LEFT, padx=10)

# Flour Mill Display Window

def openflourmilldisplay():
    win = tk.Toplevel(root)
    win.title("Display Flour Mills")
    win.geometry("850x500")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Flour Mill List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    cols = ("S.No", "Flour Mill", "Area", "Contact Person", "Mobile")
    tree = ttk.Treeview(win, columns=cols, show="headings")
    for c in cols:
        tree.heading(c, text=c)
        tree.column(c, width=150)
    tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    cursor.execute("SELECT flourmill, area, contact_person, mobile1 FROM flour_mill_master")
    for i, row in enumerate(cursor.fetchall(), 1):
        tree.insert("", "end", values=(i, *row))

    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white",
              width=12).pack(pady=8)
# Flour Mill Edit/Update Window

def openflourmilledit():
    win = tk.Toplevel(root)
    win.title("Edit Flour Mill")
    win.geometry("850x600")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Edit / Update Flour Mill", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill=tk.X)

    cursor.execute("SELECT flourmill FROM flour_mill_master ORDER BY flourmill")
    mills = [r[0] for r in cursor.fetchall()]

    selected = tk.StringVar()
    ttk.Label(win, text="Select Flour Mill", background=FRAME_BG).pack(pady=5)
    combo = ttk.Combobox(win, values=mills, textvariable=selected, width=50)
    combo.pack(pady=5)

    frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=15)
    frame.pack(fill=tk.BOTH, expand=True)

    fields = [
        "Print Name", "Contact Person", "Address1", "Address2", "Address3", "Address4", "GST No",
        "Phone (Off)", "Phone (Res)", "Mobile1", "Mobile2", "Area", "Wages/kg", "Opening Balance (Cr)"
    ]
    entries = {}
    for i, f in enumerate(fields):
        tk.Label(frame, text=f, bg=FRAME_BG, anchor="w").grid(row=i, column=0, sticky="w", pady=3)
        entries[f] = tk.Entry(frame, width=40)
        entries[f].grid(row=i, column=1, padx=5, pady=3)

    def load_mill(e=None):
        cursor.execute("""SELECT print_name, contact_person, address1, address2, address3, address4,
                          gst_number, phone_off, phone_res, mobile1, mobile2, area, wages_kg, opening_balance
                          FROM flour_mill_master WHERE flourmill=?""", (selected.get(),))
        r = cursor.fetchone()
        for f, v in zip(fields, r): entries[f].delete(0, tk.END); entries[f].insert(0, v)
    combo.bind("<<ComboboxSelected>>", load_mill)

    def update_mill():
        data = [entries[f].get() for f in fields]
        cursor.execute("""UPDATE flour_mill_master 
                          SET print_name=?, contact_person=?, address1=?, address2=?, address3=?, address4=?, 
                              gst_number=?, phone_off=?, phone_res=?, mobile1=?, mobile2=?, area=?, wages_kg=?, opening_balance=? 
                          WHERE flourmill=?""", tuple(data + [selected.get()]))
        conn.commit()
        messagebox.showinfo("Updated", f"{selected.get()} updated successfully!")

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=15)
    tk.Button(btn_frame, text="Update", command=update_mill, bg="green", fg="white",
              width=12).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white",
              width=12).pack(side=tk.LEFT, padx=10)

# Add to Main Menu


flourmillmenu = tk.Menu(master_menu, tearoff=0)
flourmillmenu.add_command(label="Create", command=openflourmillcreate)
flourmillmenu.add_command(label="Display", command=openflourmilldisplay)
flourmillmenu.add_command(label="Edit / Update", command=openflourmilledit)
master_menu.add_cascade(label="Flour Mill", menu=flourmillmenu)

# Integration Logic for Grinding / Bills
#To load Flour Mill details automatically in Grinding or Bills:


def load_flourmill_details(event=None):
    cursor.execute("""SELECT gst_number, address1, address2, address3, address4, wages_kg 
                      FROM flour_mill_master WHERE flourmill=?""", (mill_name_var.get(),))
    row = cursor.fetchone()
    if row:
        gst_var.set(row[0])
        address_var.set("\n".join([r for r in row[1:5] if r]))
        wages_var.set(row[5])

# ==============================================================
# PAPAD COMPANY MODULE
# ==============================================================
# Database setup
conn = sqlite3.connect('inventory.db')
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS papad_company_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    print_name TEXT,
    contact_person TEXT,
    address1 TEXT,
    address2 TEXT,
    address3 TEXT,
    address4 TEXT,
    gst_no TEXT,
    phone_off TEXT,
    phone_res TEXT,
    mobile1 TEXT,
    mobile2 TEXT,
    area TEXT,
    wages_kg REAL,
    opening_balance REAL,
    opening_advance REAL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS papad_wages_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    papad_company TEXT,
    from_date TEXT,
    to_date TEXT,
    papad_kg_bag REAL,
    wages_bag REAL,
    adv_ded_bag REAL,
    FOREIGN KEY(papad_company) REFERENCES papad_company_master(name)
)
""")

conn.commit()

HEADER_BG = "#005F99"
HEADER_FG = "white"
FRAME_BG = "#E6F0FA"
BUTTON_BG = "#4CAF50"
BUTTON_FG = "white"


def link_name_print(name_var, print_var):
    user_edited = [False]

    def auto_fill(*args):
        if not user_edited[0]:
            print_var.set(name_var.get())

    def mark_user_edit(*args):
        user_edited[0] = True

    name_var.trace_add('write', auto_fill)
    print_var.trace_add('write', mark_user_edit)


# Create Window
def openpapadcompanycreate():
    win = tk.Toplevel(root)
    win.title("Create Papad Company")
    win.geometry("1150x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    name_var = tk.StringVar()
    print_name_var = tk.StringVar()
    link_name_print(name_var, print_name_var)

    fields = ['Name', 'Print Name', 'Contact Person', 'Address1', 'Address2', 'Address3', 'Address4',
              'GST No', 'Phone (Off)', 'Phone (Res)', 'Mobile1', 'Mobile2', 'Area', 'Wages/kg', 'Opening Balance (Cr)',
              'Opening Advance (Cr)']
    entries = {}

    for i, field in enumerate(fields):
        tk.Label(left_frame, text=field, bg=FRAME_BG, anchor='w', width=18).grid(row=i, column=0, sticky='w', pady=3)
        if field == 'Name':
            ent = tk.Entry(left_frame, textvariable=name_var, width=30)
        elif field == 'Print Name':
            ent = tk.Entry(left_frame, textvariable=print_name_var, width=30)
        else:
            ent = tk.Entry(left_frame, width=30)
        ent.grid(row=i, column=1, pady=3, padx=5, sticky='w')
        entries[field] = ent

    # Papad wages table on right
    cols = ("From Date", "To Date", "Papad Kg/Bag", "Wages/Bag", "Adv Ded/Bag")
    header_frame = tk.Frame(right_frame, bg=HEADER_BG)
    header_frame.pack(fill=tk.X)

    for i, col in enumerate(cols):
        tk.Label(header_frame, text=col, bg=HEADER_BG, fg=HEADER_FG, width=15).grid(row=0, column=i)

    rows = []

    def add_row(vals=None):
        row_frame = tk.Frame(right_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)

        sv_list = []
        for i in range(len(cols)):
            sv = tk.StringVar()
            e = tk.Entry(row_frame, textvariable=sv, width=17)
            e.grid(row=0, column=i)
            sv_list.append(sv)

            def on_enter(event, sv_list=sv_list):
                if any(s.get() for s in sv_list) and rows[-1] == sv_list:
                    add_row()

            e.bind('<Return>', on_enter)

        if vals:
            for sv, val in zip(sv_list, vals):
                sv.set(val)

        rows.append(sv_list)

    add_row()

    def save():
        data = [entries[f].get().strip() for f in fields]
        if not data[0]:
            messagebox.showwarning("Validation", "Name is required!")
            return
        try:
            cursor.execute("""INSERT INTO papad_company_master
                (name, print_name, contact_person, address1, address2, address3, address4, gst_no,
                phone_off, phone_res, mobile1, mobile2, area, wages_kg, opening_balance, opening_advance)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", data)
            conn.commit()
            for sv_list in rows:
                vals = [sv.get().strip() for sv in sv_list]
                if any(vals):
                    cursor.execute("""INSERT INTO papad_wages_history
                      (papad_company, from_date, to_date, papad_kg_bag, wages_bag, adv_ded_bag)
                      VALUES (?, ?, ?, ?, ?, ?)""", (data[0], *vals))
            conn.commit()
            messagebox.showinfo("Saved", f"Papad Company '{data[0]}' saved successfully!")
            win.destroy()
        except sqlite3.IntegrityError:
            messagebox.showerror("Error", f"Papad Company '{data[0]}' already exists!")

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Save", command=save, bg=BUTTON_BG, fg=BUTTON_FG, width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)


# Display Window
def openpapadcompanydisplay():
    win = tk.Toplevel(root)
    win.title("Papad Company List")
    win.geometry("800x500")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Papad Company List", font=("Segoe UI", 14, "bold"), bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(
        fill=tk.X)

    cols = ("S.No", "Name", "Area", "Contact Person", "Mobile")
    tree = ttk.Treeview(win, columns=cols, show='headings')
    for c in cols:
        tree.heading(c, text=c)
        tree.column(c, width=140)
    tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    cursor.execute("SELECT name, area, contact_person, mobile1 FROM papad_company_master")
    for idx, row in enumerate(cursor.fetchall(), 1):
        tree.insert('', 'end', values=(idx, *row))

    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(pady=5)


# Edit/Update Window
def openpapadcompanyedit():
    win = tk.Toplevel(root)
    win.title("Edit Papad Company")
    win.geometry("1150x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    tk.Label(win, text="Edit Papad Company", font=("Segoe UI", 14, "bold"), bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(
        fill=tk.X)

    cursor.execute("SELECT name FROM papad_company_master ORDER BY name")
    names = [r[0] for r in cursor.fetchall()]
    selected = tk.StringVar()
    combo = ttk.Combobox(left_frame, values=names, textvariable=selected, width=30)
    combo.pack(pady=8, padx=10)

    print_name_var = tk.StringVar()
    name_var = tk.StringVar()
    link_name_print(name_var, print_name_var)

    fields = ['Print Name', 'Contact Person', 'Address1', 'Address2', 'Address3', 'Address4',
              'GST No', 'Phone (Off)', 'Phone (Res)', 'Mobile1', 'Mobile2', 'Area', 'Wages/kg',
              'Opening Balance (Cr)', 'Opening Advance (Cr)']
    entries = {}

    for i, field in enumerate(fields):
        tk.Label(left_frame, text=field, bg=FRAME_BG, anchor='w', width=18).pack(anchor='w', padx=10, pady=3)
        var = tk.StringVar()
        ent = tk.Entry(left_frame, width=30, textvariable=var)
        ent.pack(padx=10, pady=3)
        entries[field] = var

    cols = ("From Date", "To Date", "Papad Kg/Bag", "Wages/Bag", "Adv Ded/Bag")

    header_frame = tk.Frame(right_frame, bg=HEADER_BG)
    header_frame.pack(fill=tk.X)

    for idx, col in enumerate(cols):
        tk.Label(header_frame, text=col, bg=HEADER_BG, fg=HEADER_FG, width=15).grid(row=0, column=idx)

    rows = []

    def add_wages_row(vals=None):
        row_frame = tk.Frame(right_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []

        for idx, colname in enumerate(cols):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=17)
            ent.grid(row=0, column=idx)
            sv_list.append(sv)

            # ✅ This will add a new row when user presses Enter in last column (Wages/Bag)
            def on_enter(event, sv_list=sv_list):
                # Only trigger new row when ENTER is pressed on the last field of current row
                widget_index = int(event.widget.grid_info()["column"])
                is_last_col = (widget_index == len(cols) - 1)
                if is_last_col:
                    # Check if current row is last row
                    if sv_list == rows[-1]:
                        # Only add new if current row has any data
                        if any(s.get().strip() for s in sv_list):
                            add_wages_row()

            ent.bind('<Return>', on_enter)

        # If this is an existing record, populate values
        if vals:
            for sv, val in zip(sv_list, vals):
                sv.set(val)

        rows.append(sv_list)

    def load_company(event=None):
        cursor.execute("""SELECT print_name, contact_person, address1, address2, address3, address4,
                          gst_no, phone_off, phone_res, mobile1, mobile2, area, wages_kg,
                          opening_balance, opening_advance FROM papad_company_master WHERE name=?""", (selected.get(),))
        rec = cursor.fetchone()
        if rec:
            name_var.set(selected.get())
            print_name_var.set(rec[0])
            for i, key in enumerate(fields[1:]):
                entries[key].set(rec[i + 1])

            for r in rows:
                for sv in r:
                    sv.set('')

            cursor.execute("""SELECT from_date, to_date, papad_kg_bag, wages_bag, adv_ded_bag
                              FROM papad_wages_history WHERE papad_company=?""", (selected.get(),))
            results = cursor.fetchall()
            for i, vals in enumerate(results):
                if i == 0:
                    for sv, val in zip(rows[0], vals):
                        sv.set(val)
                else:
                    add_wages_row(vals)
        else:
            for k in fields:
                if k == 'Print Name':
                    print_name_var.set('')
                else:
                    entries[k].set('')
            for r in rows:
                for sv in r:
                    sv.set('')

    combo.bind("<<ComboboxSelected>>", load_company)

    def save_update():
        data = [print_name_var.get()] + [entries[k].get() for k in fields[1:]]
        data.append(selected.get())
        cursor.execute("""UPDATE papad_company_master SET print_name=?, contact_person=?, address1=?, address2=?, address3=?, address4=?,
                          gst_no=?, phone_off=?, phone_res=?, mobile1=?, mobile2=?, area=?, wages_kg=?, opening_balance=?, opening_advance=?
                          WHERE name=?""", data)

        cursor.execute("DELETE FROM papad_wages_history WHERE papad_company=?", (selected.get(),))
        for sv_list in rows:
            vals = [sv.get() for sv in sv_list]
            if any(vals):
                cursor.execute("""INSERT INTO papad_wages_history (papad_company, from_date, to_date, papad_kg_bag, wages_bag, adv_ded_bag)
                                  VALUES (?, ?, ?, ?, ?, ?)""", (selected.get(), *vals))
        conn.commit()
        messagebox.showinfo("Updated", f"{selected.get()} updated successfully.")

    tk.Button(win, text="Update", command=save_update, bg=BUTTON_BG, fg=BUTTON_FG, width=15).pack(pady=10)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack()


# Main menu
papadmenu = tk.Menu(master_menu, tearoff=0)
papadmenu.add_command(label="Create", command=openpapadcompanycreate)
papadmenu.add_command(label="Display", command=openpapadcompanydisplay)
papadmenu.add_command(label="Edit / Update", command=openpapadcompanyedit)
master_menu.add_cascade(label="Papad Company", menu=papadmenu)

# ==============================================================
# FLOUR OUT MODULE
# ==============================================================

# Database setup for Flour Out
cursor.execute("""
CREATE TABLE IF NOT EXISTS flour_out (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    s_no INTEGER NOT NULL,
    date TEXT NOT NULL,
    papad_company TEXT,
    remarks TEXT,
    total_qty REAL DEFAULT 0,
    total_weight REAL DEFAULT 0,
    total_wages REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS flour_out_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flour_out_id INTEGER,
    item_name TEXT NOT NULL,
    lot_no TEXT,
    weight REAL,
    qty REAL,
    total_wt REAL,
    papad_kg REAL,
    wages_bag REAL,
    wages REAL,
    FOREIGN KEY(flour_out_id) REFERENCES flour_out(id)
)
""")
conn.commit()

def get_next_flour_out_sno():
    cursor.execute("SELECT MAX(s_no) FROM flour_out")
    last_sno = cursor.fetchone()[0]
    return (last_sno or 0) + 1

# ---------- FLOUR OUT CREATE ----------
def open_flour_out_create():
    win = tk.Toplevel(root)
    win.title("Create Flour Out Entry")
    win.geometry("1200x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Create Flour Out Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left frame for header info
    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    s_no_var = tk.StringVar(value=str(get_next_flour_out_sno()))
    date_var = tk.StringVar(value=datetime.now().strftime("%d-%m-%Y"))
    papad_company_var = tk.StringVar()
    remarks_var = tk.StringVar()

    fields = [
        ("S.No:", s_no_var),
        ("Date:", date_var),
        ("Papad Company:", papad_company_var),
        ("Remarks:", remarks_var)
    ]

    for i, (label, var) in enumerate(fields):
        tk.Label(left_frame, text=label, bg=FRAME_BG, anchor="w", width=15).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(left_frame, textvariable=var, width=25).grid(row=i, column=1, pady=5, padx=5)

    # Right frame for items
    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Items
    items_frame = tk.Frame(right_frame, bg=FRAME_BG)
    items_frame.pack(fill=tk.BOTH, expand=True)

    tk.Label(items_frame, text="Flour Out Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    cols = ("Item Name", "Lot No", "Weight", "Qty", "Total Wt", "Papad/kg", "Wages/Bag", "Wages")
    header = tk.Frame(items_frame, bg=HEADER_BG)
    header.pack(fill=tk.X)
    for i, col in enumerate(cols):
        tk.Label(header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=12).grid(row=0, column=i)

    rows = []
    def add_row():
        row_frame = tk.Frame(items_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=12)
            ent.grid(row=0, column=i)
            sv_list.append(sv)
        rows.append(sv_list)

    for _ in range(5): add_row()

    def save_flour_out():
        if not papad_company_var.get().strip():
            messagebox.showwarning("Validation", "Papad Company is required!")
            return
        try:
            cursor.execute("""
                INSERT INTO flour_out (s_no, date, papad_company, remarks)
                VALUES (?, ?, ?, ?)
            """, (int(s_no_var.get()), date_var.get(), papad_company_var.get(), remarks_var.get()))
            flour_out_id = cursor.lastrowid

            # Save items
            for row in rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO flour_out_items (flour_out_id, item_name, lot_no, weight, qty, total_wt, papad_kg, wages_bag, wages)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (flour_out_id, row[0].get(), row[1].get(), float(row[2].get() or 0), float(row[3].get() or 0),
                          float(row[4].get() or 0), float(row[5].get() or 0), float(row[6].get() or 0), float(row[7].get() or 0)))

            conn.commit()
            messagebox.showinfo("Success", "Flour Out entry saved successfully!")
            win.destroy()
        except Exception as e:
            messagebox.showerror("Error", str(e))

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Save", command=save_flour_out, bg=BUTTON_BG, fg=BUTTON_FG, width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)

# ---------- FLOUR OUT DISPLAY ----------
def open_flour_out_display():
    win = tk.Toplevel(root)
    win.title("Display Flour Out")
    win.geometry("1000x600")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Flour Out List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    search_var = tk.StringVar()
    sf = tk.Frame(win, bg=FRAME_BG)
    sf.pack(fill="x", padx=10, pady=5)
    tk.Label(sf, text="Search Papad Company:", bg=FRAME_BG).pack(side="left", padx=5)
    tk.Entry(sf, textvariable=search_var, width=30).pack(side="left", padx=5)

    cols = ("S.No", "Date", "Papad Company", "Remarks")
    tree = ttk.Treeview(win, columns=cols, show="headings")
    for c in cols:
        tree.heading(c, text=c)
        tree.column(c, width=150)
    tree.pack(fill="both", expand=True, padx=10, pady=10)

    def load_data(*args):
        for i in tree.get_children():
            tree.delete(i)
        q = f"%{search_var.get()}%"
        cursor.execute("SELECT s_no, date, papad_company, remarks FROM flour_out WHERE papad_company LIKE ?", (q,))
        for row in cursor.fetchall():
            tree.insert("", "end", values=row)

    search_var.trace("w", load_data)
    load_data()

    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(pady=10)

# ---------- FLOUR OUT EDIT ----------
def open_flour_out_edit():
    win = tk.Toplevel(root)
    win.title("Edit Flour Out Entry")
    win.geometry("1200x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Edit Flour Out Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    # Selection frame
    select_frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=10)
    select_frame.pack(fill="x")

    tk.Label(select_frame, text="Select S.No:", bg=FRAME_BG).grid(row=0, column=0, pady=5)
    sno_var = tk.StringVar()
    cursor.execute("SELECT s_no FROM flour_out ORDER BY s_no")
    snos = [str(r[0]) for r in cursor.fetchall()]
    sno_combo = ttk.Combobox(select_frame, values=snos, textvariable=sno_var, width=20)
    sno_combo.grid(row=0, column=1, pady=5, padx=10)

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left frame for header info
    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    date_var = tk.StringVar()
    papad_company_var = tk.StringVar()
    remarks_var = tk.StringVar()

    fields = [
        ("Date:", date_var),
        ("Papad Company:", papad_company_var),
        ("Remarks:", remarks_var)
    ]

    for i, (label, var) in enumerate(fields):
        tk.Label(left_frame, text=label, bg=FRAME_BG, anchor="w", width=15).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(left_frame, textvariable=var, width=25).grid(row=i, column=1, pady=5, padx=5)

    # Right frame for items
    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Items
    items_frame = tk.Frame(right_frame, bg=FRAME_BG)
    items_frame.pack(fill=tk.BOTH, expand=True)

    tk.Label(items_frame, text="Flour Out Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    cols = ("Item Name", "Lot No", "Weight", "Qty", "Total Wt", "Papad/kg", "Wages/Bag", "Wages")
    header = tk.Frame(items_frame, bg=HEADER_BG)
    header.pack(fill=tk.X)
    for i, col in enumerate(cols):
        tk.Label(header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=12).grid(row=0, column=i)

    rows = []

    def load_flour_out(event=None):
        cursor.execute("SELECT date, papad_company, remarks FROM flour_out WHERE s_no=?", (int(sno_var.get()),))
        row = cursor.fetchone()
        if row:
            date_var.set(row[0])
            papad_company_var.set(row[1])
            remarks_var.set(row[2])

            # Clear existing rows
            for frame in items_frame.winfo_children():
                if isinstance(frame, tk.Frame) and frame != header:
                    frame.destroy()

            rows.clear()

            # Load items
            cursor.execute("SELECT item_name, lot_no, weight, qty, total_wt, papad_kg, wages_bag, wages FROM flour_out_items WHERE flour_out_id=(SELECT id FROM flour_out WHERE s_no=?)", (int(sno_var.get()),))
            data = cursor.fetchall()
            for data_row in data:
                add_row(data_row)

    def add_row(data=None):
        row_frame = tk.Frame(items_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=12)
            ent.grid(row=0, column=i)
            if data:
                sv.set(str(data[i]))
            sv_list.append(sv)
        rows.append(sv_list)

    sno_combo.bind("<<ComboboxSelected>>", load_flour_out)

    def update_flour_out():
        try:
            cursor.execute("""
                UPDATE flour_out SET date=?, papad_company=?, remarks=? WHERE s_no=?
            """, (date_var.get(), papad_company_var.get(), remarks_var.get(), int(sno_var.get())))
            flour_out_id_result = cursor.execute("SELECT id FROM flour_out WHERE s_no=?", (int(sno_var.get()),))
            flour_out_id = flour_out_id_result.fetchone()[0]

            # Delete existing items
            cursor.execute("DELETE FROM flour_out_items WHERE flour_out_id=?", (flour_out_id,))

            # Save items
            for row in rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO flour_out_items (flour_out_id, item_name, lot_no, weight, qty, total_wt, papad_kg, wages_bag, wages)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (flour_out_id, row[0].get(), row[1].get(), float(row[2].get() or 0), float(row[3].get() or 0),
                          float(row[4].get() or 0), float(row[5].get() or 0), float(row[6].get() or 0), float(row[7].get() or 0)))

            conn.commit()
            messagebox.showinfo("Success", "Flour Out entry updated successfully!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Update", command=update_flour_out, bg="#4CAF50", fg="white", width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)

# ==============================================================
# SALES MODULE
# ==============================================================

# Database setup for Sales
cursor.execute("""
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    s_no INTEGER NOT NULL,
    date TEXT NOT NULL,
    customer TEXT,
    remarks TEXT,
    total_qty REAL DEFAULT 0,
    total_wt REAL DEFAULT 0,
    total_amt REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS sales_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_id INTEGER,
    item_name TEXT NOT NULL,
    lot_no TEXT,
    weight REAL,
    qty REAL,
    total_wt REAL,
    rate REAL,
    disc_perc REAL,
    tax_perc REAL,
    total_amt REAL,
    FOREIGN KEY(sales_id) REFERENCES sales(id)
)
""")
conn.commit()

def get_next_sales_sno():
    cursor.execute("SELECT MAX(s_no) FROM sales")
    last_sno = cursor.fetchone()[0]
    return (last_sno or 0) + 1

# ---------- SALES CREATE ----------
def open_sales_create():
    win = tk.Toplevel(root)
    win.title("Create Sales Entry")
    win.geometry("1200x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Create Sales Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left frame for header info
    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    s_no_var = tk.StringVar(value=str(get_next_sales_sno()))
    date_var = tk.StringVar(value=datetime.now().strftime("%d-%m-%Y"))
    customer_var = tk.StringVar()
    remarks_var = tk.StringVar()

    fields = [
        ("S.No:", s_no_var),
        ("Date:", date_var),
        ("Customer:", customer_var),
        ("Remarks:", remarks_var)
    ]

    for i, (label, var) in enumerate(fields):
        tk.Label(left_frame, text=label, bg=FRAME_BG, anchor="w", width=15).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(left_frame, textvariable=var, width=25).grid(row=i, column=1, pady=5, padx=5)

    # Right frame for items
    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Items
    items_frame = tk.Frame(right_frame, bg=FRAME_BG)
    items_frame.pack(fill=tk.BOTH, expand=True)

    tk.Label(items_frame, text="Sales Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    cols = ("Item Name", "Lot No", "Weight", "Qty", "Total Wt", "Rate", "Disc %", "Tax %", "Total Amt")
    header = tk.Frame(items_frame, bg=HEADER_BG)
    header.pack(fill=tk.X)
    for i, col in enumerate(cols):
        tk.Label(header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=12).grid(row=0, column=i)

    rows = []
    def add_row():
        row_frame = tk.Frame(items_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=12)
            ent.grid(row=0, column=i)
            sv_list.append(sv)
        rows.append(sv_list)

    for _ in range(5): add_row()

    def save_sales():
        if not customer_var.get().strip():
            messagebox.showwarning("Validation", "Customer is required!")
            return
        try:
            cursor.execute("""
                INSERT INTO sales (s_no, date, customer, remarks)
                VALUES (?, ?, ?, ?)
            """, (int(s_no_var.get()), date_var.get(), customer_var.get(), remarks_var.get()))
            sales_id = cursor.lastrowid

            # Save items
            for row in rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO sales_items (sales_id, item_name, lot_no, weight, qty, total_wt, rate, disc_perc, tax_perc, total_amt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (sales_id, row[0].get(), row[1].get(), float(row[2].get() or 0), float(row[3].get() or 0),
                          float(row[4].get() or 0), float(row[5].get() or 0), float(row[6].get() or 0), float(row[7].get() or 0), float(row[8].get() or 0)))

            conn.commit()
            messagebox.showinfo("Success", "Sales entry saved successfully!")
            win.destroy()
        except Exception as e:
            messagebox.showerror("Error", str(e))

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Save", command=save_sales, bg=BUTTON_BG, fg=BUTTON_FG, width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)

# ---------- SALES DISPLAY ----------
def open_sales_display():
    win = tk.Toplevel(root)
    win.title("Display Sales")
    win.geometry("1000x600")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Sales List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    search_var = tk.StringVar()
    sf = tk.Frame(win, bg=FRAME_BG)
    sf.pack(fill="x", padx=10, pady=5)
    tk.Label(sf, text="Search Customer:", bg=FRAME_BG).pack(side="left", padx=5)
    tk.Entry(sf, textvariable=search_var, width=30).pack(side="left", padx=5)

    cols = ("S.No", "Date", "Customer", "Remarks")
    tree = ttk.Treeview(win, columns=cols, show="headings")
    for c in cols:
        tree.heading(c, text=c)
        tree.column(c, width=150)
    tree.pack(fill="both", expand=True, padx=10, pady=10)

    def load_data(*args):
        for i in tree.get_children():
            tree.delete(i)
        q = f"%{search_var.get()}%"
        cursor.execute("SELECT s_no, date, customer, remarks FROM sales WHERE customer LIKE ?", (q,))
        for row in cursor.fetchall():
            tree.insert("", "end", values=row)

    search_var.trace("w", load_data)
    load_data()

    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(pady=10)

# ---------- SALES EDIT ----------
def open_sales_edit():
    win = tk.Toplevel(root)
    win.title("Edit Sales Entry")
    win.geometry("1200x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Edit Sales Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    # Selection frame
    select_frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=10)
    select_frame.pack(fill="x")

    tk.Label(select_frame, text="Select S.No:", bg=FRAME_BG).grid(row=0, column=0, pady=5)
    sno_var = tk.StringVar()
    cursor.execute("SELECT s_no FROM sales ORDER BY s_no")
    snos = [str(r[0]) for r in cursor.fetchall()]
    sno_combo = ttk.Combobox(select_frame, values=snos, textvariable=sno_var, width=20)
    sno_combo.grid(row=0, column=1, pady=5, padx=10)

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left frame for header info
    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    date_var = tk.StringVar()
    customer_var = tk.StringVar()
    remarks_var = tk.StringVar()

    fields = [
        ("Date:", date_var),
        ("Customer:", customer_var),
        ("Remarks:", remarks_var)
    ]

    for i, (label, var) in enumerate(fields):
        tk.Label(left_frame, text=label, bg=FRAME_BG, anchor="w", width=15).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(left_frame, textvariable=var, width=25).grid(row=i, column=1, pady=5, padx=5)

    # Right frame for items
    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Items
    items_frame = tk.Frame(right_frame, bg=FRAME_BG)
    items_frame.pack(fill=tk.BOTH, expand=True)

    tk.Label(items_frame, text="Sales Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    cols = ("Item Name", "Lot No", "Weight", "Qty", "Total Wt", "Rate", "Disc %", "Tax %", "Total Amt")
    header = tk.Frame(items_frame, bg=HEADER_BG)
    header.pack(fill=tk.X)
    for i, col in enumerate(cols):
        tk.Label(header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=12).grid(row=0, column=i)

    rows = []

    def load_sales(event=None):
        cursor.execute("SELECT date, customer, remarks FROM sales WHERE s_no=?", (int(sno_var.get()),))
        row = cursor.fetchone()
        if row:
            date_var.set(row[0])
            customer_var.set(row[1])
            remarks_var.set(row[2])

            # Clear existing rows
            for frame in items_frame.winfo_children():
                if isinstance(frame, tk.Frame) and frame != header:
                    frame.destroy()

            rows.clear()

            # Load items
            cursor.execute("SELECT item_name, lot_no, weight, qty, total_wt, rate, disc_perc, tax_perc, total_amt FROM sales_items WHERE sales_id=(SELECT id FROM sales WHERE s_no=?)", (int(sno_var.get()),))
            data = cursor.fetchall()
            for data_row in data:
                add_row(data_row)

    def add_row(data=None):
        row_frame = tk.Frame(items_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=12)
            ent.grid(row=0, column=i)
            if data:
                sv.set(str(data[i]))
            sv_list.append(sv)
        rows.append(sv_list)

    sno_combo.bind("<<ComboboxSelected>>", load_sales)

    def update_sales():
        try:
            cursor.execute("""
                UPDATE sales SET date=?, customer=?, remarks=? WHERE s_no=?
            """, (date_var.get(), customer_var.get(), remarks_var.get(), int(sno_var.get())))
            sales_id_result = cursor.execute("SELECT id FROM sales WHERE s_no=?", (int(sno_var.get()),))
            sales_id = sales_id_result.fetchone()[0]

            # Delete existing items
            cursor.execute("DELETE FROM sales_items WHERE sales_id=?", (sales_id,))

            # Save items
            for row in rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO sales_items (sales_id, item_name, lot_no, weight, qty, total_wt, rate, disc_perc, tax_perc, total_amt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (sales_id, row[0].get(), row[1].get(), float(row[2].get() or 0), float(row[3].get() or 0),
                          float(row[4].get() or 0), float(row[5].get() or 0), float(row[6].get() or 0), float(row[7].get() or 0), float(row[8].get() or 0)))

            conn.commit()
            messagebox.showinfo("Success", "Sales entry updated successfully!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Update", command=update_sales, bg="#4CAF50", fg="white", width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)

# ==============================================================
# SALES RETURN MODULE
# ==============================================================

# Database setup for Sales Return
cursor.execute("""
CREATE TABLE IF NOT EXISTS sales_return (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    s_no INTEGER NOT NULL,
    date TEXT NOT NULL,
    customer TEXT,
    remarks TEXT,
    total_qty REAL DEFAULT 0,
    total_wt REAL DEFAULT 0,
    total_amt REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS sales_return_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_return_id INTEGER,
    item_name TEXT NOT NULL,
    lot_no TEXT,
    weight REAL,
    qty REAL,
    total_wt REAL,
    rate REAL,
    disc_perc REAL,
    tax_perc REAL,
    total_amt REAL,
    FOREIGN KEY(sales_return_id) REFERENCES sales_return(id)
)
""")
conn.commit()

def get_next_sales_return_sno():
    cursor.execute("SELECT MAX(s_no) FROM sales_return")
    last_sno = cursor.fetchone()[0]
    return (last_sno or 0) + 1

# ---------- SALES RETURN CREATE ----------
def open_sales_return_create():
    win = tk.Toplevel(root)
    win.title("Create Sales Return Entry")
    win.geometry("1200x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Create Sales Return Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left frame for header info
    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    s_no_var = tk.StringVar(value=str(get_next_sales_return_sno()))
    date_var = tk.StringVar(value=datetime.now().strftime("%d-%m-%Y"))
    customer_var = tk.StringVar()
    remarks_var = tk.StringVar()

    fields = [
        ("S.No:", s_no_var),
        ("Date:", date_var),
        ("Customer:", customer_var),
        ("Remarks:", remarks_var)
    ]

    for i, (label, var) in enumerate(fields):
        tk.Label(left_frame, text=label, bg=FRAME_BG, anchor="w", width=15).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(left_frame, textvariable=var, width=25).grid(row=i, column=1, pady=5, padx=5)

    # Right frame for items
    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Items
    items_frame = tk.Frame(right_frame, bg=FRAME_BG)
    items_frame.pack(fill=tk.BOTH, expand=True)

    tk.Label(items_frame, text="Sales Return Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    cols = ("Item Name", "Lot No", "Weight", "Qty", "Total Wt", "Rate", "Disc %", "Tax %", "Total Amt")
    header = tk.Frame(items_frame, bg=HEADER_BG)
    header.pack(fill=tk.X)
    for i, col in enumerate(cols):
        tk.Label(header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=12).grid(row=0, column=i)

    rows = []
    def add_row():
        row_frame = tk.Frame(items_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=12)
            ent.grid(row=0, column=i)
            sv_list.append(sv)
        rows.append(sv_list)

    for _ in range(5): add_row()

    def save_sales_return():
        if not customer_var.get().strip():
            messagebox.showwarning("Validation", "Customer is required!")
            return
        try:
            cursor.execute("""
                INSERT INTO sales_return (s_no, date, customer, remarks)
                VALUES (?, ?, ?, ?)
            """, (int(s_no_var.get()), date_var.get(), customer_var.get(), remarks_var.get()))
            sales_return_id = cursor.lastrowid

            # Save items
            for row in rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO sales_return_items (sales_return_id, item_name, lot_no, weight, qty, total_wt, rate, disc_perc, tax_perc, total_amt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (sales_return_id, row[0].get(), row[1].get(), float(row[2].get() or 0), float(row[3].get() or 0),
                          float(row[4].get() or 0), float(row[5].get() or 0), float(row[6].get() or 0), float(row[7].get() or 0), float(row[8].get() or 0)))

            conn.commit()
            messagebox.showinfo("Success", "Sales Return entry saved successfully!")
            win.destroy()
        except Exception as e:
            messagebox.showerror("Error", str(e))

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Save", command=save_sales_return, bg=BUTTON_BG, fg=BUTTON_FG, width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)

# ---------- SALES RETURN DISPLAY ----------
def open_sales_return_display():
    win = tk.Toplevel(root)
    win.title("Display Sales Return")
    win.geometry("1000x600")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Sales Return List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    search_var = tk.StringVar()
    sf = tk.Frame(win, bg=FRAME_BG)
    sf.pack(fill="x", padx=10, pady=5)
    tk.Label(sf, text="Search Customer:", bg=FRAME_BG).pack(side="left", padx=5)
    tk.Entry(sf, textvariable=search_var, width=30).pack(side="left", padx=5)

    cols = ("S.No", "Date", "Customer", "Remarks")
    tree = ttk.Treeview(win, columns=cols, show="headings")
    for c in cols:
        tree.heading(c, text=c)
        tree.column(c, width=150)
    tree.pack(fill="both", expand=True, padx=10, pady=10)

    def load_data(*args):
        for i in tree.get_children():
            tree.delete(i)
        q = f"%{search_var.get()}%"
        cursor.execute("SELECT s_no, date, customer, remarks FROM sales_return WHERE customer LIKE ?", (q,))
        for row in cursor.fetchall():
            tree.insert("", "end", values=row)

    search_var.trace("w", load_data)
    load_data()

    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(pady=10)

# ---------- SALES RETURN EDIT ----------
def open_sales_return_edit():
    win = tk.Toplevel(root)
    win.title("Edit Sales Return Entry")
    win.geometry("1200x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Edit Sales Return Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    # Selection frame
    select_frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=10)
    select_frame.pack(fill="x")

    tk.Label(select_frame, text="Select S.No:", bg=FRAME_BG).grid(row=0, column=0, pady=5)
    sno_var = tk.StringVar()
    cursor.execute("SELECT s_no FROM sales_return ORDER BY s_no")
    snos = [str(r[0]) for r in cursor.fetchall()]
    sno_combo = ttk.Combobox(select_frame, values=snos, textvariable=sno_var, width=20)
    sno_combo.grid(row=0, column=1, pady=5, padx=10)

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left frame for header info
    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    date_var = tk.StringVar()
    customer_var = tk.StringVar()
    remarks_var = tk.StringVar()

    fields = [
        ("Date:", date_var),
        ("Customer:", customer_var),
        ("Remarks:", remarks_var)
    ]

    for i, (label, var) in enumerate(fields):
        tk.Label(left_frame, text=label, bg=FRAME_BG, anchor="w", width=15).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(left_frame, textvariable=var, width=25).grid(row=i, column=1, pady=5, padx=5)

    # Right frame for items
    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Items
    items_frame = tk.Frame(right_frame, bg=FRAME_BG)
    items_frame.pack(fill=tk.BOTH, expand=True)

    tk.Label(items_frame, text="Sales Return Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    cols = ("Item Name", "Lot No", "Weight", "Qty", "Total Wt", "Rate", "Disc %", "Tax %", "Total Amt")
    header = tk.Frame(items_frame, bg=HEADER_BG)
    header.pack(fill=tk.X)
    for i, col in enumerate(cols):
        tk.Label(header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=12).grid(row=0, column=i)

    rows = []

    def load_sales_return(event=None):
        cursor.execute("SELECT date, customer, remarks FROM sales_return WHERE s_no=?", (int(sno_var.get()),))
        row = cursor.fetchone()
        if row:
            date_var.set(row[0])
            customer_var.set(row[1])
            remarks_var.set(row[2])

            # Clear existing rows
            for frame in items_frame.winfo_children():
                if isinstance(frame, tk.Frame) and frame != header:
                    frame.destroy()

            rows.clear()

            # Load items
            cursor.execute("SELECT item_name, lot_no, weight, qty, total_wt, rate, disc_perc, tax_perc, total_amt FROM sales_return_items WHERE sales_return_id=(SELECT id FROM sales_return WHERE s_no=?)", (int(sno_var.get()),))
            data = cursor.fetchall()
            for data_row in data:
                add_row(data_row)

    def add_row(data=None):
        row_frame = tk.Frame(items_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=12)
            ent.grid(row=0, column=i)
            if data:
                sv.set(str(data[i]))
            sv_list.append(sv)
        rows.append(sv_list)

    sno_combo.bind("<<ComboboxSelected>>", load_sales_return)

    def update_sales_return():
        try:
            cursor.execute("""
                UPDATE sales_return SET date=?, customer=?, remarks=? WHERE s_no=?
            """, (date_var.get(), customer_var.get(), remarks_var.get(), int(sno_var.get())))
            sales_return_id_result = cursor.execute("SELECT id FROM sales_return WHERE s_no=?", (int(sno_var.get()),))
            sales_return_id = sales_return_id_result.fetchone()[0]

            # Delete existing items
            cursor.execute("DELETE FROM sales_return_items WHERE sales_return_id=?", (sales_return_id,))

            # Save items
            for row in rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO sales_return_items (sales_return_id, item_name, lot_no, weight, qty, total_wt, rate, disc_perc, tax_perc, total_amt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (sales_return_id, row[0].get(), row[1].get(), float(row[2].get() or 0), float(row[3].get() or 0),
                          float(row[4].get() or 0), float(row[5].get() or 0), float(row[6].get() or 0), float(row[7].get() or 0), float(row[8].get() or 0)))

            conn.commit()
            messagebox.showinfo("Success", "Sales Return entry updated successfully!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Update", command=update_sales_return, bg="#4CAF50", fg="white", width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)

# ==============================================================
# GRAINS MODULE
# ==============================================================

# Database setup for Grains
cursor.execute("""
CREATE TABLE IF NOT EXISTS grains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    s_no INTEGER NOT NULL,
    flour_mill TEXT,
    date TEXT NOT NULL,
    remarks TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS grain_input_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grain_id INTEGER,
    item_name TEXT NOT NULL,
    lot_no TEXT,
    weight REAL,
    qty REAL,
    total_wt REAL,
    wages_kg REAL,
    total_wages REAL,
    FOREIGN KEY(grain_id) REFERENCES grains(id)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS grain_output_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grain_id INTEGER,
    item_name TEXT NOT NULL,
    weight REAL,
    qty REAL,
    total_wt REAL,
    FOREIGN KEY(grain_id) REFERENCES grains(id)
)
""")
conn.commit()

def get_next_grain_sno():
    cursor.execute("SELECT MAX(s_no) FROM grains")
    last_sno = cursor.fetchone()[0]
    return (last_sno or 0) + 1

# ---------- GRAINS CREATE ----------
def open_grains_create():
    win = tk.Toplevel(root)
    win.title("Create Grains Entry")
    win.geometry("1200x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Create Grains Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left frame for header info
    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    s_no_var = tk.StringVar(value=str(get_next_grain_sno()))
    flour_mill_var = tk.StringVar()
    date_var = tk.StringVar(value=datetime.now().strftime("%d-%m-%Y"))
    remarks_var = tk.StringVar()

    fields = [
        ("S.No:", s_no_var),
        ("Flour Mill:", flour_mill_var),
        ("Date:", date_var),
        ("Remarks:", remarks_var)
    ]

    for i, (label, var) in enumerate(fields):
        tk.Label(left_frame, text=label, bg=FRAME_BG, anchor="w", width=15).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(left_frame, textvariable=var, width=25).grid(row=i, column=1, pady=5, padx=5)

    # Right frame for input/output items
    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Input Items
    input_frame = tk.Frame(right_frame, bg=FRAME_BG)
    input_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

    tk.Label(input_frame, text="Input Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    input_cols = ("Item Name", "Lot No", "Weight", "Qty", "Total Wt", "Wages/kg", "Total Wages")
    input_header = tk.Frame(input_frame, bg=HEADER_BG)
    input_header.pack(fill=tk.X)
    for i, col in enumerate(input_cols):
        tk.Label(input_header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=12).grid(row=0, column=i)

    input_rows = []
    def add_input_row():
        row_frame = tk.Frame(input_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(input_cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=12)
            ent.grid(row=0, column=i)
            sv_list.append(sv)
        input_rows.append(sv_list)

    for _ in range(3): add_input_row()

    # Output Items
    output_frame = tk.Frame(right_frame, bg=FRAME_BG)
    output_frame.pack(fill=tk.BOTH, expand=True)

    tk.Label(output_frame, text="Output Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    output_cols = ("Item Name", "Weight", "Qty", "Total Wt")
    output_header = tk.Frame(output_frame, bg=HEADER_BG)
    output_header.pack(fill=tk.X)
    for i, col in enumerate(output_cols):
        tk.Label(output_header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=15).grid(row=0, column=i)

    output_rows = []
    def add_output_row():
        row_frame = tk.Frame(output_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(output_cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=15)
            ent.grid(row=0, column=i)
            sv_list.append(sv)
        output_rows.append(sv_list)

    for _ in range(3): add_output_row()

    def save_grains():
        if not flour_mill_var.get().strip():
            messagebox.showwarning("Validation", "Flour Mill is required!")
            return
        try:
            cursor.execute("""
                INSERT INTO grains (s_no, flour_mill, date, remarks)
                VALUES (?, ?, ?, ?)
            """, (int(s_no_var.get()), flour_mill_var.get(), date_var.get(), remarks_var.get()))
            grain_id = cursor.lastrowid

            # Save input items
            for row in input_rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO grain_input_items (grain_id, item_name, lot_no, weight, qty, total_wt, wages_kg, total_wages)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (grain_id, row[0].get(), row[1].get(), float(row[2].get() or 0), float(row[3].get() or 0),
                          float(row[4].get() or 0), float(row[5].get() or 0), float(row[6].get() or 0)))

            # Save output items
            for row in output_rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO grain_output_items (grain_id, item_name, weight, qty, total_wt)
                        VALUES (?, ?, ?, ?, ?)
                    """, (grain_id, row[0].get(), float(row[1].get() or 0), float(row[2].get() or 0), float(row[3].get() or 0)))

            conn.commit()
            messagebox.showinfo("Success", "Grains entry saved successfully!")
            win.destroy()
        except Exception as e:
            messagebox.showerror("Error", str(e))

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Save", command=save_grains, bg=BUTTON_BG, fg=BUTTON_FG, width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)

# ---------- GRAINS DISPLAY ----------
def open_grains_display():
    win = tk.Toplevel(root)
    win.title("Display Grains")
    win.geometry("1000x600")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Grains List", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    search_var = tk.StringVar()
    sf = tk.Frame(win, bg=FRAME_BG)
    sf.pack(fill="x", padx=10, pady=5)
    tk.Label(sf, text="Search Flour Mill:", bg=FRAME_BG).pack(side="left", padx=5)
    tk.Entry(sf, textvariable=search_var, width=30).pack(side="left", padx=5)

    cols = ("S.No", "Flour Mill", "Date", "Remarks")
    tree = ttk.Treeview(win, columns=cols, show="headings")
    for c in cols:
        tree.heading(c, text=c)
        tree.column(c, width=150)
    tree.pack(fill="both", expand=True, padx=10, pady=10)

    def load_data(*args):
        for i in tree.get_children():
            tree.delete(i)
        q = f"%{search_var.get()}%"
        cursor.execute("SELECT s_no, flour_mill, date, remarks FROM grains WHERE flour_mill LIKE ?", (q,))
        for row in cursor.fetchall():
            tree.insert("", "end", values=row)

    search_var.trace("w", load_data)
    load_data()

    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(pady=10)

# ---------- GRAINS EDIT ----------
def open_grains_edit():
    win = tk.Toplevel(root)
    win.title("Edit Grains Entry")
    win.geometry("1200x700")
    win.config(bg=FRAME_BG)
    win.grab_set()

    tk.Label(win, text="Edit Grains Entry", font=("Segoe UI", 14, "bold"),
             bg=HEADER_BG, fg=HEADER_FG, pady=10).pack(fill="x")

    # Selection frame
    select_frame = tk.Frame(win, bg=FRAME_BG, padx=20, pady=10)
    select_frame.pack(fill="x")

    tk.Label(select_frame, text="Select S.No:", bg=FRAME_BG).grid(row=0, column=0, pady=5)
    sno_var = tk.StringVar()
    cursor.execute("SELECT s_no FROM grains ORDER BY s_no")
    snos = [str(r[0]) for r in cursor.fetchall()]
    sno_combo = ttk.Combobox(select_frame, values=snos, textvariable=sno_var, width=20)
    sno_combo.grid(row=0, column=1, pady=5, padx=10)

    main_frame = tk.Frame(win, bg=FRAME_BG)
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    # Left frame for header info
    left_frame = tk.Frame(main_frame, bg=FRAME_BG)
    left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 20))

    flour_mill_var = tk.StringVar()
    date_var = tk.StringVar()
    remarks_var = tk.StringVar()

    fields = [
        ("Flour Mill:", flour_mill_var),
        ("Date:", date_var),
        ("Remarks:", remarks_var)
    ]

    for i, (label, var) in enumerate(fields):
        tk.Label(left_frame, text=label, bg=FRAME_BG, anchor="w", width=15).grid(row=i, column=0, sticky="w", pady=5)
        tk.Entry(left_frame, textvariable=var, width=25).grid(row=i, column=1, pady=5, padx=5)

    # Right frame for input/output items
    right_frame = tk.Frame(main_frame, bg=FRAME_BG)
    right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Input Items
    input_frame = tk.Frame(right_frame, bg=FRAME_BG)
    input_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

    tk.Label(input_frame, text="Input Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    input_cols = ("Item Name", "Lot No", "Weight", "Qty", "Total Wt", "Wages/kg", "Total Wages")
    input_header = tk.Frame(input_frame, bg=HEADER_BG)
    input_header.pack(fill=tk.X)
    for i, col in enumerate(input_cols):
        tk.Label(input_header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=12).grid(row=0, column=i)

    input_rows = []

    # Output Items
    output_frame = tk.Frame(right_frame, bg=FRAME_BG)
    output_frame.pack(fill=tk.BOTH, expand=True)

    tk.Label(output_frame, text="Output Items", font=("Segoe UI", 12, "bold"), bg=FRAME_BG).pack(pady=5)

    output_cols = ("Item Name", "Weight", "Qty", "Total Wt")
    output_header = tk.Frame(output_frame, bg=HEADER_BG)
    output_header.pack(fill=tk.X)
    for i, col in enumerate(output_cols):
        tk.Label(output_header, text=col, bg=HEADER_BG, fg=HEADER_FG, width=15).grid(row=0, column=i)

    output_rows = []

    def load_grains(event=None):
        cursor.execute("SELECT flour_mill, date, remarks FROM grains WHERE s_no=?", (int(sno_var.get()),))
        row = cursor.fetchone()
        if row:
            flour_mill_var.set(row[0])
            date_var.set(row[1])
            remarks_var.set(row[2])

            # Clear existing rows
            for frame in input_frame.winfo_children():
                if isinstance(frame, tk.Frame) and frame != input_header:
                    frame.destroy()
            for frame in output_frame.winfo_children():
                if isinstance(frame, tk.Frame) and frame != output_header:
                    frame.destroy()

            input_rows.clear()
            output_rows.clear()

            # Load input items
            cursor.execute("SELECT item_name, lot_no, weight, qty, total_wt, wages_kg, total_wages FROM grain_input_items WHERE grain_id=(SELECT id FROM grains WHERE s_no=?)", (int(sno_var.get()),))
            input_data = cursor.fetchall()
            for data in input_data:
                add_input_row(data)

            # Load output items
            cursor.execute("SELECT item_name, weight, qty, total_wt FROM grain_output_items WHERE grain_id=(SELECT id FROM grains WHERE s_no=?)", (int(sno_var.get()),))
            output_data = cursor.fetchall()
            for data in output_data:
                add_output_row(data)

    def add_input_row(data=None):
        row_frame = tk.Frame(input_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(input_cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=12)
            ent.grid(row=0, column=i)
            if data:
                sv.set(str(data[i]))
            sv_list.append(sv)
        input_rows.append(sv_list)

    def add_output_row(data=None):
        row_frame = tk.Frame(output_frame, bg=FRAME_BG)
        row_frame.pack(fill=tk.X, pady=2)
        sv_list = []
        for i in range(len(output_cols)):
            sv = tk.StringVar()
            ent = tk.Entry(row_frame, textvariable=sv, width=15)
            ent.grid(row=0, column=i)
            if data:
                sv.set(str(data[i]))
            sv_list.append(sv)
        output_rows.append(sv_list)

    sno_combo.bind("<<ComboboxSelected>>", load_grains)

    def update_grains():
        try:
            cursor.execute("""
                UPDATE grains SET flour_mill=?, date=?, remarks=? WHERE s_no=?
            """, (flour_mill_var.get(), date_var.get(), remarks_var.get(), int(sno_var.get())))
            grain_id_result = cursor.execute("SELECT id FROM grains WHERE s_no=?", (int(sno_var.get()),))
            grain_id = grain_id_result.fetchone()[0]

            # Delete existing items
            cursor.execute("DELETE FROM grain_input_items WHERE grain_id=?", (grain_id,))
            cursor.execute("DELETE FROM grain_output_items WHERE grain_id=?", (grain_id,))

            # Save input items
            for row in input_rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO grain_input_items (grain_id, item_name, lot_no, weight, qty, total_wt, wages_kg, total_wages)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (grain_id, row[0].get(), row[1].get(), float(row[2].get() or 0), float(row[3].get() or 0),
                          float(row[4].get() or 0), float(row[5].get() or 0), float(row[6].get() or 0)))

            # Save output items
            for row in output_rows:
                if any(sv.get().strip() for sv in row):
                    cursor.execute("""
                        INSERT INTO grain_output_items (grain_id, item_name, weight, qty, total_wt)
                        VALUES (?, ?, ?, ?, ?)
                    """, (grain_id, row[0].get(), float(row[1].get() or 0), float(row[2].get() or 0), float(row[3].get() or 0)))

            conn.commit()
            messagebox.showinfo("Success", "Grains entry updated successfully!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    btn_frame = tk.Frame(win, bg=FRAME_BG)
    btn_frame.pack(pady=10)
    tk.Button(btn_frame, text="Update", command=update_grains, bg="#4CAF50", fg="white", width=15).pack(side=tk.LEFT, padx=10)
    tk.Button(btn_frame, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(side=tk.LEFT, padx=10)

# ==============================================================
# WEIGHT MODULE
# ==============================================================
# Colors and style
BGCOLOR = "#FFFFFF"
HEADERBG = "#005F99"
HEADERFG = "white"
FRAMEBG = "#E6F0FA"
BUTTONBG = "#005F99"
BUTTONFG = "white"

# Database connection
conn = sqlite3.connect("inventory.db")
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS weightmaster (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    printname TEXT,
    weight REAL
)
""")
conn.commit()

def open_weight_create():
    win = tk.Toplevel(root)
    win.title("Create Weight Master")
    win.geometry("400x320")
    win.configure(bg=FRAMEBG)
    win.grab_set()

    name_var = tk.StringVar()
    printname_var = tk.StringVar()
    weight_var = tk.StringVar()

    tk.Label(win, text="Name", bg=FRAMEBG).pack(pady=5)
    tk.Entry(win, textvariable=name_var, width=30).pack()

    tk.Label(win, text="Print Name", bg=FRAMEBG).pack(pady=5)
    tk.Entry(win, textvariable=printname_var, width=30).pack()

    tk.Label(win, text="Weight (kgs)", bg=FRAMEBG).pack(pady=5)
    tk.Entry(win, textvariable=weight_var, width=30).pack()

    def save_weight():
        name = name_var.get().strip()
        printname = printname_var.get().strip()
        try:
            weight = float(weight_var.get())
        except:
            messagebox.showwarning("Validation", "Enter valid weight in kgs!")
            return

        if not name:
            messagebox.showwarning("Validation", "Name is required!")
            return
        try:
            cursor.execute("INSERT INTO weightmaster (name, printname, weight) VALUES (?, ?, ?)",
                (name, printname, weight))
            conn.commit()
            messagebox.showinfo("Saved", "Weight master entry added!")
            name_var.set(""); printname_var.set(""); weight_var.set("")
        except sqlite3.IntegrityError:
            messagebox.showerror("Error", "Name already exists!")

    tk.Button(win, text="Save", command=save_weight, bg=BUTTONBG, fg=BUTTONFG, width=15).pack(pady=15)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack()

def open_weight_display():
    win = tk.Toplevel(root)
    win.title("Display Weight Masters")
    win.geometry("500x400")
    win.configure(bg=FRAMEBG)
    win.grab_set()

    tree = ttk.Treeview(win, columns=('S.No', 'Name', 'Weight'), show='headings')
    tree.heading('S.No', text='S.No')
    tree.heading('Name', text='Name')
    tree.heading('Weight', text='Weight (kgs)')
    tree.column('S.No', width=80)
    tree.column('Name', width=200)
    tree.column('Weight', width=120)
    tree.pack(fill='both', expand=True, padx=10, pady=10)

    cursor.execute("SELECT id, name, weight FROM weightmaster ORDER BY id")
    for idx, row in enumerate(cursor.fetchall(), start=1):
        tree.insert('', 'end', values=(idx, row[1], row[2]))

    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(pady=10)

def open_weight_edit():
    win = tk.Toplevel(root)
    win.title("Edit/Update/Delete Weight Master")
    win.geometry("420x370")
    win.configure(bg=FRAMEBG)
    win.grab_set()

    cursor.execute("SELECT name FROM weightmaster")
    names = [r[0] for r in cursor.fetchall()]
    selected_name = tk.StringVar()

    ttk.Label(win, text="Select Name", background=FRAMEBG).pack(pady=6)
    name_cb = ttk.Combobox(win, values=names, textvariable=selected_name, width=28)
    name_cb.pack(pady=4)

    printname_var = tk.StringVar()
    weight_var = tk.StringVar()

    tk.Label(win, text="Print Name", bg=FRAMEBG).pack(pady=4)
    tk.Entry(win, textvariable=printname_var, width=30).pack()
    tk.Label(win, text="Weight (kgs)", bg=FRAMEBG).pack(pady=4)
    tk.Entry(win, textvariable=weight_var, width=30).pack()

    def load_selected(event=None):
        name = selected_name.get()
        if not name: return
        cursor.execute("SELECT printname, weight FROM weightmaster WHERE name=?", (name,))
        row = cursor.fetchone()
        if row:
            printname_var.set(row[0])
            weight_var.set(row[1])
    name_cb.bind("<<ComboboxSelected>>", load_selected)

    def update_weight():
        name = selected_name.get()
        printname = printname_var.get().strip()
        try:
            weight = float(weight_var.get())
        except:
            messagebox.showwarning("Validation", "Enter valid weight in kgs!")
            return
        cursor.execute("UPDATE weightmaster SET printname=?, weight=? WHERE name=?",
            (printname, weight, name))
        conn.commit()
        messagebox.showinfo("Updated", "Weight master updated!")

    def delete_weight():
        name = selected_name.get()
        if not name:
            messagebox.showwarning("Select Entry", "Select a name to delete!")
            return
        if messagebox.askyesno("Confirm Delete", f"Delete {name}?"):
            cursor.execute("DELETE FROM weightmaster WHERE name=?", (name,))
            conn.commit()
            printname_var.set(""); weight_var.set("")
            messagebox.showinfo("Deleted", "Entry deleted")
            # refresh combobox
            cursor.execute("SELECT name FROM weightmaster")
            names = [r[0] for r in cursor.fetchall()]
            name_cb["values"] = names
            selected_name.set("")

    tk.Button(win, text="Update", command=update_weight, bg="#4CAF50", fg="white", width=15).pack(pady=8)
    tk.Button(win, text="Delete", command=delete_weight, bg="#FF5733", fg="white", width=15).pack(pady=4)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white", width=15).pack(pady=8)



weightmenu = tk.Menu(master_menu, tearoff=0)
weightmenu.add_command(label="Create", command=open_weight_create)
weightmenu.add_command(label="Display", command=open_weight_display)
weightmenu.add_command(label="Edit/Update/Delete", command=open_weight_edit)
master_menu.add_cascade(label="Weight", menu=weightmenu)

# ==============================================================
# LEDGER & LEDGER GROUP MODULE
# ==============================================================
# Database setup
cursor.execute("""
CREATE TABLE IF NOT EXISTS ledgermaster (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    printname TEXT,
    under TEXT,
    openingbalance REAL,
    area TEXT,
    credit REAL,
    debit REAL
)
""")
conn.commit()

cursor.execute("""
CREATE TABLE IF NOT EXISTS ledgergroupmaster (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    printname TEXT,
    under TEXT
)
""")
# Ledger Group Master windows
def open_ledgergroup_create():
    win = tk.Toplevel(root)
    win.title("Create Ledger Group")
    win.geometry("400x320")
    win.configure(bg=FRAMEBG)
    win.grab_set()
    name_var = tk.StringVar()
    printname_var = tk.StringVar()
    under_var = tk.StringVar()
    cursor.execute("")
    tk.Label(win, text="Name", bg=FRAMEBG).pack(pady=5)
    tk.Entry(win, textvariable=name_var).pack()
    tk.Label(win, text="Print Name", bg=FRAMEBG).pack(pady=5)
    tk.Entry(win, textvariable=printname_var).pack()
    def save_group():
        if not name_var.get().strip():
            messagebox.showwarning("Validation", "Name required!")
            return
        cursor.execute("INSERT INTO ledgergroupmaster (name, printname) VALUES (?, ?)",
                       (name_var.get().strip(), printname_var.get().strip()))
        conn.commit()
        messagebox.showinfo("Saved", "Ledger group entry added!")
        name_var.set(""); printname_var.set(""); under_var.set("")
    tk.Button(win, text="Save", command=save_group, bg=BUTTONBG, fg=BUTTONFG).pack(pady=10)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white").pack()

def open_ledgergroup_display():
    win = tk.Toplevel(root)
    win.title("Display Ledger Groups")
    win.geometry("500x400")
    win.configure(bg=FRAMEBG)
    win.grab_set()
    tree = ttk.Treeview(win, columns=('S.No', 'Name'), show='headings')
    tree.heading('S.No', text='S.No')
    tree.heading('Name', text='Name')
    tree.pack(fill='both', expand=True)
    cursor.execute("SELECT name FROM ledgergroupmaster ORDER BY id")
    for idx, row in enumerate(cursor.fetchall(), start=1):
        tree.insert('', 'end', values=(idx, row[0]))
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white").pack(pady=8)

def open_ledgergroup_edit():
    win = tk.Toplevel(root)
    win.title("Edit/Delete Ledger Group")
    win.geometry("400x300")
    win.configure(bg=FRAMEBG)
    win.grab_set()
    cursor.execute("SELECT name FROM ledgergroupmaster")
    names = [r[0] for r in cursor.fetchall()]
    selected_name = tk.StringVar()
    name_combo = ttk.Combobox(win, values=names, textvariable=selected_name)
    name_combo.pack(pady=10)
    printname_var = tk.StringVar()
    under_var = tk.StringVar()
    tk.Label(win, text="Print Name", bg=FRAMEBG).pack()
    tk.Entry(win, textvariable=printname_var).pack()
    tk.Label(win, text="Under Group", bg=FRAMEBG).pack()
    tk.Entry(win, textvariable=under_var).pack()
    def load_selected(event=None):
        cursor.execute("SELECT printname, under FROM ledgergroupmaster WHERE name=?", (selected_name.get(),))
        row = cursor.fetchone()
        if row:
            printname_var.set(row[0])
            under_var.set(row[1])
    name_combo.bind("<<ComboboxSelected>>", load_selected)
    def update_group():
        cursor.execute("UPDATE ledgergroupmaster SET printname=?, under=? WHERE name=?",
                       (printname_var.get(), under_var.get(), selected_name.get()))
        conn.commit()
        messagebox.showinfo("Updated", "Ledger group updated!")
    def delete_group():
        if messagebox.askyesno("Confirm Delete", f"Delete {selected_name.get()}?"):
            cursor.execute("DELETE FROM ledgergroupmaster WHERE name=?", (selected_name.get(),))
            conn.commit()
            printname_var.set(""); under_var.set("")
            selected_name.set("")
            name_combo['values'] = [r[0] for r in cursor.execute("SELECT name FROM ledgergroupmaster")]
    tk.Button(win, text="Update", command=update_group, bg="#4CAF50", fg="white").pack(pady=8)
    tk.Button(win, text="Delete", command=delete_group, bg="#FF5733", fg="white").pack(pady=4)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white").pack(pady=8)
ledgergroupmenu = tk.Menu(master_menu, tearoff=0)
ledgergroupmenu.add_command(label="Create", command=open_ledgergroup_create)
ledgergroupmenu.add_command(label="Display", command=open_ledgergroup_display)
ledgergroupmenu.add_command(label="Edit/Update/Delete", command=open_ledgergroup_edit)
master_menu.add_cascade(label="Ledger Group", menu=ledgergroupmenu)

# Ledger Master windows
def open_ledger_create():
    win = tk.Toplevel(root)
    win.title("Create Ledger")
    win.geometry("450x340")
    win.configure(bg=FRAMEBG)
    win.grab_set()
    name_var = tk.StringVar()
    printname_var = tk.StringVar()
    under_var = tk.StringVar()
    openingbalance_var = tk.StringVar()
    area_var = tk.StringVar()
    cursor.execute("SELECT name FROM ledgergroupmaster")
    groupnames = [r[0] for r in cursor.fetchall()]
    tk.Label(win, text="Name", bg=FRAMEBG).pack(pady=4)
    tk.Entry(win, textvariable=name_var).pack()
    tk.Label(win, text="Print Name", bg=FRAMEBG).pack(pady=4)
    tk.Entry(win, textvariable=printname_var).pack()
    tk.Label(win, text="Under Group", bg=FRAMEBG).pack(pady=4)
    group_combo = ttk.Combobox(win, values=groupnames, textvariable=under_var)
    group_combo.pack()
    tk.Label(win, text="Opening Balance", bg=FRAMEBG).pack(pady=4)
    tk.Entry(win, textvariable=openingbalance_var).pack()
    tk.Label(win, text="Area", bg=FRAMEBG).pack(pady=4)
    tk.Entry(win, textvariable=area_var).pack()
    def save_ledger():
        try:
            cursor.execute("INSERT INTO ledgermaster (name, printname, under, openingbalance, area, credit, debit) VALUES (?, ?, ?, ?, ?, ?, ?)",
                           (name_var.get().strip(), printname_var.get().strip(), under_var.get().strip(), openingbalance_var.get().strip(), area_var.get().strip(), 0.0, 0.0))
            conn.commit()
            messagebox.showinfo("Saved", "Ledger entry added!")
            name_var.set(""); printname_var.set(""); under_var.set(""); openingbalance_var.set(""); area_var.set("")
        except sqlite3.IntegrityError:
            messagebox.showerror("Error", "Name already exists!")
    tk.Button(win, text="Save", command=save_ledger, bg=BUTTONBG, fg=BUTTONFG).pack(pady=10)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white").pack()

def open_ledger_display():
    win = tk.Toplevel(root)
    win.title("Display Ledgers")
    win.geometry("700x400")
    win.configure(bg=FRAMEBG)
    win.grab_set()
    tree = ttk.Treeview(win, columns=('S.No', 'Name', 'Area', 'Credit', 'Debit'), show='headings')
    tree.heading('S.No', text='S.No')
    tree.heading('Name', text='Name')
    tree.heading('Area', text='Area')
    tree.heading('Credit', text='Credit')
    tree.heading('Debit', text='Debit')
    tree.pack(fill='both', expand=True)
    cursor.execute("SELECT name, area, credit, debit FROM ledgermaster ORDER BY id")
    for idx, row in enumerate(cursor.fetchall(), start=1):
        tree.insert('', 'end', values=(idx, row[0], row[1], row[2], row[3]))
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white").pack(pady=8)

def open_ledger_edit():
    win = tk.Toplevel(root)
    win.title("Edit/Delete Ledger")
    win.geometry("420x320")
    win.configure(bg=FRAMEBG)
    win.grab_set()
    cursor.execute("SELECT name FROM ledgermaster")
    names = [r[0] for r in cursor.fetchall()]
    selected_name = tk.StringVar()
    name_combo = ttk.Combobox(win, values=names, textvariable=selected_name)
    name_combo.pack(pady=10)
    printname_var = tk.StringVar()
    under_var = tk.StringVar()
    openingbalance_var = tk.StringVar()
    area_var = tk.StringVar()
    credit_var = tk.StringVar()
    debit_var = tk.StringVar()
    tk.Label(win, text="Print Name", bg=FRAMEBG).pack()
    tk.Entry(win, textvariable=printname_var).pack()
    tk.Label(win, text="Under Group", bg=FRAMEBG).pack()
    tk.Entry(win, textvariable=under_var).pack()
    tk.Label(win, text="Opening Balance", bg=FRAMEBG).pack()
    tk.Entry(win, textvariable=openingbalance_var).pack()
    tk.Label(win, text="Area", bg=FRAMEBG).pack()
    tk.Entry(win, textvariable=area_var).pack()
    tk.Label(win, text="Credit", bg=FRAMEBG).pack()
    tk.Entry(win, textvariable=credit_var).pack()
    tk.Label(win, text="Debit", bg=FRAMEBG).pack()
    tk.Entry(win, textvariable=debit_var).pack()
    def load_selected(event=None):
        cursor.execute("SELECT printname, under, openingbalance, area, credit, debit FROM ledgermaster WHERE name=?", (selected_name.get(),))
        row = cursor.fetchone()
        if row:
            printname_var.set(row[0])
            under_var.set(row[1])
            openingbalance_var.set(row[2])
            area_var.set(row[3])
            credit_var.set(row[4])
            debit_var.set(row[5])
    name_combo.bind("<<ComboboxSelected>>", load_selected)
    def update_ledger():
        cursor.execute("UPDATE ledgermaster SET printname=?, under=?, openingbalance=?, area=?, credit=?, debit=? WHERE name=?",
                       (printname_var.get(), under_var.get(), openingbalance_var.get(), area_var.get(), credit_var.get(), debit_var.get(), selected_name.get()))
        conn.commit()
        messagebox.showinfo("Updated", "Ledger updated!")
    def delete_ledger():
        if messagebox.askyesno("Confirm Delete", f"Delete {selected_name.get()}?"):
            cursor.execute("DELETE FROM ledgermaster WHERE name=?", (selected_name.get(),))
            conn.commit()
            printname_var.set(""); under_var.set(""); openingbalance_var.set(""); area_var.set(""); credit_var.set(""); debit_var.set("")
            selected_name.set("")
            name_combo['values'] = [r[0] for r in cursor.execute("SELECT name FROM ledgermaster")]
    tk.Button(win, text="Update", command=update_ledger, bg="#4CAF50", fg="white").pack(pady=8)
    tk.Button(win, text="Delete", command=delete_ledger, bg="#FF5733", fg="white").pack(pady=4)
    tk.Button(win, text="Close", command=win.destroy, bg="red", fg="white").pack(pady=8)

ledgermenu = tk.Menu(master_menu, tearoff=0)
ledgermenu.add_command(label="Create", command=open_ledger_create)
ledgermenu.add_command(label="Display", command=open_ledger_display)
ledgermenu.add_command(label="Edit/Update/Delete", command=open_ledger_edit)
master_menu.add_cascade(label="Ledger", menu=ledgermenu)

# Other master items
for m in [""]:
    submenu = tk.Menu(master_menu, tearoff=0)
    for s in ["Create","Display","Edit","Print"]:
        submenu.add_command(label=s, command=lambda:messagebox.showinfo("Info","Under Development"))
    master_menu.add_cascade(label=m, menu=submenu)

menubar.add_cascade(label="Master", menu=master_menu)
print("Master menu created with sub-menus")

# REPORT MENU
report_menu = tk.Menu(menubar, tearoff=0)
report_menu.add_command(label="Stock Status", command=lambda:messagebox.showinfo("Info","Under Development"))
report_menu.add_command(label="Lot History", command=lambda:messagebox.showinfo("Info","Under Development"))
for report in ["Purchase Register","Purchase Return Register","Sales Register","Sales Return Register"]:
    submenu = tk.Menu(report_menu, tearoff=0)
    for r in ["Date Wise","Month Wise","Item Wise","Item Group Wise","Party Wise","Order Wise"]:
        submenu.add_command(label=r, command=lambda:messagebox.showinfo("Info","Under Development"))
    report_menu.add_cascade(label=report, menu=submenu)
report_menu.add_command(label="Papad Ledger (Payment)", command=lambda:messagebox.showinfo("Info","Under Development"))
menubar.add_cascade(label="Report", menu=report_menu)

# ACCOUNTS MENU
accounts_menu = tk.Menu(menubar, tearoff=0)
for acc in ["Day Book","Trial Balance","Balance Sheet","Profit & Loss","Ledger","Outstanding Summary","Outstanding Details"]:
    accounts_menu.add_command(label=acc, command=lambda:messagebox.showinfo("Info","Under Development"))
menubar.add_cascade(label="Accounts", menu=accounts_menu)

# FEATURES MENU
features_menu = tk.Menu(menubar, tearoff=0)
user_submenu = tk.Menu(features_menu, tearoff=0)
for act in ["Create","Display","Edit","Activities"]:
    user_submenu.add_command(label=act, command=lambda:messagebox.showinfo("Info","Under Development"))
features_menu.add_cascade(label="User", menu=user_submenu)
fy_submenu = tk.Menu(features_menu, tearoff=0)
for fy in ["Year Split","Change Year"]:
    fy_submenu.add_command(label=fy, command=lambda:messagebox.showinfo("Info","Under Development"))
features_menu.add_cascade(label="Financial Year", menu=fy_submenu)
menubar.add_cascade(label="Features", menu=features_menu)

# COMPANY MENU
company_menu = tk.Menu(menubar, tearoff=0)
for comp in ["Select","Create","Alter","Backup","Attach DB"]:
    company_menu.add_command(label=comp, command=lambda:messagebox.showinfo("Info","Under Development"))
menubar.add_cascade(label="Company", menu=company_menu)

# QUIT MENU
quit_menu = tk.Menu(menubar, tearoff=0)
quit_menu.add_command(label="Exit", command=lambda:root.destroy())
menubar.add_cascade(label="Quit", menu=quit_menu)

root.config(menu=menubar)

# Footer
tk.Label(root, text="Developed by: BVC Infotech", bg=HEADER_BG, fg=HEADER_FG, font=("Arial", 12), pady=5).pack(side="bottom", fill=tk.X)

# ---------- Run ----------
root.mainloop()