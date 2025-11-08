// modulo de seguridad mejorado para UNA Chat

export default {

    // Lista blanca de dominios confiables para medios
    trustedDomains: [
      'youtube.com',
      'youtu.be',
      'imgur.com',
      'i.imgur.com',
      'wikimedia.org',
      'upload.wikimedia.org',
      'commons.wikimedia.org',
      'unsplash.com',
      'images.unsplash.com',
      'source.unsplash.com',
      'w3.org',
      'w3schools.com',
      'sample-videos.com',
      'pixabay.com',
      'images.pexels.com',
      'pexels.com',
      'vimeo.com',
      'cdn.pixabay.com',
      // Dominios seguros de Google
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com', 
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'drive.google.com',
      'docs.google.com',
      'sites.google.com',
      'blogger.googleusercontent.com',
      'storage.googleapis.com',
      // Dominios de Google Images
      'images.google.com',
      'www.google.com',
      'encrypted-tbn0.gstatic.com',
      'encrypted-tbn1.gstatic.com',
      'encrypted-tbn2.gstatic.com', 
      'encrypted-tbn3.gstatic.com',
      'gstatic.com'
    ],

    // Sanitización de HTML para prevenir XSS
    sanitizeHtml: function(input) {
      if (typeof input !== 'string') return '';
      
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;')
        .replace(/`/g, '&#96;');
    },

    // Validar que la URL sea de un dominio confiable
    isDomainTrusted: function(url) {
      try {
        // Extraer el hostname usando regex para compatibilidad
        const matches = url.match(/^https?:\/\/([^/?#]+)/i);
        if (!matches) return false;
        
        let hostname = matches[1].toLowerCase();
        
        // Remover 'www.' si existe
        hostname = hostname.replace(/^www\./, '');
        
        // Verificar si el dominio está en la lista de confianza
        for (let i = 0; i < this.trustedDomains.length; i++) {
          const domain = this.trustedDomains[i];
          if (hostname === domain || hostname.indexOf('.' + domain) !== -1) {
            return true;
          }
        }
        return false;
      } catch {
        return false;
      }
    },

    // Detectar patrones maliciosos en URLs
    containsMaliciousPatterns: function(url) {
      const maliciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /<script/i,
        /<%/i,
        /\${/i,
        /eval\(/i,
        /expression\(/i,
        /\.exe$/i,
        /\.bat$/i,
        /\.cmd$/i,
        /\.scr$/i,
        /\.pif$/i
      ];
      
      return maliciousPatterns.some(function(pattern) {
        return pattern.test(url);
      });
    },

    // Validación especial para Google Images (más restrictiva)
    isValidGoogleImagesUrl: function(url) {
      // Solo permitir rutas específicas y seguras de google.com
      const googleImagesPatterns = [
        /^https?:\/\/(?:www\.)?google\.com\/imgres\?/i,
        /^https?:\/\/images\.google\.com\/imgres\?/i,
        /^https?:\/\/encrypted-tbn[0-3]\.gstatic\.com\/images\?/i,
        /^https?:\/\/.*\.gstatic\.com\/images\?/i
      ];
      
      return googleImagesPatterns.some(function(pattern) {
        return pattern.test(url);
      });
    },

    // logica que valida si un telefono esta correcto...
    is_valid_phone: function (phone) {
      // inicializacion lazy
      let isValid = false;
      // expresion regular copiada de StackOverflow
      const re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/i;
  
      // validacion Regex
      try {
        isValid = re.test(phone);
      } catch (e) {
        console.log(e);
      }
      return isValid;
      // fin del try-catch block
    },
  
    is_valid_url_image: function (url) {
      // Validación de seguridad mejorada para imágenes
      try {
        // Verificar que sea una string válida
        if (!url || typeof url !== 'string' || url.length > 2048) {
          return false;
        }
        
        // Sanitizar la URL para prevenir inyecciones
        const sanitizedUrl = url.trim();
        
        // Detectar patrones maliciosos
        if (this.containsMaliciousPatterns(sanitizedUrl)) {
          console.log('URL contiene patrones maliciosos:', sanitizedUrl);
          return false;
        }
        
        // Validar formato de URL de imagen (flexible para diferentes servicios)
        const reWithExtension = /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+\.(?:jpg|jpeg|gif|png|bmp|webp|svg)(?:\?[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;
        const reImageService = /^https?:\/\/(?:images\.unsplash\.com|i\.imgur\.com|.*\.wikimedia\.org)\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/i;
        const reGoogleServices = /^https?:\/\/(?:lh[3-6]\.googleusercontent\.com|drive\.google\.com|docs\.google\.com|sites\.google\.com|blogger\.googleusercontent\.com|storage\.googleapis\.com|images\.google\.com|www\.google\.com|encrypted-tbn[0-3]\.gstatic\.com|gstatic\.com)\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/i;
        
        if (!reWithExtension.test(sanitizedUrl) && !reImageService.test(sanitizedUrl) && !reGoogleServices.test(sanitizedUrl)) {
          return false;
        }
        
        // Verificar dominio confiable O si es una URL válida de Google Images
        if (!this.isDomainTrusted(sanitizedUrl) && !this.isValidGoogleImagesUrl(sanitizedUrl)) {
          console.log('Dominio no confiable para imagen:', sanitizedUrl);
          return false;
        }
        
        return true;
      } catch (e) {
        console.log('Error validando imagen:', e);
        return false;
      }
    },
  
    is_valid_yt_video: function (url) {
      // Validación de seguridad mejorada para videos de YouTube
      try {
        // Verificar que sea una string válida
        if (!url || typeof url !== 'string' || url.length > 2048) {
          return false;
        }
        
        const sanitizedUrl = url.trim();
        
        // Detectar patrones maliciosos
        if (this.containsMaliciousPatterns(sanitizedUrl)) {
          console.log('URL de YouTube contiene patrones maliciosos:', sanitizedUrl);
          return false;
        }
        
        // Regex más estricta para YouTube que solo acepta dominios oficiales
        const re = /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})(?:\S+)?$/i;
        
        if (!re.test(sanitizedUrl)) {
          return false;
        }
        
        // Verificar que sea específicamente YouTube (dominio confiable)
        const hostname = sanitizedUrl.toLowerCase();
        if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
          return false;
        }
        
        return true;
      } catch (e) {
        console.log('Error validando video de YouTube:', e);
        return false;
      }
    },

    is_valid_video_url: function (url) {
      // Validación de seguridad mejorada para videos directos
      try {
        // Verificar que sea una string válida
        if (!url || typeof url !== 'string' || url.length > 2048) {
          return false;
        }
        
        const sanitizedUrl = url.trim();
        
        // Detectar patrones maliciosos
        if (this.containsMaliciousPatterns(sanitizedUrl)) {
          console.log('URL de video contiene patrones maliciosos:', sanitizedUrl);
          return false;
        }
        
        // Regex más estricta para archivos de video
        const re = /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+\.(?:mp4|webm|ogg|avi|mov)(?:\?[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;
        
        if (!re.test(sanitizedUrl)) {
          return false;
        }
        
        // Verificar dominio confiable
        if (!this.isDomainTrusted(sanitizedUrl)) {
          console.log('Dominio no confiable para video:', sanitizedUrl);
          return false;
        }
        
        return true;
      } catch (e) {
        console.log('Error validando video:', e);
        return false;
      }
    },
  
    getYTVideoId: function(url){
  
      return url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
    },
  
    getEmbeddedCode: function (url){
      try {
        const id = this.getYTVideoId(url);
        
        // Validar que el ID extraído sea válido (solo caracteres alfanuméricos y guiones)
        if (!id || !/^[\w-]{11}$/.test(id)) {
          console.log('ID de YouTube inválido:', id);
          return '<p>Error: Video de YouTube inválido</p>';
        }
        
        // Sanitizar el ID aunque ya fue validado
        const sanitizedId = this.sanitizeHtml(id);
        
        // Generar iframe con configuración de seguridad mejorada
        const code = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + sanitizedId + '" ' +
                   'frameborder="0" ' +
                   'allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" ' +
                   'allowfullscreen ' +
                   'sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>';
        
        return code;
      } catch (e) {
        console.log('Error generando código embebido:', e);
        return '<p>Error: No se pudo cargar el video</p>';
      }
    },
  
    getImageTag: function(url){
      // La URL ya fue validada, no necesita sanitización adicional
      // Solo escapamos comillas para evitar problemas con atributos HTML
      const safeUrl = url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
      const tag = '<img src="' + safeUrl + '" style="max-height: 400px;max-width: 400px;" alt="Imagen segura" loading="lazy">';
      return tag;
    },

    getVideoTag: function(url){
      // La URL ya fue validada, no necesita sanitización adicional
      // Solo escapamos comillas para evitar problemas con atributos HTML
      const safeUrl = url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
      const tag = '<video controls style="max-height: 400px;max-width: 400px;" preload="metadata"><source src="' + safeUrl + '" type="video/mp4">Tu navegador no soporta el elemento video.</video>';
      return tag;
    },
  
    validateMessage: function(msg){
      // Validación de entrada mejorada con seguridad
      if (!msg || typeof msg !== 'string') {
        return JSON.stringify({ mensaje: '' });
      }

      // Verificar longitud máxima del mensaje
      if (msg.length > 10000) {
        console.log('Mensaje demasiado largo, posible ataque');
        return JSON.stringify({ mensaje: 'Mensaje demasiado largo' });
      }

      try {
        const obj = JSON.parse(msg);
        
        // Validar estructura del objeto
        if (!obj || typeof obj !== 'object' || !Object.prototype.hasOwnProperty.call(obj, 'mensaje')) {
          console.log('Estructura de mensaje inválida');
          return JSON.stringify({ mensaje: 'Formato de mensaje inválido' });
        }

        // Sanitizar campos del objeto
        if (obj.nombre) {
          obj.nombre = this.sanitizeHtml(obj.nombre.toString().substring(0, 50));
        }
        
        // Verificar que el mensaje no esté vacío después de sanitización
        if (!obj.mensaje || typeof obj.mensaje !== 'string') {
          return JSON.stringify(obj);
        }

        const originalMessage = obj.mensaje.trim();
        
        // Verificar longitud del mensaje individual
        if (originalMessage.length > 2048) {
          console.log('URL o mensaje demasiado largo');
          obj.mensaje = 'Contenido demasiado largo';
          return JSON.stringify(obj);
        }

        // Procesar URLs con validación de seguridad estricta
        if (this.is_valid_url_image(originalMessage)) {
          console.log("Imagen válida detectada:", originalMessage);
          obj.mensaje = this.getImageTag(originalMessage);
        }
        else if (this.is_valid_yt_video(originalMessage)) {
          console.log("Video de YouTube válido detectado:", originalMessage);
          obj.mensaje = this.getEmbeddedCode(originalMessage);
        }
        else if (this.is_valid_video_url(originalMessage)) {
          console.log("Video válido detectado:", originalMessage);
          obj.mensaje = this.getVideoTag(originalMessage);
        }
        else {
          // Para texto normal, aplicar sanitización completa
          console.log("Procesando como texto normal");
          obj.mensaje = this.sanitizeHtml(originalMessage);
        }
        
        return JSON.stringify(obj);
        
      } catch (e) {
        console.log('Error processing message:', e);
        // En caso de error, devolver mensaje sanitizado básico
        return JSON.stringify({ 
          mensaje: this.sanitizeHtml('Error: Mensaje inválido'),
          nombre: 'Sistema'
        });
      }
    }
  
  
  
    
    
  
  // fin del modulo
  };
  