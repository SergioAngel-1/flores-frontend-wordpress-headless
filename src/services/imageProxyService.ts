/**
 * Servicio para manejar la carga de imágenes evitando problemas de CORS
 */

/**
 * Convierte una URL de imagen a una data URL utilizando canvas
 * @param imageUrl URL de la imagen a convertir
 * @returns Promesa que resuelve a una data URL o null si falla
 */
export const convertImageToDataUrl = (imageUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    // Crear un elemento de imagen
    const img = new Image();
    
    // Configurar el manejo de eventos
    img.onload = () => {
      try {
        // Crear un canvas del tamaño de la imagen
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dibujar la imagen en el canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Convertir el canvas a data URL
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } else {
          console.error('No se pudo obtener el contexto 2D del canvas');
          resolve(null);
        }
      } catch (error) {
        console.error('Error al convertir la imagen a data URL:', error);
        resolve(null);
      }
    };
    
    // Manejar errores de carga
    img.onerror = () => {
      console.error('Error al cargar la imagen:', imageUrl);
      resolve(null);
    };
    
    // Configurar crossOrigin para permitir el acceso a imágenes de otros dominios
    img.crossOrigin = 'anonymous';
    
    // Iniciar la carga de la imagen
    img.src = imageUrl;
  });
};

/**
 * Carga una imagen a través de un iframe para evitar restricciones de CORS
 * @param imageUrl URL de la imagen a cargar
 * @returns Promesa que resuelve a true si la imagen existe, false si no
 */
export const checkImageExistence = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Establecer un timeout para detectar si la imagen no se carga
    const timeoutId = setTimeout(() => {
      document.body.removeChild(iframe);
      resolve(false);
    }, 5000); // 5 segundos de timeout
    
    // Configurar el evento de carga
    iframe.onload = () => {
      clearTimeout(timeoutId);
      
      try {
        // Intentar acceder al contenido del iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          // Si podemos acceder al documento, la imagen probablemente existe
          document.body.removeChild(iframe);
          resolve(true);
        } else {
          document.body.removeChild(iframe);
          resolve(false);
        }
      } catch (e) {
        // Error al acceder al contenido del iframe (probablemente por CORS)
        document.body.removeChild(iframe);
        resolve(false);
      }
    };
    
    // Configurar el evento de error
    iframe.onerror = () => {
      clearTimeout(timeoutId);
      document.body.removeChild(iframe);
      resolve(false);
    };
    
    // Navegar al iframe a la URL de la imagen
    iframe.src = imageUrl;
  });
};

/**
 * Convierte una URL de imagen a una URL de proxy para evitar problemas de CORS
 * @param imageUrl URL original de la imagen
 * @returns URL del proxy de imágenes
 */
export const getProxyImageUrl = (imageUrl: string): string => {
  // Usar la variable de entorno para el proxy CORS
  const proxyBaseUrl = import.meta.env.VITE_CORS_PROXY || '';
  
  // Si no hay una URL de proxy configurada, devolver la URL original
  if (!proxyBaseUrl) {
    console.warn('No se ha configurado una URL de proxy CORS en las variables de entorno');
    return imageUrl;
  }
  
  // Construir la URL del proxy
  const proxyUrl = `${proxyBaseUrl}?url=${encodeURIComponent(imageUrl)}`;
  
  return proxyUrl;
};

/**
 * Intenta cargar una imagen utilizando múltiples métodos para evitar problemas de CORS
 * @param imageUrl URL de la imagen a cargar
 * @returns Promesa que resuelve a una data URL o null si falla
 */
export const loadImageWithFallbacks = async (imageUrl: string): Promise<string | null> => {
  console.log('Intentando cargar imagen:', imageUrl);
  
  // Método 1: Intentar convertir directamente a data URL
  const dataUrl = await convertImageToDataUrl(imageUrl);
  if (dataUrl) {
    console.log('Imagen cargada con éxito usando canvas:', imageUrl);
    return dataUrl;
  }
  
  // Método 2: Intentar usar el proxy de WordPress
  console.log('Intentando cargar imagen a través del proxy:', imageUrl);
  const proxyUrl = getProxyImageUrl(imageUrl);
  
  try {
    const proxyDataUrl = await convertImageToDataUrl(proxyUrl);
    if (proxyDataUrl) {
      console.log('Imagen cargada con éxito usando proxy:', imageUrl);
      return proxyDataUrl;
    }
  } catch (error) {
    console.error('Error al cargar imagen a través del proxy:', error);
  }
  
  // Método 3: Verificar si la imagen existe
  const exists = await checkImageExistence(imageUrl);
  if (exists) {
    // Si la imagen existe pero no podemos convertirla a data URL,
    // devolver la URL del proxy y manejar el CORS en el componente
    console.log('Imagen existe pero no se puede convertir a data URL, usando proxy URL:', imageUrl);
    return proxyUrl;
  }
  
  // Si todos los métodos fallan, devolver null
  console.error('No se pudo cargar la imagen con ningún método:', imageUrl);
  return null;
};
