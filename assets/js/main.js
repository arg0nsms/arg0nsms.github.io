const API_URL = "http://api.argonsms.com/api";
const PRICE_PER_SMS = 15;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

async function login() {
  let id = document.getElementById("id").value;
  let pw = document.getElementById("pw").value;
  if (!id) {
    return alert("아이디를 입력해주세요.");
  } else if (!pw) {
    return alert("비밀번호를 입력해주세요.");
  }
  document.getElementById("id").disabled = true;
  document.getElementById("pw").disabled = true;
  document.getElementById("login_button").disabled = true;
  try {
    let resp = await fetch(API_URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        pw: pw,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      setCookie("userId", id, 999);
      location.href = "./dashboard.html";
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
  document.getElementById("id").disabled = false;
  document.getElementById("pw").disabled = false;
  document.getElementById("login_button").disabled = false;
}

async function register() {
  let id = document.getElementById("id").value;
  let pw = document.getElementById("pw").value;
  let repw = document.getElementById("repw").value;
  let captcha = document.querySelector(".h-captcha > iframe").dataset
    .hcaptchaResponse;
  if (!id) {
    return alert("아이디를 입력해주세요.");
  } else if (!pw) {
    return alert("비밀번호를 입력해주세요.");
  } else if (!repw) {
    return alert("비밀번호 확인을 입력해주세요.");
  } else if (pw != repw) {
    return alert("비밀번호가 서로 다릅니다.");
  } else if (!captcha) {
    return alert("캡챠를 풀어주세요.");
  }
  document.getElementById("id").disabled = true;
  document.getElementById("pw").disabled = true;
  document.getElementById("repw").disabled = true;
  document.getElementById("register_button").disabled = true;
  try {
    let resp = await fetch(API_URL + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        pw: pw,
        repw: repw,
        captcha: captcha,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      alert("회원가입이 완료되었습니다.");
      location.href = "./login.html";
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
  document.getElementById("id").disabled = false;
  document.getElementById("pw").disabled = false;
  document.getElementById("repw").disabled = false;
  document.getElementById("register_button").disabled = false;
}

async function logout() {
  try {
    await fetch(API_URL + "/logout", {
      method: "GET",
      credentials: "include",
    });
  } finally {
    location.href = "./login.html";
  }
}

async function changePW() {
  let wrapper = document.createElement("div");
  wrapper.innerHTML =
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">기존 비밀번호:</span><input id="oldpw" type="password" class="form-control form-control-sm float-right col-sm-9 text-gray-900"/><br/>';
  wrapper.innerHTML +=
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">새 비밀번호:</span><input id="pw" type="password" class="form-control form-control-sm float-right col-sm-9 text-gray-900"/><br/>';
  wrapper.innerHTML +=
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">비밀번호 확인:</span><input id="repw" type="password" class="form-control form-control-sm float-right col-sm-9 text-gray-900"/><br/>';
  let isConfirm = await swal({
    html: true,
    title: "비밀번호 변경",
    content: wrapper,
    buttons: ["취소", "확인"],
    closeOnCancel: true,
  });
  if (!isConfirm) return;
  let oldpw = document.getElementById("oldpw").value;
  let pw = document.getElementById("pw").value;
  let repw = document.getElementById("repw").value;
  try {
    let resp = await fetch(API_URL + "/changepw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldpw: oldpw,
        pw: pw,
        repw: repw,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      swal({
        icon: "success",
        title: "성공",
        text: "성공적으로 변경되었습니다.",
      });
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function charge() {
  let wrapper = document.createElement("div");
  wrapper.innerHTML =
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">입금자명:</span><input id="charge_name" type="text" class="form-control form-control-sm float-right col-sm-9 text-gray-900" placeholder="홍길동"/><br/>';
  wrapper.innerHTML +=
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">금액:</span><input id="charge_amount" type="number" min="1000" class="form-control form-control-sm float-right col-sm-9 text-gray-900" placeholder="1000"/><br/>';
  let isConfirm = await swal({
    html: true,
    title: "계좌이체",
    content: wrapper,
    buttons: ["취소", "확인"],
    closeOnCancel: true,
  });
  if (!isConfirm) return;
  let name = document.getElementById("charge_name").value;
  let amount = document.getElementById("charge_amount").value;
  try {
    let resp = await fetch(API_URL + "/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        amount: amount,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      swal({
        icon: "success",
        title: "성공",
        text:
          "기존 충전신청은 모두 삭제됩니다.\n입금자명, 금액을 다시 한번 확인해주세요.\n입금자명: " +
          name +
          "\n금액: " +
          amount +
          "원\n\n입금할 계좌: " +
          json.account,
      });
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

function exportPhoneNumbers() {
  let el = document.getElementById("paste");
  let newNumbers = el.value.match(
    /(010\-\d\d\d\d\-\d\d\d\d|010\d\d\d\d\d\d\d\d)/g
  );
  el.value = "";
  el.readOnly = false;
  el = document.getElementById("numbers");
  let numbers = el.value.trim();
  for (let i = 0; i < newNumbers.length; i++) {
    numbers += "\n" + newNumbers[i].replace(/[^0-9]/g, "");
  }
  el.value = numbers.trim();
}

function exportNumbers(el) {
  el.value = el.value.replace(/[^0-9\n]/g, "");
}

function filterPhoneNumber() {
  let el = document.getElementById("numbers");
  let numbers = el.value
    .trim()
    .replace(/[^0-9\n]/g, "")
    .split("\n");
  numbers = [...new Set(numbers)];
  let result = [];
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i].length == 11 && numbers[i].startsWith("010")) {
      result.push(numbers[i]);
    }
  }
  el.value = result.join("\n");
}

async function dashboard() {
  try {
    let resp = await fetch(API_URL + "/dashboard", {
      method: "GET",
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      document.getElementById("total-sms-count").innerText =
        json.totalSMSCount + " 개";
      document.getElementById("total-user-count").innerText =
        json.totalUserCount + " 명";
      document.getElementById("api-count").innerText = json.apiCount + " 개";
      document.getElementById("uptime").innerText = json.uptime + " %";
      document.getElementById("cash").innerText =
        "+ " +
        parseInt(json.cash / PRICE_PER_SMS) +
        " 개 (" +
        json.cash +
        " 원)";
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function sendSMS() {
  let content = document.getElementById("content").value;
  let number = document.getElementById("numbers").value;
  try {
    let resp = await fetch(API_URL + "/sendsms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
        number: number,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      location.href = "./logging.html";
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function logging() {
  try {
    let resp = await fetch(API_URL + "/smslog", {
      method: "GET",
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      json = json.detail;
      let tbody = document.createElement("tbody");
      for (let i = 0; i < json.length; i++) {
        let tr = document.createElement("tr");
        let date = document.createElement("th");
        date.innerText = json[i].date;
        tr.appendChild(date);
        let number = document.createElement("th");
        number.innerText = json[i].number;
        tr.appendChild(number);
        let content = document.createElement("th");
        content.innerText = json[i].content;
        tr.appendChild(content);
        let status = document.createElement("th");
        status.innerText = json[i].status;
        tr.appendChild(status);
        tbody.appendChild(tr);
      }
      document.getElementById("smsSendLoggingBody").remove();
      tbody.id = "smsSendLoggingBody";
      document.getElementById("smsSendLogging").appendChild(tbody);
      let table = $("#smsSendLogging").DataTable();
      table.order([0, "desc"]).draw();
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function ping() {
  try {
    let resp = await fetch(API_URL + "/ping", {
      method: "GET",
      credentials: "include",
    });
    let json = await resp.json();
    if (!json.success) {
      location.href = "./login.html";
    }
  } catch (err) {}
}

window.onload = async () => {
  let pathname = new URL(location.href).pathname;
  if (pathname != "/login.html" && pathname != "/register.html") {
    ping();
    setInterval(ping, 60000);
  }
  let userIdEl = document.getElementById("userId");
  if (userIdEl) {
    userIdEl.innerText = getCookie("userId");
  }
  switch (pathname) {
    case "/login.html":
      break;
    case "/register.html":
      break;
    case "/dashboard.html":
      await dashboard();
      break;
    case "/logging.html":
      await logging();
      break;
    default:
      break;
  }
};
