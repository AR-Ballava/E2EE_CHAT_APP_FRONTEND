import axios from "axios";

const API = axios.create({
  baseURL: "http://3.111.198.202/api"
});

/* ADD ACCESS TOKEN TO EVERY REQUEST */

API.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;

});


/* HANDLE TOKEN EXPIRY */

API.interceptors.response.use(

  response => response,

  async error => {

    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {

      originalRequest._retry = true;

      try {

        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          "http://3.111.198.202/api/auth/refresh",
          { refreshToken } // ✅ SEND JSON
        );

        const newAccessToken = res.data.accessToken;

        localStorage.setItem("token", newAccessToken);

        /* notify app that token changed */
        window.dispatchEvent(new Event("tokenRefreshed"));

        originalRequest.headers.Authorization = "Bearer " + newAccessToken;

        return API(originalRequest);

      } catch (refreshError) {

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        window.location.href = "/";

      }

    }

    return Promise.reject(error);

  }

);

export default API;