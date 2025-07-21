import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, onChildAdded, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Config Firebase (sua configuração)
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

// DOM Elements
const btnEditProfile = document.getElementById("btnEditProfile");
const profileSection = document.getElementById("profileSection");
const btnSaveProfile = document.getElementById("btnSaveProfile");
const inputName = document.getElementById("inputName");
const inputNumber = document.getElementById("inputNumber");
const inputPhoto = document.getElementById("inputPhoto");

const contactsSection = document.getElementById("contactsSection");
const contactsList = document.getElementById("contactsList");
const inputAddContact = document.getElementById("inputAddContact");
const btnAddContact = document.getElementById("btnAddContact");

const chatSection = document.getElementById("chatSection");
const chatWith = document.getElementById("chatWith");
const chatMessages = document.getElementById("chatMessages");
const inputMessage = document.getElementById("inputMessage");
const btnSendMessage = document.getElementById("btnSendMessage");

// Estado
let currentUser = null;
let currentChatNumber = null;

// Mostrar/esconder perfil para editar
btnEditProfile.onclick = () => {
  profileSection.classList.toggle("hidden");
};

// Salvar perfil
btnSaveProfile.onclick = async () => {
  const nome = inputName.value.trim();
  const numero = inputNumber.value.trim();
  const foto = inputPhoto.value.trim() || "https://i.imgur.com/9bK0ZtY.png";

  if (!nome || !numero) {
    alert("Preencha nome e número");
    return;
  }

  currentUser = { nome, numero, foto };
  await set(ref(db, "usuarios/" + numero), {
    nome,
    foto,
    contatos: {}
  });

  alert("Perfil salvo!");
  profileSection.classList.add("hidden");

  carregarContatos();
};

// Carregar contatos do usuário
async function carregarContatos() {
  if (!currentUser) return;
  contactsList.innerHTML = "";
  const contatosRef = ref(db, "usuarios/" + currentUser.numero + "/contatos");
  get(contatosRef).then((snapshot) => {
    const contatos = snapshot.val() || {};
    for (const contatoNum in contatos) {
      criarContatoElemento(contatoNum, contatos[contatoNum]);
    }
  });
}

// Criar elemento visual de contato
function criarContatoElemento(numero, nome) {
  const div = document.createElement("div");
  div.textContent = `${nome} (#${numero})`;
  div.onclick = () => abrirChat(numero, nome);
  contactsList.appendChild(div);
}

// Adicionar contato
btnAddContact.onclick = async () => {
  if (!currentUser) {
    alert("Salve seu perfil primeiro!");
    return;
  }
  const novoNum = inputAddContact.value.trim();
  if (!novoNum || novoNum === currentUser.numero) {
    alert("Número inválido");
    return;
  }

  const contatoRef = ref(db, "usuarios/" + novoNum);
  const contatoSnap = await get(contatoRef);
  if (!contatoSnap.exists()) {
    alert("Contato não encontrado");
    return;
  }

  const nomeContato = contatoSnap.val().nome;

  await set(ref(db, `usuarios/${currentUser.numero}/contatos/${novoNum}`), nomeContato);
  inputAddContact.value = "";
  carregarContatos();
  alert("Contato adicionado!");
};

// Abrir chat
function abrirChat(numero, nome) {
  currentChatNumber = numero;
  chatSection.classList.remove("hidden");
  chatWith.textContent = `Conversando com ${nome} (#${numero})`;
  chatMessages.innerHTML = "";

  const chatId = [currentUser.numero, currentChatNumber].sort().join("_");
  const messagesRef = ref(db, `mensagens/${chatId}`);

  // Limpa mensagens antigas antes de carregar
  chatMessages.innerHTML = "";

  onValue(messagesRef, (snapshot) => {
    chatMessages.innerHTML = "";
    const msgs = snapshot.val() || {};
    Object.values(msgs).forEach((msg) => {
      mostrarMensagem(msg);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Mostrar mensagem no chat
function mostrarMensagem(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(msg.de === currentUser.numero ? "me" : "their");
  div.textContent = msg.texto;
  chatMessages.appendChild(div);
}

// Enviar mensagem
btnSendMessage.onclick = async () => {
  if (!currentChatNumber) return;
  const texto = inputMessage.value.trim();
  if (!texto) return;

  const chatId = [currentUser.numero, currentChatNumber].sort().join("_");
  const messagesRef = ref(db, `mensagens/${chatId}`);

  // Adiciona mensagem nova com push
  const novaMensagemRef = push(messagesRef);
  await set(novaMensagemRef, {
    de: currentUser.numero,
    texto,
    timestamp: Date.now()
  });

  inputMessage.value = "";
};
