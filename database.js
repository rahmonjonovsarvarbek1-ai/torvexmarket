// Konfiguratsiya faylidan 'db' va 'auth'ni import qilamiz
import { db, auth } from "./firebase-config.js"; 
import { 
    collection, 
    addDoc, 
    getDocs, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Ma'lumot qo'shish funksiyasi (masalan, mahsulotlar uchun)
export async function addProduct(name, price, description) {
    try {
        const docRef = await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            description: description,
            userId: auth.currentUser ? auth.currentUser.uid : "anonim",
            createdAt: serverTimestamp()
        });
        console.log("Mahsulot qo'shildi, ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Bazaga yozishda xatolik: ", error);
    }
}

// Ma'lumotlarni o'qish funksiyasi
export async function getProducts() {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = [];
    querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
    });
    return products;
}