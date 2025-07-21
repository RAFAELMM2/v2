// Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAAPVM-uc_yHKcY7an0pQABzS2UgRsbNY8",
  authDomain: "hjjj-f7cf5.firebaseapp.com",
  databaseURL: "https://hjjj-f7cf5-default-rtdb.firebaseio.com",
  projectId: "hjjj-f7cf5",
  storageBucket: "hjjj-f7cf5.appspot.com",
  messagingSenderId: "162911169867",
  appId: "1:162911169867:web:4a8e8d2db6fd886c390cce",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Dados locais
let myNumber = localStorage.getItem("number") || Math.floor(Math.random() * 1000000000).toString();
let myName = localStorage.getItem("name") || "Sem Nome";
let myPic = localStorage.getItem("pic") || "https://i.imgur.com/u8vS87x.png";
localStorage.setItem("number", myNumber);
document.getElementById("profileName").innerText = myName;
document.getElementById("profilePic").src = myPic;

let selectedContact = null;

function editProfile() {
  const newName = prompt("Novo nome:", myName);
  if (newName) {
    myName = newName;
    localStorage.setItem("name", newName);
    document.getElementById("profileName").innerText = newName;
  }
  document.getElementById("uploadPic").click();
}

document.getElementById("uploadPic").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    myPic = reader.result;
    localStorage.setItem("pic", myPic);
    document.getElementById("profilePic").src = myPic;
  };
  reader.readAsDataURL(file);
});

function addContact() {
  const number = document.getElementById("newContact").value;
  if (!number) return alert("Número inválido");
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  if (!contacts.includes(number)) {
    contacts.push(number);
    localStorage.setItem("contacts", JSON.stringify(contacts));
    loadContacts();
  }
  document.getElementById("newContact").value = "";
}

function loadContacts() {
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  const div = document.getElementById("contactsList");
  div.innerHTML = "";
  if (contacts.length === 0) {
    div.innerHTML = "<p>Nenhum contato ainda...</p>";
    return;
  }
  contacts.forEach(num => {
    const c = document.createElement("div");
    c.innerText = `+${num}`;
    c.onclick = () => openChat(num);
    div.appendChild(c);
  });
}

function openChat(contactNumber) {
  selectedContact = contactNumber;
  document.getElementById("chatHeader").innerText = `+${contactNumber}`;
  const msgRef = ref(db, `messages/${myNumber}-${contactNumber}`);
  onValue(msgRef, (snapshot) => {
    const msgs = snapshot.val();
    const chatBox = document.getElementById("chatMessages");
    chatBox.innerHTML = "";
    if (msgs) {
      Object.values(msgs).forEach(msg => {
        const m = document.createElement("div");
        m.innerText = msg.text;
        chatBox.appendChild(m);
      });
    }
  });
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text || !selectedContact) return;
  const chatPath = `messages/${myNumber}-${selectedContact}`;
  const msgRef = ref(db, chatPath);
  push(msgRef, { from: myNumber, text });
  input.value = "";
}

loadContacts();
