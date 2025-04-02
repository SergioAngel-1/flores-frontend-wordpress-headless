import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image, 
  PDFViewer,
  PDFDownloadLink,
  Font
} from '@react-pdf/renderer';
import { CatalogProduct } from '../../types/catalog';
import { formatCurrency, getValidImageUrl } from '../../utils/formatters';

// Registrar fuentes personalizadas
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
  ]
});

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
    fontFamily: 'Open Sans'
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    paddingBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    width: 120,
    height: 50
  },
  headerText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10
  },
  gridItem: {
    width: '31%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: '1%'
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 5,
    padding: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
    borderRadius: 3
  },
  listProductImage: {
    width: 80,
    height: 80,
    borderRadius: 3
  },
  productInfo: {
    flex: 1,
    marginLeft: 15
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  productPrice: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4
  },
  productOriginalPrice: {
    fontSize: 10,
    color: '#999',
    textDecoration: 'line-through',
    marginBottom: 4
  },
  productDescription: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    lineHeight: 1.4
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666'
  },
  footer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingTop: 10,
    fontSize: 10,
    color: '#666'
  },
  watermark: {
    position: 'absolute',
    bottom: 35,
    right: 30,
    fontSize: 9,
    color: '#c1c1c1'
  }
});

interface CatalogPDFProps {
  catalogName: string;
  products: CatalogProduct[];
  viewType: 'grid' | 'list';
  logoUrl: string;
}

// Componente del encabezado del PDF
const PDFHeader: React.FC<{ logoUrl: string; catalogName: string }> = ({ logoUrl, catalogName }) => {
  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Asegurarse de que la URL del logo sea válida
  const validLogoUrl = getValidImageUrl(logoUrl) || 'https://placehold.co/600x400?text=Logo+No+Disponible';

  return (
    <View style={styles.header}>
      <Image 
        style={styles.logo} 
        src={validLogoUrl} 
      />
      <View>
        <Text style={styles.headerText}>Catálogo: {catalogName}</Text>
        <Text style={styles.headerText}>Fecha: {currentDate}</Text>
      </View>
    </View>
  );
};

// Función auxiliar para obtener URL de imagen válida
const getProductImageUrl = (product: CatalogProduct): string => {
  let imageUrl = null;
  
  // Intentar obtener la imagen del catálogo primero
  if (product.catalog_image) {
    imageUrl = getValidImageUrl(product.catalog_image);
    if (imageUrl) return imageUrl;
  }
  
  // Luego intentar obtener de images array
  if (product.images && product.images.length > 0) {
    imageUrl = getValidImageUrl(product.images[0].src);
    if (imageUrl) return imageUrl;
  }
  
  // Finalmente, intentar catalog_images
  if (product.catalog_images && product.catalog_images.length > 0) {
    imageUrl = getValidImageUrl(product.catalog_images[0]);
    if (imageUrl) return imageUrl;
  }
  
  // Si no hay imagen, usar un placeholder
  return 'https://placehold.co/600x400?text=Imagen+No+Disponible';
};

// Componente Grid para mostrar productos en cuadrícula
const ProductGridView: React.FC<{ products: CatalogProduct[] }> = ({ products }) => (
  <View style={styles.gridContainer}>
    {products.map((product) => (
      <View style={styles.gridItem} key={`grid-${product.id}`}>
        <Image 
          style={styles.productImage} 
          src={getProductImageUrl(product)} 
        />
        <Text style={styles.productName}>{product.catalog_name || product.name}</Text>
        <Text style={styles.productPrice}>
          Precio: {formatCurrency(product.catalog_price || product.price)}
        </Text>
        {product.product_price && product.catalog_price && product.product_price !== product.catalog_price && (
          <Text style={styles.productOriginalPrice}>
            Precio original: {formatCurrency(product.product_price)}
          </Text>
        )}
        {product.catalog_short_description && (
          <Text style={styles.productDescription}>{product.catalog_short_description}</Text>
        )}
      </View>
    ))}
  </View>
);

// Componente List para mostrar productos en lista
const ProductListView: React.FC<{ products: CatalogProduct[] }> = ({ products }) => (
  <View>
    {products.map((product) => (
      <View style={styles.listItem} key={`list-${product.id}`}>
        <Image 
          style={styles.listProductImage} 
          src={getProductImageUrl(product)} 
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.catalog_name || product.name}</Text>
          <Text style={styles.productPrice}>
            Precio: {formatCurrency(product.catalog_price || product.price)}
          </Text>
          {product.product_price && product.catalog_price && product.product_price !== product.catalog_price && (
            <Text style={styles.productOriginalPrice}>
              Precio original: {formatCurrency(product.product_price)}
            </Text>
          )}
          {product.catalog_short_description && (
            <Text style={styles.productDescription}>{product.catalog_short_description}</Text>
          )}
          {product.catalog_description && (
            <Text style={styles.productDescription}>{product.catalog_description}</Text>
          )}
        </View>
      </View>
    ))}
  </View>
);

// Componente principal del PDF
const CatalogPDFDocument: React.FC<CatalogPDFProps> = ({ catalogName, products, viewType, logoUrl }) => (
  <Document title={`Catálogo - ${catalogName}`}>
    <Page size="A4" style={styles.page}>
      <PDFHeader logoUrl={logoUrl} catalogName={catalogName} />
      <Text style={styles.title}>Catálogo de Productos - {catalogName}</Text>
      
      {viewType === 'grid' ? (
        <ProductGridView products={products} />
      ) : (
        <ProductListView products={products} />
      )}
      
      <View style={styles.footer}>
        <Text>www.floresinc.com</Text>
        <Text>Tel: (555) 123-4567</Text>
      </View>
      
      <Text style={styles.watermark}>
        Generado por Flores Inc. - {new Date().toLocaleDateString()}
      </Text>
      
      <Text 
        style={styles.pageNumber} 
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
      />
    </Page>
  </Document>
);

// Componente para visualizar el PDF
export const CatalogPDFViewer: React.FC<CatalogPDFProps> = (props) => (
  <PDFViewer style={{ width: '100%', height: '70vh' }}>
    <CatalogPDFDocument {...props} />
  </PDFViewer>
);

// Componente para descargar el PDF
export const CatalogPDFDownloadLink: React.FC<CatalogPDFProps & { fileName?: string }> = ({ 
  fileName, 
  ...props 
}) => (
  <PDFDownloadLink 
    document={<CatalogPDFDocument {...props} />} 
    fileName={fileName || `catalogo-${props.catalogName.toLowerCase().replace(/\s+/g, '-')}.pdf`}
    className="px-4 py-2 bg-primario hover:bg-primario-dark text-white font-medium rounded-lg transition duration-300 ease-in-out flex items-center"
  >
    {({ loading }) => 
      loading ? 'Generando PDF...' : 'Descargar PDF'
    }
  </PDFDownloadLink>
);

export default CatalogPDFDocument;
