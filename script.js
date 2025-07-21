let user = {
  name: "Seu Nome",
  number: "#0000",
  photo: "https://i.imgur.com/9bK0ZtY.png",
  contacts: [],
};

let currentChat = null;
let messages = {};

function editProfile() {
  const newName = prompt("Digite seu nome:");
  const newNumber = prompt("Digite seu número:");
  const newPhoto = prompt("URL da nova foto de perfil:");

  if (newName) user.name = newName;
  if (newNumber) user.number = "#" + newNumber;
  if (newPhoto) user.photo = newPhoto;

  document.getElementById("user-name").innerText = user.name;
  document.getElementById("user-number").innerText = user.number;
  document.getElementById("profile-pic").src = user.photo;
}

function addContact() {
  const input = document.getElementById("contact-number");
  const number = input.value.trim();

  if (number === "" || user.contacts.includes(number)) {
    alert("Número inválido ou já adicionado.");
    return;
  }

  // Simula que só existe os contatos #1234 e #5678 no sistema
  const validContacts = ["1234", "5678"];
  if (!validContacts.includes(number)) {
    alert("Contato não encontrado.");
    return;
  }

  user.contacts.push(number);
  input.value = "";
  renderContacts();
}

function renderContacts() {
  const ul = document.getElementById("contacts-list");
  ul.innerHTML = "";
  user.contacts.forEach(number => {
    const li = document.createElement("li");
    li.innerText = "#" + number;
    li.onclick = () => openChat(number);
    ul.appendChild(li);
  });
}

function openChat(number) {
  currentChat = number;
  document.getElementById("chat-contact-name").innerText = "#" + number;
  renderMessages();
}

function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text || !currentChat) return;

  if (!messages[currentChat]) messages[currentChat] = [];
  messages[currentChat].push({ from: user.number, text });

  input.value = "";
  renderMessages();
}

function renderMessages() {
  const div = document.getElementById("chat-messages");
  div.innerHTML = "";

  const chat = messages[currentChat] || [];
  chat.forEach(msg => {
    const p = document.createElement("p");
    p.innerText = `${msg.from}: ${msg.text}`;
    div.appendChild(p);
  });

  div.scrollTop = div.scrollHeight;
}
