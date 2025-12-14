# 🚀 Panduan Deployment ke AWS EC2 + Elastic IP

Dokumen ini berisi langkah-langkah mendeploy aplikasi (Backend Node.js + Frontend React) ke server AWS EC2 Ubuntu menggunakan **Elastic IP** agar alamat server tidak berubah-ubah.

---

## 🏗️ Tahap 1: Persiapan Server & Elastic IP

### 1. Buat Instance EC2
1.  **Login ke AWS Academy** -> **Start Lab** -> **AWS Console**.
2.  Masuk ke menu **EC2** -> **Instances** -> **Launch Instances**.
3.  **Konfigurasi:**
    * **Name:** `Web-Ticketing-Server`
    * **OS:** Ubuntu Server 22.04 LTS (HVM).
    * **Instance Type:** `t3.micro` atau `t2.micro`.
    * **Key Pair:** Pilih `vockey`.
4.  **Network Settings:**
    * ✅ Allow SSH traffic from Anywhere.
    * ✅ Allow HTTP traffic from the internet.
    * ✅ Allow HTTPS traffic from the internet.
5.  Klik **Launch Instance**.

### 2. Setting Security Group (Buka Port)
1.  Klik instance yang baru dibuat, masuk tab **Security**.
2.  Klik **Security groups** (misal: `sg-0abc...`).
3.  Klik **Edit inbound rules** -> **Add rule**.
    * **Type:** `Custom TCP` -> **Port:** `3000` -> **Source:** `Anywhere (0.0.0.0/0)`
    * *(Pastikan aturan SSH (22) dan HTTP (80) juga sudah ada)*.
4.  Klik **Save rules**.

### 3. Pasang Elastic IP (PENTING 🌟)
Agar IP server permanen dan tidak ganti-ganti saat restart:
1.  Di menu kiri EC2, cari bagian **Network & Security** -> klik **Elastic IPs**.
2.  Klik tombol oranye **Allocate Elastic IP address**.
3.  Langsung klik **Allocate** (biarkan settingan default).
4.  Setelah IP muncul, klik IP tersebut (ceklis kotak di sebelahnya).
5.  Klik menu **Actions** (di pojok kanan atas) -> Pilih **Associate Elastic IP address**.
6.  **Instance:** Pilih instance `Web-Ticketing-Server` kamu.
7.  **Private IP address:** Pilih IP yang muncul di dropdown.
8.  Klik **Associate**.

> **CATATAN:** Sekarang IP ini (misal: `54.12.34.56`) adalah IP abadi kamu. Gunakan IP ini untuk SSH dan setting Frontend.

---

## 🔌 Tahap 2: Koneksi ke Server

1.  Buka terminal (Git Bash/CMD).
2.  Pastikan file kunci (`labsuser.pem`) ada.
3.  Konek menggunakan Elastic IP yang baru dibuat:
    ```bash
    ssh -i "labsuser.pem" ubuntu@<ELASTIC-IP-KAMU>
    ```
    *(Contoh: `ssh -i labsuser.pem ubuntu@54.12.34.56`)*

---

## 🛠️ Tahap 3: Instalasi Software Server

Copy-paste perintah ini ke terminal server (Ubuntu):

```bash
# 1. Update Server
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20
curl -fsSL [https://deb.nodesource.com/setup_20.x](https://deb.nodesource.com/setup_20.x) | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Git, Nginx, & PM2
sudo apt install -y git nginx
sudo npm install -g pm2