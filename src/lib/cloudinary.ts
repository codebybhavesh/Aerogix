// Use resource_type=auto so both images (JPG/PNG) and PDFs are handled correctly.
// Cloudinary maps this to the /auto/upload endpoint.
export const CLOUDINARY_LAB_REPORTS_UPLOAD_URL =
  "https://api.cloudinary.com/v1_1/dfgtpljtq/raw/upload";

export const CLOUDINARY_LAB_REPORTS_UPLOAD_PRESET = "lab_reports_upload";

export type CloudinaryUnsignedUploadResponse = {
  asset_id?: string;
  public_id?: string;
  version?: number;
  version_id?: string;
  signature?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
  tags?: string[];
  bytes?: number;
  type?: string;
  etag?: string;
  placeholder?: boolean;
  url?: string;
  secure_url: string;
  original_filename?: string;
  error?: { message?: string };
};

export async function uploadLabReportToCloudinary(file: File): Promise<CloudinaryUnsignedUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_LAB_REPORTS_UPLOAD_PRESET);
  formData.append("resource_type", "auto");

  const res = await fetch(CLOUDINARY_LAB_REPORTS_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const json = (await res.json()) as CloudinaryUnsignedUploadResponse;

  if (!res.ok) {
    const msg = json?.error?.message || "Cloudinary upload failed";
    throw new Error(msg);
  }

  if (!json.secure_url) {
    throw new Error("Cloudinary upload succeeded but `secure_url` was missing");
  }

  return json;
}
