import React from 'react';
import BannerCarousel, { Banner } from './BannerCarousel';
import FeaturedCategories, { Category } from './FeaturedCategories';
import FloresCoinsBannerNew from './FloresCoinsBanner';

interface HeroSectionProps {
  banners: Banner[];
  bannersLoading: boolean;
  bannersError: string | null;
  featuredCategories: Category[];
  featuredCategoriesLoading: boolean;
  featuredCategoriesError: string | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  banners,
  bannersLoading,
  bannersError,
  featuredCategories,
  featuredCategoriesLoading,
  featuredCategoriesError
}) => {
  return (
    <section className="bg-gradient-to-b from-[var(--claro)] to-white py-4 w-full">
      <div className="w-full max-w-[1920px] mx-auto px-16 md:px-16 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hero Banner - Ocupa 2/3 en desktop */}
          <div className="lg:col-span-2">
            <BannerCarousel 
              banners={banners} 
              loading={bannersLoading} 
              error={bannersError} 
            />
          </div>

          {/* Categorías Destacadas - Ocupa 1/3 en desktop */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <FeaturedCategories 
                categories={featuredCategories} 
                loading={featuredCategoriesLoading} 
                error={featuredCategoriesError} 
              />
              <FloresCoinsBannerNew />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
