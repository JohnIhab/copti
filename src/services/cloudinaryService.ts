export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'dev_preset'); // لازم تكون عامل preset في Cloudinary
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Upload failed');
  }

  return data.secure_url; // ده اللينك النهائي اللي بيتخزن في Firestore
};
