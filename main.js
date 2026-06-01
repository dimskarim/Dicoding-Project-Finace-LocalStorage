// main.js
// script utama buat jalanin finance tracker pake vanilla js

// --- state global & config ---
const STORAGE_KEY = 'FINANCE_TRACKER_DATA';
const RENDER_EVENT = 'render-transaction';

let transactions = [];
// nyimpen id yg lagi diedit, kalo null berarti lagi nambah data baru
let editingId = null;


// --- helper/utils ---

// bikin custom modal berbasis promise buat gantiin alert/confirm bawaan browser
const showModal = (title, message, isConfirm = true) => {
  return new Promise((resolve) => {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const btnCancel = document.getElementById('modalBtnCancel');
    const btnConfirm = document.getElementById('modalBtnConfirm');

    modalTitle.innerText = title;
    modalMessage.innerText = message;
    
    // kalo cuma warning biasa, sembunyiin tombol batal
    if (!isConfirm) {
      btnCancel.style.display = 'none';
      btnConfirm.innerText = 'Tutup';
    } else {
      btnCancel.style.display = 'inline-block';
      btnConfirm.innerText = 'Ya';
    }

    modal.style.display = 'flex';

    const handleCancel = () => {
      modal.style.display = 'none';
      cleanup();
      resolve(false);
    };

    const handleConfirm = () => {
      modal.style.display = 'none';
      cleanup();
      resolve(true);
    };

    const cleanup = () => {
      btnCancel.removeEventListener('click', handleCancel);
      btnConfirm.removeEventListener('click', handleConfirm);
    };

    btnCancel.addEventListener('click', handleCancel);
    btnConfirm.addEventListener('click', handleConfirm);
  });
};

// bikin id unik pake timestamp
const generateId = () => +new Date();

// format angka biasa ke format rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// ngecek validasi input form (ga boleh kosong & minus)
const validateInput = async (title, amount, date) => {
  if (!title || title.trim() === '') {
    await showModal('Peringatan', 'Judul transaksi ngga boleh kosong!', false);
    return false;
  }
  if (!amount || isNaN(amount) || amount < 1) {
    await showModal('Peringatan', 'Nominal mesti angka dan minimal Rp 1!', false);
    return false;
  }
  if (!date) {
    await showModal('Peringatan', 'Tanggal wajib diisi!', false);
    return false;
  }
  return true;
};


// --- urusan localstorage ---

// cek browser support localstorage ngga
const isStorageExist = () => {
  if (typeof (Storage) === 'undefined') {
    showModal('Error', 'Browser kamu belum support local storage nih.', false);
    return false;
  }
  return true;
};

// save data ke localstorage
const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
};

// tarik data dari localstorage pas web pertama dibuka
const loadDataFromStorage = () => {
  if (isStorageExist()) {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      transactions = data;
    }
  }
  // trigger render awal
  document.dispatchEvent(new Event(RENDER_EVENT));
};


// --- logic crud (create, read, update, delete) ---

// simpan transaksi, bisa nambah baru atau ngupdate yg udah ada
const saveTransaction = async () => {
  const titleInput = document.getElementById('title').value;
  const amountInput = parseInt(document.getElementById('amount').value);
  const dateInput = document.getElementById('date').value;
  const typeInput = document.getElementById('type').value;

  // validasi dulu sebelum lanjut
  const isValid = await validateInput(titleInput, amountInput, dateInput);
  if (!isValid) return;

  if (editingId !== null) {
    // minta konfirmasi kalo lagi mode edit
    const isConfirm = await showModal('Konfirmasi Edit', `Yakin mau nyimpen perubahan buat "${titleInput}"?`, true);
    if (!isConfirm) return;

    // cari index datanya trus update property-nya aja
    const transactionIndex = transactions.findIndex(t => t.id === editingId);
    if (transactionIndex !== -1) {
      transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        title: titleInput,
        amount: amountInput,
        date: dateInput,
        type: typeInput
      };
    }
    
    // beresin mode edit
    cancelEdit();
  } else {
    // minta konfirmasi pas nambah data baru
    const isConfirm = await showModal('Konfirmasi Tambah', `Yakin mau nambahin transaksi "${titleInput}"?`, true);
    if (!isConfirm) return;

    // bikin object transaksi baru
    const newTransaction = {
      id: generateId(),
      title: titleInput,
      amount: amountInput,
      date: dateInput,
      type: typeInput
    };
    transactions.push(newTransaction);
  }

  // save ke storage trus update tampilan
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
  
  // kosongin form kalo abis nambah data
  if (editingId === null) {
    document.getElementById('transactionForm').reset();
  }
};

