import type { Images } from "types/imagesResponse";

import { callApi } from "./callApi";
import { handleJsonResponse } from "./handleJsonResponse";

export async function getImages(): Promise<Images | null> {
  const response = await callApi({ endpoint: "/images", method: "GET" });

  const data = handleJsonResponse<Images>(response);

  return data;
}
