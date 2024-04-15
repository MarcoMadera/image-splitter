import type { Images } from "types/imagesResponse";

import { callApi } from "./callApi";
import { handleJsonResponse } from "./handleJsonResponse";

export async function getImages(): Promise<Images | null> {
  try {
    const response = await callApi({ endpoint: "/images", method: "GET" });

    const data = await handleJsonResponse<Images>(response);

    return data;
  } catch (error) {
    console.error("Error getting images:", error);
    return null;
  }
}