// hapus transaksi pake id
const deleteTransaction = (id) => {
  // filter data yg id-nya beda dari id yg mau dihapus
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

// switch tipe (pemasukan <-> pengeluaran) langsung dari list
const toggleTransactionType = (id) => {
  const transaction = transactions.find(t => t.id === id);
  if (transaction) {
    transaction.type = transaction.type === 'income' ? 'expense' : 'income';
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
};

// narik data ke dalem form buat diedit
const prepareEditTransaction = (id) => {
  const transaction = transactions.find(t => t.id === id);
  if (transaction) {
    editingId = transaction.id; // tandain id mana yg lagi diedit
    
    // lempar valuenya ke form
    document.getElementById('title').value = transaction.title;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('date').value = transaction.date;
    document.getElementById('type').value = transaction.type;
    
    // tampilin tombol batal edit
    document.getElementById('btnCancelEdit').style.display = 'inline-block';
    
    // arahin fokus ke input judul biar gampang
    document.getElementById('title').focus();
  }
};

// batalin edit trus kosongin form
const cancelEdit = () => {
  editingId = null;
  document.getElementById('transactionForm').reset();
  document.getElementById('btnCancelEdit').style.display = 'none';
};


// --- manipulasi dom ---

// bikin elemen html buat transaksi 
// (karena dilarang pake innerHTML, kita manual build node-nya satu-satu)
const createTransactionElement = (transaction) => {
  const container = document.createElement('div');
  container.classList.add('transaction-item');
  // ganti warna pinggiran card sesuai tipe (pemasukan/pengeluaran)
  container.classList.add(transaction.type === 'income' ? 'border-income' : 'border-expense');
  container.setAttribute('data-testid', 'transactionItem');

  const titleEl = document.createElement('h3');
  titleEl.setAttribute('data-testid', 'transactionItemTitle');
  titleEl.innerText = transaction.title;

  const amountEl = document.createElement('p');
  amountEl.setAttribute('data-testid', 'transactionItemAmount');
  amountEl.innerText = `Nominal: ${formatRupiah(transaction.amount)}`;
  amountEl.classList.add(transaction.type === 'income' ? 'text-income' : 'text-expense');

  const dateEl = document.createElement('p');
  dateEl.setAttribute('data-testid', 'transactionItemDate');
  dateEl.innerText = `Tanggal: ${transaction.date}`;

  const typeEl = document.createElement('p');
  typeEl.setAttribute('data-testid', 'transactionItemType');
  typeEl.innerText = `Tipe: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`;

  const btnContainer = document.createElement('div');
  btnContainer.classList.add('action-buttons');

  const btnToggle = document.createElement('button');
  btnToggle.setAttribute('data-testid', 'transactionItemEditTypeButton');
  btnToggle.classList.add('btn-toggle');
  btnToggle.innerText = 'Ubah Tipe';
  btnToggle.addEventListener('click', () => {
    toggleTransactionType(transaction.id);
  });

  const btnEdit = document.createElement('button');
  btnEdit.setAttribute('data-testid', 'transactionItemEditButton');
  btnEdit.classList.add('btn-edit');
  btnEdit.innerText = 'Edit';
  btnEdit.addEventListener('click', () => {
    prepareEditTransaction(transaction.id);
  });

  const btnDelete = document.createElement('button');
  btnDelete.setAttribute('data-testid', 'transactionItemDeleteButton');
  btnDelete.classList.add('btn-delete');
  btnDelete.innerText = 'Hapus';
  btnDelete.addEventListener('click', async () => {
    const isConfirm = await showModal('Konfirmasi Hapus', `Beneran mau ngehapus "${transaction.title}"?`, true);
    if (isConfirm) {
      deleteTransaction(transaction.id);
    }
  });

  // rangkai semua node-nya jadi satu
  btnContainer.appendChild(btnToggle);
  btnContainer.appendChild(btnEdit);
  btnContainer.appendChild(btnDelete);

  container.appendChild(titleEl);
  container.appendChild(amountEl);
  container.appendChild(dateEl);
  container.appendChild(typeEl);
  container.appendChild(btnContainer);

  return container;
};

// ngitung total saldo, income, expense buat dashboard
const updateDashboardSummary = () => {
  let totalIncome = 0;
  let totalExpense = 0;

  // hitung semuanya dari state awal
  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  }

  const totalBalance = totalIncome - totalExpense;

  // nampilin angkanya ke web
  document.getElementById('totalBalance').innerText = formatRupiah(totalBalance);
  document.getElementById('totalIncome').innerText = formatRupiah(totalIncome);
  document.getElementById('totalExpense').innerText = formatRupiah(totalExpense);
};

// render ulang list transaksi (bisa ngehandle fitur pencarian juga)
const renderTransactions = (keyword = '') => {
  const transactionList = document.getElementById('transactionList');
  
  // kosongin list lama pake cara aman (bukan innerHTML)
  while (transactionList.firstChild) {
    transactionList.removeChild(transactionList.firstChild);
  }

  // saring data kalo lagi ngetik di kolom search
  const filteredData = transactions.filter(t => 
    t.title.toLowerCase().includes(keyword.toLowerCase())
  );

  // kalo ga ada datanya, tampilin text kosong
  if (filteredData.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.innerText = 'Ngga ada transaksi yang ditemuin.';
    emptyState.style.color = 'var(--text-muted)';
    emptyState.style.textAlign = 'center';
    emptyState.style.marginTop = '20px';
    transactionList.appendChild(emptyState);
  } else {
    // tampilin data hasil filter satu-satu
    for (const transaction of filteredData) {
      const element = createTransactionElement(transaction);
      transactionList.appendChild(element);
    }
  }

  // abis render list, pastikan angka saldo juga ikutan update
  updateDashboardSummary();
};


// --- event listener & inisialisasi ---

// nunggu dom html kelar dimuat semua
document.addEventListener('DOMContentLoaded', () => {
  loadDataFromStorage();

  const form = document.getElementById('transactionForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // biar web ngga kereload pas submit
    saveTransaction();
  });

  const btnCancel = document.getElementById('btnCancelEdit');
  btnCancel.addEventListener('click', cancelEdit);

  // fitur search real-time pas user ngetik
  const searchInput = document.getElementById('searchKeyword');
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value;
    // panggil render manual, jgn panggil event RENDER_EVENT biar state ga kega-reset
    renderTransactions(keyword);
  });
});

// single source of truth buat nge-render ulang dom
document.addEventListener(RENDER_EVENT, () => {
  const searchInput = document.getElementById('searchKeyword');
  // pastiin hasil render tetep ngikutin kolom pencarian (kalo ga kosong)
  renderTransactions(searchInput.value);
});
