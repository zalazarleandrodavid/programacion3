export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    categoria: string;
}

export interface CartItem extends Product {
    cantidad: number;
}