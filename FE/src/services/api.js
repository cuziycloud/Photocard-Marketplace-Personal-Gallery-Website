const API_URL = "http://localhost:8080/api/products"; 

export const fetchProducts = async () => {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
};
