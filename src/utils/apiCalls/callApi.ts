import { API_BASE_URL } from "utils/constants";

interface ICallAPI {
  endpoint: string;
  method: string;
  body?: BodyInit | null;
}

export async function callApi({
  endpoint,
  method,
  body = null,
}: ICallAPI): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return res;
}
