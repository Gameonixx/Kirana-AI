const API = "https://kirana-ai-backend.onrender.com";

const itemsContainer = document.getElementById("itemsContainer");
const msg = document.getElementById("messageBox");

function addItemRow() {
  const div = document.createElement("div");
  div.innerHTML = `
    <input placeholder="Item">
    <input type="number" placeholder="Qty">
    <input type="number" placeholder="Price">
    <button onclick="this.parentElement.remove()">✕</button>
  `;
  itemsContainer.appendChild(div);
}

document.getElementById("addItemBtn").onclick = addItemRow;

document.getElementById("clearTodayBtn").onclick = () => {
  itemsContainer.innerHTML = "";
  addItemRow();
};

document.getElementById("saveSalesBtn").onclick = async () => {
  const store = storeName.value;
  const date = saleDate.value;

  const items = [...itemsContainer.children].map(row => ({
    item_name: row.children[0].value,
    quantity: +row.children[1].value,
    price: +row.children[2].value
  })).filter(i => i.item_name);

  const res = await fetch(`${API}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ store_name: store, date, items })
  });

  msg.textContent = res.ok ? "Saved!" : "Error saving";
};

addItemRow();
