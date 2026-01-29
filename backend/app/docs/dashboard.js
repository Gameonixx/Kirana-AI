const API = "http://127.0.0.1:8000";

let trendChart = null;

/* ================== INIT ================== */
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const dailyDate = document.getElementById("dailyDate");
  if (dailyDate) dailyDate.value = today;

  loadTopCards();
  loadRevenueTrend();
  loadStoreSummary();
  loadAIInsights();
});

/* ================== HELPERS ================== */
function showLoading(el, text = "Loading...") {
  if (el) el.innerHTML = `<p style="color:#6b7280">${text}</p>`;
}

/* ================== TOP CARDS ================== */
async function loadTopCards() {
  const res = await fetch(`${API}/sales/store-summary`);
  const data = await res.json();

  let totalSales = 0;
  let totalItems = 0;
  let totalRevenue = 0;

  data.forEach(s => {
    totalSales += s.total_sales;
    totalItems += s.total_items;
    totalRevenue += s.total_revenue;
  });

  document.getElementById("totalSales").textContent = totalSales;
  document.getElementById("totalItems").textContent = totalItems;
  document.getElementById("totalRevenue").textContent = `₹${totalRevenue}`;
}

/* ================== DAILY SUMMARY ================== */
async function loadDailySummary() {
  const date = document.getElementById("dailyDate").value;
  const resultBox = document.getElementById("dailyResult");

  showLoading(resultBox, "Fetching daily summary...");

  const res = await fetch(`${API}/sales/summary?date=${date}`);
  const d = await res.json();

  resultBox.textContent =
    `Sales: ${d.total_sales}, Items: ${d.total_items}, Revenue: ₹${d.total_revenue}`;
}

/* ================== MONTHLY SUMMARY ================== */
async function loadMonthlySummary() {
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;
  const monthlyBox = document.getElementById("monthlyResult");

  if (!year || !month) {
    alert("Please select year and month");
    return;
  }

  showLoading(monthlyBox, "Fetching monthly summary...");

  const res = await fetch(
    `${API}/sales/monthly-summary?year=${year}&month=${month}`
  );
  const d = await res.json();

  monthlyBox.textContent =
    `Sales: ${d.total_sales}, Items: ${d.total_items}, Revenue: ₹${d.total_revenue}`;

  loadTopCards();
  loadRevenueTrend();
  loadStoreSummary();
  loadAIInsights();
}

/* ================== REVENUE TREND ================== */
async function loadRevenueTrend() {
  const res = await fetch(`${API}/sales/trends?days=7`);
  const data = await res.json();

  const ctx = document.getElementById("trendChart").getContext("2d");

  if (!data || data.length < 2) {
    if (trendChart) trendChart.destroy();
    trendChart = null;
    return;
  }

  const labels = data.map(d => d.date);
  const values = data.map(d => d.revenue);

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/* ================== STORE SUMMARY ================== */
async function loadStoreSummary() {
  const res = await fetch(`${API}/sales/store-summary`);
  const data = await res.json();

  let html = "";
  let top = null;

  data.forEach(s => {
    html += `<p>${s.store_name} — ₹${s.total_revenue}</p>`;
    if (!top || s.total_revenue > top.total_revenue) top = s;
  });

  document.getElementById("storeList").innerHTML = html;
  document.getElementById("topStore").textContent =
    top ? `🏆 Top Performing Store: ${top.store_name}` : "";
}

/* ================== AI INSIGHTS ================== */
async function loadAIInsights() {
  const container = document.getElementById("aiInsights");
  showLoading(container, "🤖 Thinking...");

  const res = await fetch(`${API}/sales/insights`);
  const d = await res.json();

  if (!d || !d.best_day) {
    container.innerHTML = "<p>📭 Not enough data yet. Add more sales.</p>";
    return;
  }

  container.innerHTML = `
    🤖 <strong>Best Day:</strong> ${d.best_day}<br>
    📦 <strong>Top Item:</strong> ${d.top_item}<br>
    💰 <strong>Avg Daily Revenue:</strong> ₹${d.average_daily_revenue}
  `;
}
