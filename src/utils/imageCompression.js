export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7, outputType = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Mantener el ratio de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileExt = outputType.split('/')[1] || 'jpg';
              const originalName = file.name;
              const baseName = originalName.includes('.') 
                ? originalName.substring(0, originalName.lastIndexOf('.')) 
                : originalName;
              const newName = `${baseName}.${fileExt}`;
              const compressedFile = new File([blob], newName, {
                type: outputType,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Fallo al comprimir la imagen'));
            }
          },
          outputType,
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
