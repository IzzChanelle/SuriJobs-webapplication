// ============================================
// chat.js — real-time conversation (polling)
// ============================================

Auth.require();

let currentUserId = null;
let pollInterval = null;
const urlParams = new URLSearchParams(window.location.search);
const preselectedUserId = urlParams.get("user");
const preselectedName = urlParams.get("name");

// DOM elements
const conversationsDiv = document.getElementById("conversationsSidebar");
const chatHeader = document.getElementById("chatHeader");
const chatMessages = document.getElementById("chatMessages");
const chatInputArea = document.getElementById("chatInputArea");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Load list of conversations
async function loadConversations() {
    try {
        const convos = await api("/messages/conversations");
        renderConversations(convos);
        // If we have a preselected user from URL, open that chat
        if (preselectedUserId && !currentUserId) {
            openChat(preselectedUserId, preselectedName || "Gebruiker");
        }
    } catch (err) {
        conversationsDiv.innerHTML = `<div class="empty-state">⚠️ ${err.message}</div>`;
    }
}

function renderConversations(convos) {
    conversationsDiv.innerHTML = "";
    if (convos.length === 0) {
        conversationsDiv.innerHTML = `<div class="empty-state">Geen gesprekken</div>`;
        return;
    }

    convos.forEach(conv => {
        const div = document.createElement("div");
        div.className = `conversation-item ${currentUserId == conv.id ? 'active' : ''}`;
        div.innerHTML = `
            <img class="conversation-avatar" src="${conv.photo || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}">
            <div class="conversation-info">
                <div class="conversation-name">${conv.name}</div>
                <div class="conversation-last">${conv.last_message || ''}</div>
            </div>
            <div class="conversation-time">${conv.last_message_time ? timeAgo(conv.last_message_time) : ''}</div>
            ${conv.unread_count > 0 ? `<div class="unread-badge">${conv.unread_count}</div>` : ''}
        `;
        div.addEventListener("click", () => openChat(conv.id, conv.name));
        conversationsDiv.appendChild(div);
    });
}

async function openChat(userId, userName) {
    if (currentUserId === userId) return;
    currentUserId = userId;
    chatHeader.textContent = `Chat met ${userName}`;
    chatInputArea.style.display = "flex";
    // Mark messages as read via API (backend already does when fetching)
    await loadMessages(userId);
    highlightActiveConversation();
    startPolling(userId);
}

async function loadMessages(userId) {
    chatMessages.innerHTML = `<div class="loading">Berichten laden...</div>`;
    try {
        const messages = await api(`/messages/${userId}`);
        renderMessages(messages);
    } catch (err) {
        chatMessages.innerHTML = `<div class="empty-state">⚠️ ${err.message}</div>`;
    }
}

function renderMessages(messages) {
    chatMessages.innerHTML = "";
    if (messages.length === 0) {
        chatMessages.innerHTML = `<div class="empty-chat">Nog geen berichten. Stuur er een!</div>`;
        return;
    }
    messages.forEach(msg => {
        const isSent = msg.from_user_id === Auth.user.id;
        const div = document.createElement("div");
        div.className = `message ${isSent ? 'message-sent' : 'message-received'}`;
        div.innerHTML = `
            <div>${escapeHtml(msg.message)}</div>
            <div class="message-time">${new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
        `;
        chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentUserId) return;
    messageInput.disabled = true;
    sendBtn.disabled = true;
    try {
        await api(`/messages/${currentUserId}`, { method: "POST", body: { message: text } });
        messageInput.value = "";
        await loadMessages(currentUserId);
        // Also reload conversations to update last message
        loadConversations();
    } catch (err) {
        toast(err.message, "error");
    } finally {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

function startPolling(userId) {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
        if (currentUserId === userId) {
            await loadMessages(userId);
            loadConversations(); // update sidebar unread counts
        }
    }, 3000);
}

function highlightActiveConversation() {
    document.querySelectorAll('.conversation-item').forEach(el => {
        const id = el.querySelector('.conversation-name')?.innerText;
        // better: store data-id
        if (el.dataset.id == currentUserId) el.classList.add('active');
        else el.classList.remove('active');
    });
    // Actually store data-id after render
    setTimeout(() => {
        document.querySelectorAll('.conversation-item').forEach(el => {
            const nameDiv = el.querySelector('.conversation-name');
            if (nameDiv && nameDiv.innerText === chatHeader.textContent.replace('Chat met ', '')) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }, 50);
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function timeAgo(date) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return "Nu";
    if (diff < 3600) return Math.floor(diff / 60) + " min";
    if (diff < 86400) return Math.floor(diff / 3600) + " uur";
    return Math.floor(diff / 86400) + " d";
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

loadConversations();

// Cleanup polling on page unload
window.addEventListener("beforeunload", () => {
    if (pollInterval) clearInterval(pollInterval);
});