let students = [];

// Google Sheet থেকে CSV লোড করার URL
const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPdzBd6Kiq0HXrBt5q6SSDdHtfppYQq-1C-AQh7iZFWYHOlC5MIFnXV7JgDV_BJH6kiHkSxK4F4_xJ/pub?output=csv";

// ডেটা লোড করার পর students[] তে রাখা
fetch(csvUrl)
  .then(response => response.text())
  .then(data => {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      let student = {};
      headers.forEach((header, index) => {
        student[header] = row[index];
      });
      students.push(student);
    }
    console.log("ডেটা লোড হয়েছে:", students.length);
  })
  .catch(error => {
    console.error('CSV Load Error:', error);
    document.getElementById('result').innerHTML =
      '<p style="color:red;">CSV ডেটা লোড করা যায়নি।</p>';
  });

// সার্চ ফাংশন
function searchStudent() {
  const queryRaw = document.getElementById('searchInput').value;
  const query = queryRaw.trim().toLowerCase();
  const resultBox = document.getElementById('result');
  const printBtn = document.getElementById('printBtn');

  resultBox.innerHTML = '';
  if (printBtn) printBtn.style.display = "none";

  if (!query) {
    resultBox.innerHTML = '<p style="color:red;">অনুগ্রহ করে একটি তথ্য লিখুন।</p>';
    return;
  }

  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = 'লোড হচ্ছে...';
  }

  setTimeout(() => {
    const matchedStudents = students.filter(s => {
      return (
        (s['Sl'] && s['Sl'].toLowerCase() === query) ||
        (s['Class Roll'] && s['Class Roll'].toLowerCase() === query) ||
        (s['BTEB Roll'] && s['BTEB Roll'].toLowerCase() === query) ||
        (s['Student Name'] && s['Student Name'].toLowerCase().includes(query))
      );
    });

    if (matchedStudents.length > 0) {
      let output = '';
      matchedStudents.forEach(student => {
        output += `<div class="student-card">`;
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

      resultBox.scrollIntoView({ behavior: 'smooth' });
    } else {
      resultBox.innerHTML = '<p style="color:orange;">❗ তথ্য পাওয়া যায়নি।</p>';
      if (printBtn) printBtn.style.display = "none";
    }

    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = 'সার্চ করুন';
    }
  }, 300);
}

// Enter চাপলে সার্চ হবে
document.getElementById('searchInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    searchStudent();
  }
});

// শুরুতেই প্রিন্ট বাটন লুকানো
window.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('printBtn');
  const resultBox = document.getElementById('result');
  if (printBtn) printBtn.style.display = "none";
  if (resultBox) resultBox.innerHTML = '';
});

// প্রিন্ট ফাংশন
function printResult() {
  const content = document.getElementById('result').innerHTML;
  const win = window.open('', '', 'width=900,height=800');

  win.document.write(`
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>প্রিন্ট ভিউ</title>
      <style>
        body {
          font-family: 'SolaimanLipi', sans-serif;
          margin: 50px;
          color: #111;
        }

        h2 {
          text-align: center;
          color: #1b5e20;
          font-size: 28px;
          margin-bottom: 30px;
        }

        .student-card {
          border: 2px solid #4caf50;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 40px;
          background-color: #f4fff9;
          page-break-inside: avoid;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #ccc;
          font-size: 16px;
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

        .timestamp {
          text-align: right;
          margin-top: -20px;
          font-size: 13px;
          color: #555;
        }

        .signature-box {
          margin-top: 80px;
          text-align: right;
          font-size: 16px;
        }

        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          margin-top: 40px;
          margin-left: auto;
        }

        footer {
          margin-top: 100px;
          text-align: center;
          font-size: 13px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <h2>ডিপিআই স্টুডেন্ট তথ্য রিপোর্ট</h2>
      <div class="timestamp">প্রিন্ট সময়: ${new Date().toLocaleString('bn-BD')}</div>
      ${content}
      <div class="signature-box">
        <div class="signature-line"></div>
        <div>স্বাক্ষর</div>
      </div>
      <footer>
        এই রিপোর্ট তৈরি করেছেন: <strong>Oahid Towsif Shamol</strong><br/>
        @ots249 &copy; 2025
      </footer>
    </body>
    </html>
  `);

  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    // win.close(); // চাইলে প্রিন্টের পর উইন্ডো বন্ধ করে দিতে পারো
  }, 400);
}