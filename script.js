let students = [];
let printBtn = null;
let imageExportBtn = null;

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
  imageExportBtn = document.getElementById("imageExportBtn");
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
      s["Sl"]?.toLowerCase().includes(query) ||
      s["Student Name"]?.toLowerCase().includes(query) ||
      s["Class Roll"]?.toLowerCase().includes(query) ||
      s["BTEB Roll"]?.toLowerCase().includes(query)
    );

    const topThree = matched.slice(0, 3);

    topThree.forEach(student => {
      const li = document.createElement("li");
      const name = student["Student Name"] || "";
      const roll = student["Class Roll"] || "";
      const regex = new RegExp(`(${query})`, 'gi'); // matching অংশ খোঁজার জন্য
      
      const highlightedName = name.replace(regex, "<b>$1</b>");
      const highlightedRoll = roll.replace(regex, "<b>$1</b>");
      
      li.innerHTML = `${highlightedName} (${highlightedRoll})`;
      li.addEventListener("click", () => {
        input.value = student["Student Name"];
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

// সার্চ ফাংশন
function searchStudent() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultBox = document.getElementById("result");
  const searchBtn = document.getElementById("searchBtn");

  resultBox.innerHTML = "";
  if (printBtn) printBtn.style.display = "none";
  if (imageExportBtn) imageExportBtn.style.display = "none";
  

  if (!query) {
    resultBox.innerHTML = '<p style="color:red;">অনুগ্রহ করে যেকোনো একটি তথ্য লিখুন।</p>';
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
      if (imageExportBtn) imageExportBtn.style.display = "inline-block";
      resultBox.scrollIntoView({ behavior: "smooth" });
    } else {
      resultBox.innerHTML = '<p style="color:orange;">❗ডাটাবেজে কোনো তথ্য পাওয়া যায়নি।</p>';
      if (printBtn) printBtn.style.display = "none";
    }

    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = "সার্চ করুন";
    }
  }, 300);
}

// ডাইনলোড
function exportResultAsImage() {
  const resultElement = document.getElementById("result");

  if (!resultElement.innerHTML.trim()) {
    alert("❗ কোনো তথ্য নেই ইমেজে রপ্তানি করার জন্য।");
    return;
  }

  // Student name খুঁজে বের করো
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = resultElement.innerHTML;

  let studentName = "Student";
  const infoRows = tempDiv.querySelectorAll(".info-row");
  infoRows.forEach(row => {
    const key = row.querySelector(".info-key")?.textContent?.trim();
    if (key === "Student Name") {
      studentName = row.querySelector(".info-value")?.textContent?.trim() || "Student";
    }
  });

  html2canvas(resultElement).then(canvas => {
    const link = document.createElement("a");
    link.download = `${studentName.replace(/\s+/g, "_")}_info.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// প্রিন্ট ফাংশন
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
          margin: 30px 20px 10px 0;
          text-align: right;
          font-size: 15px;
        }
        .signature-img {
          width: 160px;      /* তোমার PNG অনুযায়ী ঠিক স্কেল */
          height: auto;
          display: block;
          margin-bottom: 5px;
          margin-left: auto;
          margin-right: 0;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          margin-top: 10px;
          margin-left: auto;
        }
        footer {
          margin-top: 50px;
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
        <img src="signature.png" alt="Signature" class="signature-img" />
        <div class="signature-line"></div>
        <div>Authorized Signature</div>
      </div>
      <footer>
        This report was generated automatically.<br/>
        Developer: <strong>Oahid Towsif Shamol</strong> — &copy; 2021-2025
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