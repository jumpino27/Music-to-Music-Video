
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the prefix 'data:image/jpeg;base64,' etc.
      if (result.includes(',')) {
        resolve(result.split(',')[1]);
      } else {
        reject('Invalid file format for Base64 conversion');
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
