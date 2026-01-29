const API_BASE = "https://kirana-ai-backend.onrender.com";

const storeSelect = document.getElementById("storeSelect");
const loadBtn = document.getElementById("loadHistoryBtn");
const historyContainer = document.getElementById("salesHistory");

// ============================
// LOAD SALES HISTORY
// ============================
loadBtn.addEventListener("click", async () => {
  const storeName = storeSelect.value;
  historyContainer.innerHTML = "Loading...";

  try {
    const res = await fetch(
      `${API_BASE}/sales/history?store_name=${encodeURIComponent(storeName)}`
    );
    const data = await res.json();

    if (!data.length) {
      historyContainer.innerHTML = "<p>No sales found.</p>";
      return;
    }

    renderHistory(data);
  } catch (err) {
    historyContainer.innerHTML = "<p>Failed to load sales history.</p>";
  }
});

// ============================
// RENDER SALES
// ============================
function renderHistory(sales) {
  historyContainer.innerHTML = "";

  sales.forEach((sale) => {
    const card = document.createElement("div");
    card.className = "sale-card";

    card.innerHTML = `
      <div class="sale-info">
        <strong>Date:</strong> ${sale.date}<br/>
        <strong>Total Revenue:</strong> ₹${sale.total_revenue}
      </div>

      <div class="sale-actions">
        <button onclick="editSale(${sale.sale_id})">✏️ Edit</button>
        <button onclick="deleteSale(${sale.sale_id})">🗑️ Delete</button>
      </div>
    `;

    historyContainer.appendChild(card);
  });
}

// ============================
// EDIT SALE
// ============================
async function editSale(saleId) {
  try {
    const res = await fetch(`${API_BASE}/sales/${saleId}`);
    const sale = await res.json();

    if (sale.error) {
      alert("Sale not found");
      return;
    }

    // Simple edit via prompt (UX later can be modal)
    const newStore = prompt("Store Name:", sale.store_name);
    if (!newStore) return;

    const newDate = prompt("Date (YYYY-MM-DD):", sale.date);
    if (!newDate) return;

    const items = [];

    for (let item of sale.items) {
      const qty = prompt(
        `Quantity for ${item.item_name}:`,
        item.quantity
      );
      const price = prompt(
        `Price for ${item.item_name}:`,
        item.price
      );

      items.push({
        item_name: item.item_name,
        quantity: Number(qty),
        price: Number(price),
      });
    }

    const payload = {
      store_name: newStore,
      date: newDate,
      items: items,
    };

    await fetch(`${API_BASE}/sales/${saleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Sale updated successfully");
    loadBtn.click();
  } catch (err) {
    alert("Failed to update sale");
  }
}

// ============================
// DELETE SALE
// ============================
async function deleteSale(saleId) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this sale?"
  );
  if (!confirmDelete) return;

  try {
    await fetch(`${API_BASE}/sales/${saleId}`, {
      method: "DELETE",
    });

    alert("Sale deleted");
    loadBtn.click();
  } catch (err) {
    alert("Failed to delete sale");
  }
}
