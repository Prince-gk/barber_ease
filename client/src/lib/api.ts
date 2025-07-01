const API_BASE_URL = "https://barber-ease.onrender.com";

interface AuthTokens {
  access_token: string;
  token_type: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  is_barber: boolean;
  bio?: string;
}

interface Service {
  id: number;
  barber_id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

interface Appointment {
  id?: number;
  client_id: number;
  barber_id: number;
  service_id: number;
  appointment_time: string;
  status: string;
  barber_name?: string;
  service_name?: string;
}

interface Review {
  id?: number;
  appointment_id: number;
  client_id: number;
  barber_id: number;
  rating: number;
  comment?: string;
  created_at?: string;
}

class ApiService {
  private getHeaders(includeAuth = true) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return response.json();
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    is_barber: boolean;
    bio?: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    return response.json();
  }

  async getBarbers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/barbers/`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error("Failed to get barbers");
    }

    return response.json();
  }

  async getServices(barberId: number): Promise<Service[]> {
    const response = await fetch(
      `${API_BASE_URL}/services/?barber_id=${barberId}`,
      {
        headers: this.getHeaders(false),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get services");
    }

    return response.json();
  }

  async getMyAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to get appointments");
    }

    return response.json();
  }

  async getUserById(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    return response.json();
  }

  async getServiceById(serviceId: number): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error("Failed to get service");
    }

    return response.json();
  }

  async createAppointment(appointmentData: {
    barber_id: number;
    service_id: number;
    appointment_time: string;
  }): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      throw new Error("Failed to create appointment");
    }

    return response.json();
  }

  async createReview(reviewData: {
    appointment_id: number;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      throw new Error("Failed to create review");
    }

    return response.json();
  }

  async createService(serviceData: {
    name: string;
    description?: string;
    price: number;
    duration: number;
  }): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      throw new Error("Failed to create service");
    }

    return response.json();
  }

  async createAvailability(availabilityData: {
    start_time: string;
    end_time: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/availability/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(availabilityData),
    });

    if (!response.ok) {
      throw new Error("Failed to create availability");
    }

    return response.json();
  }

  async getReviews(barberId: number): Promise<Review[]> {
    const response = await fetch(
      `${API_BASE_URL}/reviews/?barber_id=${barberId}`,
      {
        headers: this.getHeaders(false),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get reviews");
    }

    return response.json();
  }

  async checkExistingReview(appointmentId: number): Promise<Review | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/appointment/${appointmentId}`,
        {
          headers: this.getHeaders(),
        },
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to check existing review");
      }

      return response.json();
    } catch (error) {
      // If endpoint doesn't exist, return null
      return null;
    }
  }
  async getBarberRating(
    barberId: number,
  ): Promise<{ average: number; count: number }> {
    //http://127.0.0.1:8000/barbers/2/rating
    const res = await fetch(`${API_BASE_URL}/barbers/${barberId}/rating`);
    console.log(res);
    if (!res.ok) throw new Error("Failed to fetch rating");
    return res.json();
  }
}

export const apiService = new ApiService();
export type { User, Service, Appointment, Review, AuthTokens };
