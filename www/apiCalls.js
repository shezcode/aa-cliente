export class apiCalls {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  async request(endpoint, method = "GET", body = null, headers = {}) {
    const url = `${this.baseURL}/${endpoint}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP Error, Status: ${response.status} `);
      }
      //console.log("API response: ", response);
      return response;
    } catch (error) {
      console.error("API request error: ", error.message);
      throw error;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, "GET", null, headers);
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, "POST", body, headers);
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, "PUT", body, headers);
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, "DELETE", null, headers);
  }
}
