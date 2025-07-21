import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, push, onChildAdded, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// Variáveis globais
let myName = "";
let myNumber = "";
let contacts = [];
let currentChat = "";

// Elementos DOM
const editProfileBtn = document.getElementById("editProfile");
const profileSection = document.getElementById("profileSection");
const nameInput = document.getElementById("nameInput");
const numberInput = document.getElementById("numberInput");
const saveProfile = document.getElementById("saveProfile");
const contactList = document.getElementById("contactList");
const newContactNumber = document.getElementById("newContactNumber");
const addContact = document.getElementById("addContact");
const chat = document.getElementById("chat");
const chatWith = document.getElementById("chatWith");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendMessage = document.getElementById("sendMessage");

// Funções
editProfileBtn.onclick = () => {
  profileSection.classList.toggle("hidden");
};

saveProfile.onclick = () => {
  myName = nameInput.value;
  myNumber = numberInput.value;
  if (myName && myNumber) {
    localStorage.setItem("name", myName);
    localStorage.setItem("number", myNumber);
    profileSection.classList.add("hidden");
    loadContacts();
  }
};

addContact.onclick = () => {
  const contactNumber = newContactNumber.value;
  if (contactNumber && !contacts.includes(contactNumber)) {
    contacts.push(contactNumber);
    localStorage.setItem("contacts", JSON.stringify(contacts));
    renderContacts();
    newContactNumber.value = "";
  }
};

function renderContacts() {
  contactList.innerHTML = "";
  if (contacts.length === 0) {
    contactList.innerHTML = "<p>Você não tem contatos ainda.</p>";
    return;
  }

  contacts.forEach(number => {
    const btn = document.createElement("button");
    btn.textContent = number;
    btn.onclick = () => openChat(number);
    contactList.appendChild(btn);
  });
}

function openChat(number) {
  currentChat = number;
  chat.classList.remove("hidden");
  chatWith.textContent = "Conversando com " + number;
  chatMessages.innerHTML = "";

  const chatId = getChatId(myNumber, number);
  const msgRef = ref(db, "chats/" + chatId);

  onChildAdded(msgRef, (snapshot) => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(msg.from === myNumber ? "from-me" : "from-other");
    div.textContent = msg.text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function getChatId(a, b) {
  return [a, b].sort().join("_");
}

sendMessage.onclick = () => {
  const text = messageInput.value;
  if (text && currentChat) {
    const chatId = getChatId(myNumber, currentChat);
    const msgRef = ref(db, "chats/" + chatId);
    push(msgRef, { from: myNumber, text });
    messageInput.value = "";
  }
};

// Inicialização
window.onload = () => {
  myName = localStorage.getItem("name") || "";
  myNumber = localStorage.getItem("number") || "";
  contacts = JSON.parse(localStorage.getItem("contacts")) || [];

  if (myName && myNumber) {
    nameInput.value = myName;
    numberInput.value = myNumber;
    profileSection.classList.add("hidden");
    renderContacts();
  } else {
    profileSection.classList.remove("hidden");
  }
};
