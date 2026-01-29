const itemsContainer = document.getElementById("itemsContainer");
const messageBox = document.getElementById("salesMessage");

// Add one item row
function addItem() {
  const div = document.createElement("div");
  div.className = "item-row";

  div.innerHTML = `
    <input type="text" placeholder="Item name" class="itemName" />
    <input type="number" placeholder="Qty" class="itemQty" />
    <input type="number" placeholder="Price" class="itemPrice" />
  `;

  itemsContainer.appendChild(div);
}

// Add one item by default
addItem();

async function submitSales() {
  const storeName = document.getElementById("storeName").value;
  const date = document.getElementById("saleDate").value;

  const itemNames = document.querySelectorAll(".itemName");
  const itemQtys = document.querySelectorAll(".itemQty");
  const itemPrices = document.querySelectorAll(".itemPrice");

  let sales = [];

  for (let i = 0; i < itemNames.length; i++) {
    if (!itemNames[i].value) continue;

    sales.push({
      item_name: itemNames[i].value,
      quantity: Number(itemQtys[i].value),
      price: Number(itemPrices[i].value),
    });
  }

  if (!storeName || !date || sales.length === 0) {
    messageBox.textContent = "Please fill all fields";
    return;
  }

  const payload = {
    store_name: storeName,
    date: date,
    sales: sales,
  };

  try {
    const res = await fetch("http://127.0.0.1:8000/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    messageBox.textContent = "Sales submitted successfully ✅";
    console.log(data);
  } catch (err) {
    messageBox.textContent = "Failed to submit sales ❌";
    console.error(err);
  }
}
