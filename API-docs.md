---

### 2. File `api-docs.md`
File ini berisi dokumentasi teknis API untuk memudahkan pengujian (misalnya menggunakan Postman/Thunder Client). Simpan file ini di folder backend.

```markdown
# 📚 Dokumentasi API (API Documentation)

**Base URL:** `http://localhost:3000/api`

## A. Authentication (Otentikasi)

### 1. Register User Baru
* **URL:** `/auth/register`
* **Method:** `POST`
* **Body (JSON):**
    ```json
    {
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "password": "password123",
      "role": "USER"  // Opsi: "ADMIN" atau "USER"
    }
    ```
* **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Register berhasil",
      "data": { ...data_user... }
    }
    ```

### 2. Login
* **URL:** `/auth/login`
* **Method:** `POST`
* **Body (JSON):**
    ```json
    {
      "email": "budi@example.com",
      "password": "password123"
    }
    ```
* **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login berhasil",
      "token": "eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "role": "USER"
    }
    ```
    > **Catatan:** Simpan `token` ini untuk mengakses fitur yang butuh login.

---

## B. Management Event (Admin Only)

⚠️ **Header Wajib:** `Authorization: Bearer <TOKEN_ADMIN>`

### 1. Tambah Event Baru
* **URL:** `/events`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data` (Karena ada upload gambar)
* **Body (Form Data):**
    * `name`: (Text) Konser Musik 2025
    * `description`: (Text) Deskripsi lengkap acara...
    * `date`: (Text) 2025-12-31
    * `location`: (Text) Pantai Losari, Makassar
    * `image`: (File) *Pilih file gambar (jpg/png)*
* **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Event berhasil dibuat!",
      "data": { ... }
    }
    ```

### 2. Edit Event
* **URL:** `/events/:id` (Contoh: `/events/1`)
* **Method:** `PUT`
* **Body (JSON) atau Form Data:**
    ```json
    {
      "name": "Update Nama Konser",
      "location": "Lokasi Baru"
    }
    ```

### 3. Hapus Event (Soft Delete)
* **URL:** `/events/:id`
* **Method:** `DELETE`
* **Response:**
    ```json
    {
      "success": true,
      "message": "Event berhasil dihapus (Soft Delete)!"
    }
    ```

---

## C. Public & User Features

### 1. Lihat Semua Event (Public)
* **URL:** `/events`
* **Method:** `GET`
* **Access:** Siapa saja (Tidak butuh token)
* **Response:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "Konser Amal",
          "tickets": [
             { "price": 50000, "quota": 100 }
          ]
        }
      ]
    }
    ```

### 2. Beli Tiket (User Only)
⚠️ **Header Wajib:** `Authorization: Bearer <TOKEN_USER>`

* **URL:** `/transactions`
* **Method:** `POST`
* **Body (JSON):**
    ```json
    {
      "eventId": 1,
      "quantity": 2
    }
    ```
* **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Transaksi berhasil!",
      "data": {
        "totalAmount": 100000,
        "status": "SUCCESS"
      }
    }
    ```

### 3. Lihat Tiket Saya (User Only)
⚠️ **Header Wajib:** `Authorization: Bearer <TOKEN_USER>`

* **URL:** `/transactions/my-tickets`
* **Method:** `GET`
* **Response:**
    ```json
    {
      "success": true,
      "data": [ ...array_riwayat_transaksi... ]
    }
    ```