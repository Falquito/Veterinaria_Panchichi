// src/services/categoryService.ts

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000'; // ajustá si no usás prefix "api"

export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
  productos?: any[];
}

export interface CreateCategoryRequest {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoryRequest {
  nombre?: string;
  descripcion?: string;
}

class CategoryService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Crear una nueva categoría
  async create(categoryData: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      return await this.handleResponse<Category>(response);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Obtener todas las categorías
  async getAll(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias`);
      return await this.handleResponse<Category[]>(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Obtener una categoría por ID
  async getById(id: number): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias/${id}`);
      return await this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }

  // Actualizar una categoría
  async update(id: number, categoryData: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      return await this.handleResponse<Category>(response);
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }

  // Eliminar una categoría
  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
}

// Exportar una instancia única del servicio
export const categoryService = new CategoryService();
export default categoryService;