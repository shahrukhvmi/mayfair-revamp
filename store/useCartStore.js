import { create } from "zustand";
import { persist } from "zustand/middleware";
import getCartType from "@/config/helperFunction";

const useCartStore = create(
    persist(
        (set, get) => ({
            items: {
                doses: [],
                addons: [],
            },
            totalQuantity: 0,
            totalAmount: 0,

            // Add to cart
            addToCart: (product) => {
                const state = get();
                const type = getCartType(product.type);
                const currentItems = state.items[type] || [];

                const existingItem = currentItems.find(item => item.id === product.id);

                if (existingItem) {
                    if (existingItem.qty < product.allowed) {
                        existingItem.qty++;
                        existingItem.totalPrice += product.price;

                        set({
                            items: {
                                ...state.items,
                                [type]: [...currentItems],
                            },
                            totalQuantity: state.totalQuantity + 1,
                            totalAmount: state.totalAmount + product.price,
                        });
                    }
                } else {
                    const newItem = {
                        ...product,
                        qty: 1,
                        totalPrice: product.price,
                        isSelected: true,
                    };

                    set({
                        items: {
                            ...state.items,
                            [type]: [...currentItems, newItem],
                        },
                        totalQuantity: state.totalQuantity + 1,
                        totalAmount: state.totalAmount + product.price,
                    });
                }
            },

            // Remove from cart
            removeFromCart: (id, typeRaw) => {
                const state = get();
                const type = typeRaw?.toLowerCase() === "addon" ? "addons" : "doses";
                const currentItems = state.items[type] || [];

                const existingItem = currentItems.find(item => item.id === id);
                if (!existingItem) return;

                if (existingItem.qty === 1) {
                    set({
                        items: {
                            ...state.items,
                            [type]: currentItems.filter(item => item.id !== id),
                        },
                        totalQuantity: state.totalQuantity - 1,
                        totalAmount: state.totalAmount - existingItem.price,
                    });
                } else {
                    existingItem.qty--;
                    existingItem.totalPrice -= existingItem.price;

                    set({
                        items: {
                            ...state.items,
                            [type]: [...currentItems],
                        },
                        totalQuantity: state.totalQuantity - 1,
                        totalAmount: state.totalAmount - existingItem.price,
                    });
                }
            },

            // Increase quantity
            increaseQuantity: (id, typeRaw) => {
                const state = get();
                const type = typeRaw?.toLowerCase() === "addon" ? "addons" : "doses";
                const currentItems = state.items[type] || [];

                const existingItem = currentItems.find(item => item.id === id);
                if (!existingItem) return;

                existingItem.qty++;
                existingItem.totalPrice += existingItem.price;

                set({
                    items: {
                        ...state.items,
                        [type]: [...currentItems],
                    },
                    totalQuantity: state.totalQuantity + 1,
                    totalAmount: state.totalAmount + existingItem.price,
                });
            },

            // Decrease quantity
            decreaseQuantity: (id, typeRaw) => {
                const state = get();
                const type = typeRaw?.toLowerCase() === "addon" ? "addons" : "doses";
                const currentItems = state.items[type] || [];

                const existingItem = currentItems.find(item => item.id === id);
                if (!existingItem) return;

                if (existingItem.qty > 1) {
                    existingItem.qty--;
                    existingItem.totalPrice -= existingItem.price;

                    set({
                        items: {
                            ...state.items,
                            [type]: [...currentItems],
                        },
                        totalQuantity: state.totalQuantity - 1,
                        totalAmount: state.totalAmount - existingItem.price,
                    });
                } else {
                    set({
                        items: {
                            ...state.items,
                            [type]: currentItems.filter(item => item.id !== id),
                        },
                        totalQuantity: state.totalQuantity - 1,
                        totalAmount: state.totalAmount - existingItem.price,
                    });
                }
            },

            // Clear cart
            clearCart: () => {
                set({
                    items: {
                        doses: [],
                        addons: [],
                    },
                    totalQuantity: 0,
                    totalAmount: 0,
                });
            },
        }),
        {
            name: "cart-storage",
        }
    )
);

export default useCartStore;
