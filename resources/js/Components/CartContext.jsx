import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);

    // price === null marks a "custom order" item — no price yet, the admin
    // quotes it manually after the order comes in.
    const addItem = useCallback((name, icon, price, category, productId = null, specs = [], image = null, isCustom = false) => {
        const imagePreview = image ? URL.createObjectURL(image) : null;
        setItems(prev => {
            const existing = prev.find(i => i.name === name);
            if (existing) {
                return prev.map(i => i.name === name
                    ? { ...i, qty: i.qty + 1, image: image ?? i.image, imagePreview: imagePreview ?? i.imagePreview }
                    : i);
            }
            return [...prev, { name, icon, price, category, productId, specs, image, imagePreview, isCustom, qty: 1 }];
        });
    }, []);

    const removeItem = useCallback((name) => {
        setItems(prev => prev.filter(i => i.name !== name));
    }, []);

    const clear = useCallback(() => setItems([]), []);

    const pricedItems = items.filter(i => i.price != null);
    const customItems = items.filter(i => i.price == null);
    const total = pricedItems.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);

    return (
        <CartContext.Provider value={{ items, pricedItems, customItems, addItem, removeItem, clear, total, count, open, setOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
