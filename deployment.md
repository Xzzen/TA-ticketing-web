# DEPLOYMENT DOCUMENTATION

**Project Name:** Event Ticketing System (JappaJappa)
**Server Environment:** AWS EC2 (Ubuntu 24.04 LTS)
**Status:** Production

---

## 1. Repo Github
* **Repository URL:** [MASUKKAN_LINK_GITHUB_KAMU_DISINI]
* **Branch:** main

## 2. Production URL
Berikut adalah akses publik untuk aplikasi ini:
* **Frontend (Website Utama):** `http://54.173.5.21`
* **Backend API (Base URL):** `http://54.173.5.21/api`
* **Static Assets (Uploads):** `http://54.173.5.21/uploads/`

## 3. Detail AWS EC2
Spesifikasi server yang digunakan saat ini:
* **Instance ID:** [MASUKKAN_INSTANCE_ID_AWS]
* **Public IPv4 (Elastic IP):** `54.173.5.21`
* **Region:** [CONTOH: ap-southeast-1 (Singapore)]
* **OS:** Ubuntu 24.04 LTS
* **Web Server:** Nginx
* **Process Manager:** PM2

## 4. Konfigurasi Environment (.env)
File `.env` harus dibuat manual di server pada root folder project.
**List variabel wajib:**

PORT=3000
DATABASE_URL="file:./prod.db"
JWT_SECRET="[MASUKKAN_KEY_RAHASIA]"
NODE_ENV="production"

## 5. Langkah Deployment (Fresh Install)
Panduan setup dari nol di server baru (Ubuntu):

### A. Persiapan Sistem
1.  Update OS:
    `sudo apt update && sudo apt upgrade -y`
2.  Install Core Tools (Nginx, Git, Node.js):
    `sudo apt install nginx git -y`
    `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -`
    `sudo apt install -y nodejs`
3.  Install PM2:
    `sudo npm install -g pm2`

### B. Setup Backend
1.  Clone Repo:
    `git clone [LINK_GITHUB_KAMU]`
    `cd [NAMA_FOLDER_REPO]`
2.  Install & Setup Env:
    `npm install`
    `nano .env` (Paste variabel environment lalu simpan)
3.  Database & Permissions:
    `npx prisma migrate deploy`
    `mkdir -p public/uploads`
    `chmod -R 755 public`

### C. Setup Frontend
1.  Build React:
    `cd frontend-admin`
    `npm install`
    `npm run build`
2.  Deploy ke Nginx:
    `sudo mkdir -p /var/www/ticketing`
    `sudo cp -r dist/* /var/www/ticketing/`

## 6. Application Start (PM2)
Cara menjalankan backend agar online 24/7:

cd ~/TA-ticketing-web
pm2 start src/app.js --name "backend-api"
pm2 save
pm2 startup

## 7. Konfigurasi Nginx
Lokasi Config: `/etc/nginx/sites-available/default`

server {
    listen 80;
    server_name _;

    # 1. Frontend React
    root /var/www/ticketing;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Backend API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 3. Static Images (Bypass Backend)
    location /uploads/ {
        alias /home/ubuntu/TA-ticketing-web/public/uploads/;
        autoindex off;
    }
}

*Setelah edit, wajib restart:* `sudo systemctl restart nginx`

## 8. Langkah Verifikasi
1.  Buka browser: `http://54.173.5.21` (Pastikan web muncul).
2.  Cek Gambar: `http://54.173.5.21/uploads/[nama_file_ada]` (Pastikan gambar muncul).
3.  Cek API: `http://54.173.5.21/api` (Pastikan merespon JSON).

## 9. Troubleshooting
* **Gambar Pecah/404:** Cek path `alias` di Nginx dan pastikan permission folder public (`chmod 755`).
* **502 Bad Gateway:** Backend mati. Cek dengan `pm2 status` atau `pm2 logs`.
* **Data Tidak Update:** Pastikan sudah `npm run build` di frontend dan `pm2 restart` di backend setelah pull git.

## 10. Monitoring
* **Cek Status Backend:** `pm2 status`
* **Cek Realtime Log:** `pm2 logs`
* **Cek Error Nginx:** `sudo tail -f /var/log/nginx/error.log`

## 11. Maintenance (Prosedur Update)
Jika ada update kodingan di GitHub, lakukan ini di server:

1.  **Pull Code:** `git pull`
2.  **Update Backend:**
    `npm install` (jika perlu)
    `npx prisma migrate deploy` (jika db berubah)
    `pm2 restart backend-api`
3.  **Update Frontend:**
    `cd frontend-admin`
    `npm install`
    `npm run build`
    `sudo cp -r dist/* /var/www/ticketing/`