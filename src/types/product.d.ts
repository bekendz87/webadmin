export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    images?: string[];
    stock: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    sku?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    slug: string;
  }
  
  export interface ProductFilters {
    category?: string;
    status?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  }