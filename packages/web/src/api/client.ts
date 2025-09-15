import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000", // adjust if backend hosted elsewhere
});
