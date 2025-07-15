let students = [];

// Google Sheet থেকে CSV লোড করার URL
const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPdzBd6Kiq0HXrBt5q6SSDdHtfppYQq-1C-AQh7iZFWYHOlC5MIFnXV7JgDV_BJH6kiHkSxK4F4_xJ/pub?output=csv";

// CSV ডেটা ফেচ করে students[] তে রূপান্তর করা
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
  resultBox.innerHTML = '';

  if (!query) {
    resultBox.innerHTML = '<p style="color:red;">অনুগ্রহ করে একটি সংখ্যা লিখুন।</p>';
    return;
  }

  const searchBtn = document.getElementById('searchBtn');
  if(searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = 'লোড হচ্ছে...';
  }

  setTimeout(() => {
    const matchedStudents = students.filter(s => {
    return (
    (s['Sl'] && s['Sl'].toLowerCase() === query) ||
    (s['Class Roll'] && s['Class Roll'].toLowerCase() === query) ||
    (s['BTEB Roll'] && s['BTEB Roll'].toLowerCase() === query) ||
    (s['Student Name'] && s['Student Name'].toLowerCase().includes(query)) // 🔍 নাম দিয়ে খুঁজবে
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
      resultBox.scrollIntoView({ behavior: 'smooth' });

    } else {
      resultBox.innerHTML = '<p style="color:orange;">❗ তথ্য পাওয়া যায়নি।</p>';
    }

    if(searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = 'সার্চ করুন';
    }
  }, 300);
}

// Enter প্রেস করলে সার্চ চালু হবে
document.getElementById('searchInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    searchStudent();
  }
});

function printResult() {
  const printContent = document.getElementById('result').innerHTML;
  const win = window.open('', '', 'height=700,width=900');
  win.document.write(`
    <html>
      <head>
        <title>প্রিন্ট ভিউ</title>
        <style>
          body { font-family: 'SolaimanLipi', sans-serif; padding: 20px; }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
            padding: 8px;
          }
          .info-key {
            font-weight: bold;
            color: #1b5e20;
          }
          .info-value {
            color: #333;
          }
        </style>
      </head>
      <body>
        <h2>স্টুডেন্ট তথ্য</h2>
        ${printContent}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}