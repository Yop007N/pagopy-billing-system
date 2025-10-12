/**
 * Category Model for Mobile App
 * Used for organizing products (not in backend Prisma schema yet)
 * This is a mobile-specific feature for better UX
 */

/**
 * Product category interface
 * Note: This may be synced with backend in future versions
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Icon name or emoji
  color?: string; // Hex color code
  parentId?: string; // For hierarchical categories
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Mobile-specific fields
  userId?: string; // Owner of the category
  _synced?: boolean;
  _localId?: string;
}

/**
 * Category tree structure for hierarchical display
 */
export interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
  hasChildren: boolean;
  path?: string[]; // Array of parent IDs from root to this category
}

/**
 * Data Transfer Object for creating a category
 */
export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Data Transfer Object for updating a category
 */
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  id: string;
}

/**
 * Filter options for category queries
 */
export interface CategoryFilter {
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
  includeProductCount?: boolean;
  includeChildren?: boolean;
}

/**
 * DTO for moving a category in the hierarchy
 */
export interface MoveCategoryDto {
  categoryId: string;
  newParentId?: string;
  newSortOrder?: number;
}

/**
 * Category with statistics
 */
export interface CategoryWithStats extends Category {
  totalProducts: number;
  activeProducts: number;
  totalRevenue?: number;
  avgProductPrice?: number;
}

/**
 * Flat category list response
 */
export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

/**
 * Helper class for category operations
 */
export class CategoryHelper {
  /**
   * Build category tree from flat list
   */
  static buildTree(categories: Category[]): CategoryTree[] {
    const map = new Map<string, CategoryTree>();
    const roots: CategoryTree[] = [];

    // Initialize map
    categories.forEach(cat => {
      map.set(cat.id, {
        ...cat,
        children: [],
        level: 0,
        hasChildren: false
      });
    });

    // Build tree
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        const parent = map.get(cat.parentId)!;
        parent.children.push(node);
        parent.hasChildren = true;
        node.level = parent.level + 1;
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Flatten category tree
   */
  static flattenTree(tree: CategoryTree[]): Category[] {
    const result: Category[] = [];
    const traverse = (nodes: CategoryTree[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(tree);
    return result;
  }

  /**
   * Get category path (breadcrumb)
   */
  static getCategoryPath(categoryId: string, categories: Category[]): Category[] {
    const map = new Map(categories.map(c => [c.id, c]));
    const path: Category[] = [];
    let current = map.get(categoryId);

    while (current) {
      path.unshift(current);
      current = current.parentId ? map.get(current.parentId) : undefined;
    }

    return path;
  }
}
