# 🚀 KOC POWER DASHBOARD - HỆ THỐNG QUẢN TRỊ HIỆU SUẤT KOC & AFFILIATE MARKETING

Hệ thống Dashboard phân tích hiệu suất KOC, Video và Livestream TikTok Shop chuyên nghiệp được xây dựng bằng **React + TypeScript + TailwindCSS + Recharts**, sẵn sàng đẩy lên **GitHub** và triển khai trực tuyến trên **Vercel** miễn phí 100%.

---

## 🌟 TÍNH NĂNG NỔI BẬT (CHUẨN 100% THEO 5 MÀN HÌNH POWER DASHBOARD)

1. **Tab Tổng quan (Overview)**:
   - 8 Thẻ KPI tổng: Số KOC, Số Video, Số Live, Tổng GMV, GMV Tự nhiên, GMV Ads, Tổng Chi phí, ROAS.
   - Phễu chuyển đổi 3 tầng: `Hiển thị (Views) ➔ Tiếp cận (Clicks + CTR) ➔ Chuyển đổi (Orders + CVR)`.
   - Biểu đồ động đa chiều: Tùy chọn xem Doanh thu / Chi phí / ROAS theo Thông điệp, Chiến dịch, Nhóm mục tiêu.
   - Top 10 KOC Bar Chart chuyển đổi nhanh giữa **Doanh thu** và **ROAS**.
   - Cơ cấu Chi phí (Donut Chart) & Biểu đồ xu hướng (Area Line Chart).

2. **Tab Danh sách KOC (Hierarchical Matrix)**:
   - Bảng ma trận phân cấp cho phép bấm dấu `[+]` để mở rộng từ **Nhóm mục tiêu / Nhân sự / Loại booking ➔ Từng KOC cụ thể**.
   - Tìm kiếm nhanh, lọc dữ liệu và xuất file CSV báo cáo.

3. **Tab Chi tiết KOC (Single KOC Drill-down)**:
   - Chọn KOC từ dropdown để xem toàn bộ hồ sơ TikTok, Follower, PIC, Funnel riêng, Trendline riêng.
   - 2 Bảng chi tiết: **Chi tiết từng Video** & **Chi tiết từng phiên Livestream**.

4. **Tab Gợi ý KOC (AI / Rule-based Scoring)**:
   - Tự động phân loại: ⭐ **KOC Ngôi sao (Scale)**, 🚀 **KOC Tiềm năng (Nurture)**, ⚠️ **KOC Cần Tối ưu (Review)**.

5. **Bộ Nạp Dữ Liệu Linh Hoạt**:
   - Tải lên trực tiếp file Excel (.xlsx) / CSV.
   - Kết nối trực tiếp link Google Sheets trực tuyến.

---

## 🛠️ HƯỚNG DẪN 3 BƯỚC ĐẨY LÊN GITHUB & DEPLOY VERCEL

### Bước 1: Cài đặt và Chạy thử trên máy Local
```bash
cd C:\Users\AD\.gemini\antigravity\scratch\koc-power-dashboard
npm install
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:5173` để xem dashboard.

---

### Bước 2: Đẩy Mã Nguồn lên GitHub
1. Mở trang [github.com](https://github.com) và tạo một Repository mới (ví dụ: `koc-power-dashboard`).
2. Mở Terminal tại thư mục dự án và chạy các lệnh:
```bash
git init
git add .
git commit -m "feat: initial release of KOC Power Dashboard"
git branch -M main
git remote add origin https://github.com/<tai-khoan-github-cua-ban>/koc-power-dashboard.git
git push -u origin main
```

---

### Bước 3: Deploy lên Vercel trong 1 phút (Miễn phí)
1. Đăng nhập vào [vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Bấm **"Add New..." ➔ "Project"**.
3. Chọn Repository `koc-power-dashboard` vừa tạo.
4. Bấm nút **"Deploy"** (Vercel tự động nhận diện framework Vite/React và build).
5. Sau ~30 giây, bạn sẽ nhận được link web trực tiếp (ví dụ: `https://koc-power-dashboard.vercel.app`) để sử dụng ngay!

---

## 💻 Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Charts**: Recharts
- **Parsers**: xlsx (Excel Reader), papaparse (CSV Parser)
