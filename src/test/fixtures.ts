import { type Product } from '../types/product';

export const firstProduct: Product = {
    id: 1,
    title: 'Canvas backpack',
    price: 29.95,
    category: 'Accessories',
    description: 'A lightweight everyday backpack.',
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
};
export const secondProduct: Product = {
    id: 2,
    title: 'Cotton shirt',
    price: 19.99,
    category: 'Clothing',
    description: 'A comfortable cotton shirt.',
    image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png',
};
export const products = [firstProduct, secondProduct];
