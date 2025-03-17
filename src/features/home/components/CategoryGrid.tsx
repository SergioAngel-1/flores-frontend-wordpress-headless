import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface CategoryItem {
  name: string;
  image: string;
  link: string;
}

interface CategoryGridProps {
  categories: CategoryItem[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  // Animaciones con GSAP
  useEffect(() => {
    const categoryItems = document.querySelectorAll('.category-item');
    
    gsap.fromTo(
      categoryItems,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.category-grid',
          start: 'top 80%',
        }
      }
    );
    
    return () => {
      // Limpiar animaciones
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [categories]);

  if (categories.length === 0) return null;

  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-10">Categorías destacadas</h2>
      
      <div className="category-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {categories.map((category, index) => (
          <Link 
            key={index}
            to={category.link} 
            className="category-item block group overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105"
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <h3 className="absolute bottom-4 left-4 right-4 text-xl font-semibold text-white">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
