export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "lesson_videos_unsigned");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dckyu4eij/video/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return data.secure_url;
}
