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
      totalDoses: 0,
      totalAddons: 0,
      totalAmount: 0,
      finalTotal: 0,
      orderId: 0,

      // Add to cart
      addToCart: (product) => {
        const state = get();
        const type = getCartType(product.type); // 'doses' or 'addons'
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === product.id);

        const newItems = [...currentItems];
        let updatedItem;
        let quantityIncrement = 1;
        let priceIncrement = product.price;

        if (existingItem) {
          if (existingItem.qty < product.allowed) {
            existingItem.qty++;
            existingItem.totalPrice += product.price;
          } else {
            return;
          }
        } else {
          updatedItem = {
            ...product,
            qty: 1,
            totalPrice: product.price,
            isSelected: true,
          };
          newItems.push(updatedItem);
        }

        set({
          items: {
            ...state.items,
            [type]: newItems,
          },
          totalDoses: type === "doses" ? state.totalDoses + quantityIncrement : state.totalDoses,
          totalAddons: type === "addons" ? state.totalAddons + quantityIncrement : state.totalAddons,
          totalAmount: state.totalAmount + priceIncrement,
        });
      },

      setFinalTotal: (finalTotal) => set({ finalTotal }),
      setOrderId: (orderId) => set({ orderId }),

      // Completely remove item regardless of qty
      removeItemCompletely: (id, typeRaw) => {
        const state = get();
        const type = typeRaw?.toLowerCase() === "addon" ? "addons" : "doses";
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === id);
        if (!existingItem) return;

        const updatedItems = currentItems.filter((item) => item.id !== id);
        const quantityToRemove = existingItem.qty;
        const amountToRemove = existingItem.totalPrice;

        set({
          items: {
            ...state.items,
            [type]: updatedItems,
          },
          totalDoses: type === "doses" ? state.totalDoses - quantityToRemove : state.totalDoses,
          totalAddons: type === "addons" ? state.totalAddons - quantityToRemove : state.totalAddons,
          totalAmount: state.totalAmount - amountToRemove,
        });
      },

      // Remove from cart
      removeFromCart: (id, typeRaw) => {
        const state = get();
        const type = typeRaw?.toLowerCase() === "addon" ? "addons" : "doses";
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === id);
        if (!existingItem) return;

        const updatedItems =
          existingItem.qty === 1
            ? currentItems.filter((item) => item.id !== id)
            : currentItems.map((item) => {
                if (item.id === id) {
                  item.qty--;
                  item.totalPrice -= item.price;
                }
                return item;
              });

        set({
          items: {
            ...state.items,
            [type]: updatedItems,
          },
          totalDoses: type === "doses" ? state.totalDoses - 1 : state.totalDoses,
          totalAddons: type === "addons" ? state.totalAddons - 1 : state.totalAddons,
          totalAmount: state.totalAmount - existingItem.price,
        });
      },

      // Increase quantity
      increaseQuantity: (id, typeRaw) => {
        const state = get();
        const type = typeRaw?.toLowerCase() === "addon" ? "addons" : "doses";
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === id);
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

        const existingItem = currentItems.find((item) => item.id === id);
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
              [type]: currentItems.filter((item) => item.id !== id),
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
          totalDoses: 0,
          totalAddons: 0,
          totalAmount: 0,
        });
      },

      clearFinalTotal: () => set({ finalTotal: null }),
    }),
    {
      name: "cart-storage",
    }
  )
);

export default useCartStore;
