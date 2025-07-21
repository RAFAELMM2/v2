import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, push, onChildAdded, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAAPVM-uc_yHKcY7an0pQABzS2UgRsbNY8",
  authDomain: "hjjj-f7cf5.firebaseapp.com",
  databaseURL: "https://hjjj-f7cf5-default-rtdb.firebaseio.com",
  projectId: "hjjj-f7cf5",
  storageBucket: "hjjj-f7cf5.appspot.com",
  messagingSenderId: "162911169867",
  appId: "1:162911169867:web:4a8e8d2db6fd886c390cce"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = {};
let currentChat = null;

const editBtn = document.getElementById("editProfileBtn");
const saveBtn = document.getElementById("saveProfileBtn");
const profileSection = document.getElementById("profileSection");
const chatSection = document.getElementById("chatSection");
const chatBox = document.getElementById("chatBox");
const chatWith = document.getElementById("chatWith");

editBtn.onclick = () => {
  profileSection.classList.toggle("hidden");
};

saveBtn.onclick = () => {
  const name = document.getElementById("myName").value.trim();
  const number = document.getElementById("myNumber").value.trim();
  const photo = document.getElementById("myPhoto").value.trim();

  if (name && number) {
    currentUser = { name, number, photo, contacts: [] };
    const userRef = ref(db, "users/" + number);
    set(userRef, currentUser).then(() => {
      alert("Perfil salvo!");
      profileSection.classList.add("hidden");
      loadContacts();
    });
  }
};

function loadContacts() {
  const list = document.getElementById("contactList");
  list.innerHTML = "";
  if (!currentUser.number) return;

  get(ref(db, `users/${currentUser.number}/contacts`)).then(snapshot => {
    const contacts = snapshot.val() || {};
    Object.entries(contacts).forEach(([num, name]) => {
      const div = document.createElement("div");
      div.textContent = `${name} (${num})`;
      div.onclick = () => openChat(num, name);
      list.appendChild(div);
    });
  });
}

document.getElementById("addContactBtn").onclick = () => {
  const contactNum = document.getElementById("newContactNumber").value.trim();
  if (!contactNum || !currentUser.number || contactNum === currentUser.number) return;

  get(ref(db, "users/" + contactNum)).then(snapshot => {
    if (snapshot.exists()) {
      const contactName = snapshot.val().name;
      const userContactsRef = ref(db, `users/${currentUser.number}/contacts/${contactNum}`);
      set(userContactsRef, contactName).then(() => {
        alert("Contato adicionado!");
        loadContacts();
      });
    } else {
      alert("Número não encontrado!");
    }
  });
};

function openChat(contactNumber, contactName) {
  currentChat = contactNumber;
  chatSection.classList.remove("hidden");
  chatWith.textContent = `Conversando com ${contactName}`;
  chatBox.innerHTML = "";

  const chatRef = ref(db, `messages/${getChatId(currentUser.number, contactNumber)}`);
  onChildAdded(chatRef, (snapshot) => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(msg.sender === currentUser.number ? "my-message" : "their-message");
    div.textContent = msg.text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

function getChatId(a, b) {
  return [a, b].sort().join("-");
}

document.getElementById("sendMessageBtn").onclick = () => {
  const text = document.getElementById("messageInput").value.trim();
  if (!text || !currentChat) return;

  const chatId = getChatId(currentUser.number, currentChat);
  const msgRef = push(ref(db, `messages/${chatId}`));
  set(msgRef, {
    sender: currentUser.number,
    text: text,
    timestamp: Date.now()
  }).then(() => {
    document.getElementById("messageInput").value = "";
  });
};
