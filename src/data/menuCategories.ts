// Estructura de datos para las categorías del menú principal
export interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories?: SubCategory[];
}

// Datos de categorías y subcategorías para el menú principal
const menuCategories: Category[] = [
  {
    id: 1,
    name: 'FLORES',
    slug: 'flores',
    subcategories: [
      {
        id: 101,
        name: 'Flores Super Premium',
        slug: 'flores-super-premium'
      },
      {
        id: 102,
        name: 'Flores Alta Gama',
        slug: 'flores-alta-gama'
      },
      {
        id: 103,
        name: 'Flores Funcionales',
        slug: 'flores-funcionales'
      },
      {
        id: 104,
        name: 'Porros',
        slug: 'porros'
      }
    ]
  },
  {
    id: 2,
    name: 'HONGOS MÁGICOS',
    slug: 'hongos-magicos',
    subcategories: [
      {
        id: 201,
        name: 'Comestibles',
        slug: 'hongos-comestibles'
      },
      {
        id: 202,
        name: 'Extracciones',
        slug: 'hongos-extracciones'
      }
    ]
  },
  {
    id: 3,
    name: 'MEDICINALES',
    slug: 'medicinales',
    subcategories: [
      {
        id: 301,
        name: 'CBD',
        slug: 'cbd'
      },
      {
        id: 302,
        name: 'Aceites',
        slug: 'aceites'
      },
      {
        id: 303,
        name: 'Tinturas',
        slug: 'tinturas'
      }
    ]
  },
  {
    id: 4,
    name: 'MÁS',
    slug: 'mas',
    subcategories: [
      {
        id: 401,
        name: 'Accesorios',
        slug: 'accesorios'
      },
      {
        id: 402,
        name: 'Parafernalia',
        slug: 'parafernalia'
      },
      {
        id: 403,
        name: 'Merchandising',
        slug: 'merchandising'
      }
    ]
  }
];

export default menuCategories;
