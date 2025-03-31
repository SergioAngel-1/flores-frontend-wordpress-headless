import React, { useEffect, useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import { CatalogExtra, CatalogExtraProduct } from '../services/catalogExtraService';
import { styles } from '../styles/catalogPDF';
import { registerFonts } from '../styles/pdfFonts';
import { loadImageWithFallbacks, getProxyImageUrl } from '../services/imageProxyService';

// Registrar las fuentes
registerFonts();

// Interfaz para las props del componente
interface CatalogPDFProps {
  catalog: CatalogExtra;
  displayMode?: 'grid' | 'list';
}

// Componente principal del PDF
const CatalogPDF: React.FC<CatalogPDFProps> = ({ 
  catalog, 
  displayMode = 'grid'
}) => {
  // Estado para almacenar imágenes precargadas
  const [preloadedImages, setPreloadedImages] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  
  // Función para precargar todas las imágenes
  useEffect(() => {
    const preloadImages = async () => {
      if (!catalog) return;
      
      setIsLoading(true);
      setLoadingProgress(0);
      console.log('Iniciando precarga de imágenes...');
      
      const imageUrls: string[] = [];
      const imageMap: {[key: string]: string} = {};
      
      // Recopilar todas las URLs de imágenes
      if (catalog.logo) imageUrls.push(catalog.logo);
      
      catalog.products.forEach(product => {
        if (product.main_image) imageUrls.push(product.main_image);
        if (product.secondary_image_1) imageUrls.push(product.secondary_image_1);
        if (product.secondary_image_2) imageUrls.push(product.secondary_image_2);
      });
      
      console.log(`Total de imágenes a precargar: ${imageUrls.length}`);
      
      // Precargar cada imagen usando nuestro servicio
      let completedImages = 0;
      
      for (const url of imageUrls) {
        try {
          // Normalizar URL
          let absoluteUrl = url;
          if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:')) {
            // Si es una ruta relativa, convertirla a absoluta usando la URL base de WordPress
            const wpApiUrl = import.meta.env.VITE_WP_API_URL || window.location.origin;
            const baseUrl = wpApiUrl.endsWith('/') ? wpApiUrl.slice(0, -1) : wpApiUrl;
            const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
            absoluteUrl = `${baseUrl}/${cleanUrl}`;
          }
          
          console.log(`Precargando imagen: ${absoluteUrl}`);
          
          // Usar nuestro servicio para cargar la imagen con fallbacks
          const dataUrl = await loadImageWithFallbacks(absoluteUrl);
          
          if (dataUrl) {
            imageMap[url] = dataUrl;
            console.log(`Imagen precargada con éxito: ${url}`);
          } else {
            console.error(`No se pudo precargar la imagen: ${url}`);
            // Como fallback, guardar la URL del proxy para intentar cargarla directamente en el PDF
            imageMap[url] = getProxyImageUrl(absoluteUrl);
          }
        } catch (error) {
          console.error(`Error al precargar imagen ${url}:`, error);
        }
        
        // Actualizar progreso
        completedImages++;
        const progress = Math.round((completedImages / imageUrls.length) * 100);
        setLoadingProgress(progress);
      }
      
      setPreloadedImages(imageMap);
      setIsLoading(false);
      console.log('Precarga de imágenes completada:', Object.keys(imageMap).length);
    };
    
    preloadImages();
  }, [catalog]);

  if (!catalog) {
    return null;
  }

  // Función para calcular el descuento
  const calculateDiscount = (regularPrice: string, customPrice: string): number => {
    const regular = parseFloat(regularPrice);
    const custom = parseFloat(customPrice);
    
    if (isNaN(regular) || isNaN(custom) || regular <= 0 || custom >= regular) {
      return 0;
    }
    
    return Math.round(((regular - custom) / regular) * 100);
  };
  
  // Obtener la fecha actual formateada
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Función para renderizar una imagen con manejo de errores
  const renderImage = (imageUrl: string | null | undefined, style: any, fallbackText: string = "Sin imagen") => {
    if (!imageUrl || imageUrl.trim() === '') {
      console.log('URL de imagen vacía o nula');
      return (
        <View style={[style, styles.noImagePlaceholder]}>
          <Text style={styles.noImageText}>{fallbackText}</Text>
        </View>
      );
    }

    // Definir estilos locales para la imagen
    const localImageStyle = StyleSheet.create({
      image: {
        ...style,
        objectFit: 'contain',
      },
      placeholder: {
        ...style,
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      placeholderText: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
      }
    });

    try {
      // Usar la imagen precargada si está disponible
      if (preloadedImages[imageUrl]) {
        console.log('Usando imagen precargada:', imageUrl);
        return <Image src={preloadedImages[imageUrl]} style={localImageStyle.image} />;
      }
      
      // Si no está precargada, intentar usar la URL directamente
      console.log('Imagen no precargada, usando URL directa:', imageUrl);
      return <Image src={imageUrl} style={localImageStyle.image} />;
    } catch (error) {
      console.error('Error al renderizar imagen:', error);
      return (
        <View style={[style, localImageStyle.placeholder]}>
          <Text style={localImageStyle.placeholderText}>{fallbackText}</Text>
        </View>
      );
    }
  };

  // Función para renderizar miniaturas de imágenes secundarias
  const renderSecondaryImages = (product: CatalogExtraProduct, containerStyle: any, imageStyle: any) => {
    // Verificar si hay imágenes secundarias
    const hasSecondaryImage1 = product.secondary_image_1 && product.secondary_image_1.trim() !== '';
    const hasSecondaryImage2 = product.secondary_image_2 && product.secondary_image_2.trim() !== '';
    
    if (!hasSecondaryImage1 && !hasSecondaryImage2) {
      return null;
    }
    
    // Depuración
    console.log('Imágenes secundarias:', {
      secondary_image_1: product.secondary_image_1,
      secondary_image_2: product.secondary_image_2
    });
    
    return (
      <View style={containerStyle}>
        {hasSecondaryImage1 && renderImage(product.secondary_image_1, imageStyle, "")}
        {hasSecondaryImage2 && renderImage(product.secondary_image_2, imageStyle, "")}
      </View>
    );
  };

  // Crear una versión segura de la función de renderizado para la vista de cuadrícula
  const renderGridView = () => (
    <View>
      <Text style={styles.sectionTitle}>Nuestros Productos</Text>
      <View style={styles.productGrid}>
        {catalog.products.map((product) => {
          const discount = calculateDiscount(product.regular_price, product.custom_price);
          
          // Depuración
          console.log(`Renderizando producto en grid: ${product.name}`, {
            id: product.id,
            main_image: product.main_image,
            has_main_image: !!product.main_image
          });
          
          return (
            <View key={product.id} style={styles.productItemGrid}>
              <View style={styles.imageGalleryGrid}>
                {renderImage(product.main_image, styles.mainImageGrid)}
                {renderSecondaryImages(product, styles.secondaryImages, styles.secondaryImage)}
              </View>
              
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productSku}>SKU: {product.sku}</Text>
              
              {product.short_description && (
                <Text style={styles.productDescription}>{product.short_description}</Text>
              )}
              
              <View style={styles.priceContainer}>
                <View style={styles.priceInfo}>
                  {product.regular_price !== product.custom_price && (
                    <Text style={styles.regularPrice}>${product.regular_price}</Text>
                  )}
                  <Text style={styles.customPrice}>${product.custom_price}</Text>
                </View>
                
                {discount > 0 && (
                  <Text style={styles.discountBadge}>{discount}% OFF</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  // Crear una versión segura de la función de renderizado para la vista de lista
  const renderListView = () => (
    <View>
      <Text style={styles.sectionTitle}>Nuestros Productos</Text>
      <View style={styles.productList}>
        {catalog.products.map((product) => {
          const discount = calculateDiscount(product.regular_price, product.custom_price);
          return (
            <View key={product.id} style={styles.productItemList}>
              <View style={styles.productListImageContainer}>
                {renderImage(product.main_image, styles.mainImageList)}
                {renderSecondaryImages(product, styles.secondaryImagesList, styles.secondaryImageList)}
              </View>
              
              <View style={styles.productListContent}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSku}>SKU: {product.sku}</Text>
                
                {product.short_description && (
                  <Text style={styles.productDescription}>{product.short_description}</Text>
                )}
                
                <View style={styles.priceContainer}>
                  <View style={styles.priceInfo}>
                    {product.regular_price !== product.custom_price && (
                      <Text style={styles.regularPrice}>${product.regular_price}</Text>
                    )}
                    <Text style={styles.customPrice}>${product.custom_price}</Text>
                  </View>
                  
                  {discount > 0 && (
                    <Text style={styles.discountBadge}>{discount}% OFF</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  // Si todavía está cargando, mostrar un documento con mensaje de carga
  if (isLoading) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando imágenes...</Text>
            <Text style={styles.loadingSubtext}>Por favor espere mientras se prepara el PDF</Text>
            <Text style={styles.loadingProgress}>{loadingProgress}%</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          {catalog.logo ? (
            renderImage(catalog.logo, styles.logo)
          ) : (
            <Text style={styles.companyName}>{catalog.title || 'Catálogo de Productos'}</Text>
          )}
          
          <View style={styles.headerInfo}>
            <Text style={styles.catalogTitle}>{catalog.title || 'Catálogo de Productos'}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
        </View>
        
        {/* Contenido principal */}
        <View style={styles.content}>
          {displayMode === 'grid' ? renderGridView() : renderListView()}
        </View>
        
        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {new Date().getFullYear()} - Todos los derechos reservados
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default CatalogPDF;
