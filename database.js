import { db } from "./firebase-config.js"; // Diqqat: firebase-config'da Firestore ishlatilgan bo'lishi kerak!
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Qidiruv mantiqi (Local array bilan ishlash)
const usersDatabase = [
    { id: 101, name: "Usta Jamshid", avatar: "avatar1.jpg", type: "direct" },
    { id: 102, name: "Qurilish Market", avatar: "avatar2.jpg", type: "group" }
];

// Funksiyani global qilish (HTML'dan chaqirish uchun)
window.searchMessages = function(query) {
    const chatList = document.getElementById('chatList');
    if (!chatList) return; // Agar chatList topilmasa, kod to'xtaydi

    const filtered = usersDatabase.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase())
    );

    chatList.innerHTML = filtered.map(user => `
        <div class="chat-item" onclick="openConversation(${user.id}, '${user.name}', '${user.avatar}')">
            <img src="${user.avatar}" class="user-mini-avatar">
            <div class="chat-item-info">
                <h4>${user.name}</h4>
                <p>${user.type === 'group' ? 'Guruh' : 'Lichka'}</p>
            </div>
        </div>
    `).join('');
};

// 2. Foydalanuvchini Firestore bazasiga saqlash mantiqi
export const saveUserToDB = async (user) => {
    if (!user) return;

    try {
        // MUHIM: firebase-config'da getFirestore ishlatilganiga ishonch hosil qil!
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            role: "client", 
            lastSeen: serverTimestamp()
        }, { merge: true });

        console.log("Ma'lumotlar Firestore'ga saqlandi!");
    } catch (error) {
        console.error("Firestore xatosi:", error);
    }
};