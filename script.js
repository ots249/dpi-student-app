let students = [];
let printBtn = null;

// CSV লোড
const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPdzBd6Kiq0HXrBt5q6SSDdHtfppYQq-1C-AQh7iZFWYHOlC5MIFnXV7JgDV_BJH6kiHkSxK4F4_xJ/pub?output=csv";

fetch(csvUrl)
  .then(res => res.text())
  .then(data => {
    const lines = data.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map(c => c.trim());
      let student = {};
      headers.forEach((header, index) => {
        student[header] = row[index];
      });
      students.push(student);
    }
    console.log("✅ ডেটা লোড হয়েছে:", students.length);
    setupSuggestionListener(); // ✅ Suggestion listener চালু করো
  })
  .catch(err => {
    console.error("❌ CSV Load Error:", err);
    const resultBox = document.getElementById("result");
    resultBox.innerHTML = '<p style="color:red;">CSV ডেটা লোড করা যায়নি।</p>';
  });

// DOM loaded
window.addEventListener("DOMContentLoaded", () => {
  printBtn = document.getElementById("printBtn");
  const resultBox = document.getElementById("result");

  if (printBtn) printBtn.style.display = "none";
  if (resultBox) resultBox.innerHTML = "";

  document.getElementById("searchInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      searchStudent();
    }
  });
});

// Suggestion ফাংশন
function setupSuggestionListener() {
  const input = document.getElementById("searchInput");
  const suggestionBox = document.getElementById("suggestions");

  input.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    suggestionBox.innerHTML = "";

    if (!query || students.length === 0) {
      suggestionBox.style.display = "none";
      return;
    }

    const matched = students.filter(s =>
      s["Student Name"]?.toLowerCase().includes(query) ||
      s["Class Roll"]?.toLowerCase().includes(query) ||
      s["BTEB Roll"]?.toLowerCase().includes(query)
    );

    const topFive = matched.slice(0, 5);

    topFive.forEach(student => {
      const li = document.createElement("li");
      li.textContent = `${student["Student Name"]} (${student["Class Roll"]})`;
      li.addEventListener("click", () => {
        input.value = student["Class Roll"];
        suggestionBox.innerHTML = "";
        suggestionBox.style.display = "none";
        searchStudent();
      });
      suggestionBox.appendChild(li);
    });

    suggestionBox.style.display = "block";
  });

  document.addEventListener("click", function (e) {
    if (!input.contains(e.target) && !suggestionBox.contains(e.target)) {
      suggestionBox.style.display = "none";
    }
  });
}

// সার্চ
function searchStudent() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultBox = document.getElementById("result");
  const searchBtn = document.getElementById("searchBtn");

  resultBox.innerHTML = "";
  if (printBtn) printBtn.style.display = "none";

  if (!query) {
    resultBox.innerHTML = '<p style="color:red;">অনুগ্রহ করে একটি তথ্য লিখুন।</p>';
    return;
  }

  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = "লোড হচ্ছে...";
  }

  setTimeout(() => {
    const matched = students.filter(s =>
      (s["Sl"] && s["Sl"].toLowerCase() === query) ||
      (s["Class Roll"] && s["Class Roll"].toLowerCase() === query) ||
      (s["BTEB Roll"] && s["BTEB Roll"].toLowerCase() === query) ||
      (s["Student Name"] && s["Student Name"].toLowerCase().includes(query))
    );

    if (matched.length > 0) {
      let output = "";
      matched.forEach((student, index) => {
        const isLast = index === matched.length - 1;
        const pageBreakClass = isLast ? "" : " page-break";
        output += `<div class="student-card${pageBreakClass}">`;
        for (const key in student) {
          output += `
            <div class="info-row">
              <div class="info-key">${key}</div>
              <div class="info-value">${student[key]}</div>
            </div>
          `;
        }
        output += `</div><hr>`;
      });

      resultBox.innerHTML = output;
      if (printBtn) printBtn.style.display = "inline-block";
      resultBox.scrollIntoView({ behavior: "smooth" });
    } else {
      resultBox.innerHTML = '<p style="color:orange;">❗ তথ্য পাওয়া যায়নি।</p>';
      if (printBtn) printBtn.style.display = "none";
    }

    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = "সার্চ করুন";
    }
  }, 300);
}

// প্রিন্ট
function printResult() {
  const content = document.getElementById("result").innerHTML;
  const win = window.open("", "", "width=900,height=800");

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  let studentName = "Student";
  const allInfoRows = tempDiv.querySelectorAll(".info-row");
  allInfoRows.forEach(row => {
    const key = row.querySelector(".info-key")?.textContent?.trim();
    if (key === "Student Name") {
      studentName = row.querySelector(".info-value")?.textContent?.trim() || "Student";
    }
  });

  const printDate = new Date().toLocaleString("en-BD");

  win.document.write(`
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Student Information of ${studentName}</title>
      <style>
        @page {
          size: A4;
          margin: 25mm 20mm 30mm 20mm;
        }
        body {
          font-family: 'SolaimanLipi', sans-serif;
          background: white;
          color: #111;
          margin: 0;
          padding: 0;
        }
        .title {
          text-align: center;
          font-size: 22px;
          margin-top: 30px;
          color: #1b5e20;
        }
        .timestamp {
          text-align: center;
          font-size: 13px;
          color: #555;
          margin: 10px 0 20px 0;
        }
        .student-card {
          border: 2px solid #4caf50;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 40px;
          background-color: #f4fff9;
        }
        .page-break {
          page-break-after: always;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #ccc;
          font-size: 15px;
        }
        .info-key {
          font-weight: bold;
          width: 40%;
          text-align: left;
          color: #00695c;
        }
        .info-value {
          width: 60%;
          text-align: center;
          color: #333;
        }
        .signature-box {
          margin: 80px 40px 0 0;
          text-align: right;
          font-size: 15px;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          margin-top: 40px;
          margin-left: auto;
        }
        footer {
          margin-top: 80px;
          text-align: center;
          font-size: 13px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="title">Information of <b>${studentName}</b></div>
      <div class="timestamp">Print Date: ${printDate}</div>
      ${content}
      <div class="signature-box">
        <div class="signature-line"></div>
        <div>Authorized Signature</div>
      </div>
      <footer>
        This report was generated automatically.<br/>
        Developer: <strong>Oahid Towsif Shamol</strong> — &copy; 2025
      </footer>
    </body>
    </html>
  `);

  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}