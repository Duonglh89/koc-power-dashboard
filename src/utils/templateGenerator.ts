import * as XLSX from 'xlsx';

export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Dim_KOC (Danh mục KOC)
  const kocData = [
    {
      'ID KOC': 'KOC001',
      'Tên KOC': 'Mê trái cây 🍇',
      'TikTok Handle': '@me_trai_cay',
      'Link TikTok': 'https://www.tiktok.com/@me_trai_cay',
      'Followers': 850000,
      'Nhân sự quản lý': 'Nhân sự 1',
      'Nhóm mục tiêu': 'Nhóm mục tiêu 1',
      'Loại booking': 'Freecast',
      'Trạng thái': 'Hoạt động',
      'Ngày booking': '2026-01-10',
      'Phí Booking (₫)': 78000,
      'Phí hình ảnh (₫)': 0
    },
    {
      'ID KOC': 'KOC002',
      'Tên KOC': 'Hải Mây 🐼☁️',
      'TikTok Handle': '@haimay_daily',
      'Link TikTok': 'https://www.tiktok.com/@haimay_daily',
      'Followers': 620000,
      'Nhân sự quản lý': 'Nhân sự 2',
      'Nhóm mục tiêu': 'Nhóm mục tiêu 2',
      'Loại booking': 'Booking',
      'Trạng thái': 'Hoạt động',
      'Ngày booking': '2026-01-15',
      'Phí Booking (₫)': 9093000,
      'Phí hình ảnh (₫)': 0
    },
    {
      'ID KOC': 'KOC003',
      'Tên KOC': 'Dưỡng Ngầm Skincare ❤️',
      'TikTok Handle': '@duongngam_beauty',
      'Link TikTok': 'https://www.tiktok.com/@duongngam_beauty',
      'Followers': 430000,
      'Nhân sự quản lý': 'Nhân sự 1',
      'Nhóm mục tiêu': 'Nhóm mục tiêu 1',
      'Loại booking': 'Freecast',
      'Trạng thái': 'Hoạt động',
      'Ngày booking': '2026-01-20',
      'Phí Booking (₫)': 99000,
      'Phí hình ảnh (₫)': 0
    }
  ];
  const wsKoc = XLSX.utils.json_to_sheet(kocData);
  XLSX.utils.book_append_sheet(wb, wsKoc, '1. Dim_KOC');

  // Sheet 2: Fact_Video (Hiệu suất Video)
  const videoData = [
    {
      'ID Video': '7599005616442559764',
      'ID KOC': 'KOC001',
      'Tên Video / Tiêu đề': 'Bổ sung chất béo tốt cho bé ăn dặm đúng cách 🌱 #dauandam #anpaso',
      'Thời gian đăng': '2026-02-10 14:20:00',
      'Sản phẩm gắn kèm': 'Dầu Ăn Dặm Anpaso 100ml',
      'Thông điệp': 'Thông điệp 1',
      'Chiến dịch': 'Chiến dịch Mẹ Thông Thái',
      'Lượt xem (VV)': 220000,
      'Lượt thích': 45,
      'Bình luận': 12,
      'Lượt chia sẻ': 8,
      'Lượt hiển thị SP': 21141,
      'Lượt nhấp SP': 1171,
      'Đơn hàng SKU': 180,
      'Tổng GMV (₫)': 34500000,
      'GMV trực tiếp (₫)': 28900000,
      'GMV gián tiếp (₫)': 5600000
    },
    {
      'ID Video': '7599224975299579157',
      'ID KOC': 'KOC002',
      'Tên Video / Tiêu đề': 'Mì rau củ somen cho bé 7M tập nhai nuốt cực tốt #misomen',
      'Thời gian đăng': '2026-02-12 18:45:00',
      'Sản phẩm gắn kèm': 'Mì Somen Rau Củ Anpaso',
      'Thông điệp': 'Thông điệp 2',
      'Chiến dịch': 'Chiến dịch Tăng Thô',
      'Lượt xem (VV)': 85000,
      'Lượt thích': 1,
      'Bình luận': 0,
      'Lượt chia sẻ': 0,
      'Lượt hiển thị SP': 535,
      'Lượt nhấp SP': 20,
      'Đơn hàng SKU': 5,
      'Tổng GMV (₫)': 1850000,
      'GMV trực tiếp (₫)': 1850000,
      'GMV gián tiếp (₫)': 0
    }
  ];
  const wsVideo = XLSX.utils.json_to_sheet(videoData);
  XLSX.utils.book_append_sheet(wb, wsVideo, '2. Fact_Video');

  // Sheet 3: Fact_Ads_Cost (Chi phí Ads & Hoa hồng)
  const adsData = [
    {
      'ID Video / ID KOC': 'KOC001',
      'Ngày': '2026-02-10',
      'Tiền chạy Ads (₫)': 469462500,
      'GMV từ Ads (₫)': 670476572,
      'Phí Hoa hồng Affiliate (₫)': 78582382
    },
    {
      'ID Video / ID KOC': 'KOC002',
      'Ngày': '2026-02-12',
      'Tiền chạy Ads (₫)': 104007000,
      'GMV từ Ads (₫)': 158104920,
      'Phí Hoa hồng Affiliate (₫)': 67778538
    }
  ];
  const wsAds = XLSX.utils.json_to_sheet(adsData);
  XLSX.utils.book_append_sheet(wb, wsAds, '3. Fact_Ads_Cost');

  // Sheet 4: Fact_Livestream (Phiên Live)
  const liveData = [
    {
      'ID Phiên Live': 'LIVE001',
      'ID KOC': 'KOC002',
      'Tên phiên Live': 'Siêu Hội Ăn Dặm - Giảm Giá Combo Lên Đến 40% 🔥',
      'Ngày Live': '2026-02-20',
      'Thời lượng (Phút)': 180,
      'Lượt xem LIVE': 35000,
      'Thích LIVE': 125000,
      'Bình luận LIVE': 2400,
      'Chia sẻ LIVE': 450,
      'Hiển thị SP LIVE': 48000,
      'Nhấp SP LIVE': 4200,
      'Đơn hàng LIVE': 450,
      'GMV Live (₫)': 85000000
    }
  ];
  const wsLive = XLSX.utils.json_to_sheet(liveData);
  XLSX.utils.book_append_sheet(wb, wsLive, '4. Fact_Livestream');

  // Sheet 5: Huong_Dan_Format (Hướng dẫn định dạng)
  const guideData = [
    { 'Mục hiển thị trên Dashboard': '1. Thẻ KPI Tổng (Top Cards)', 'Cột dữ liệu yêu cầu': 'Doanh thu chung (GMV), Tổng Chi phí, Số KOC, Số Video, Số Live, ROAS', 'Giải thích & Ghi chú': 'Tự động tính từ các bảng Dim_KOC, Fact_Video, Fact_Ads_Cost' },
    { 'Mục hiển thị trên Dashboard': '2. Phễu chuyển đổi (Funnel Chart)', 'Cột dữ liệu yêu cầu': 'Lượt xem (VV) ➔ Lượt click ➔ Đơn hàng', 'Giải thích & Ghi chú': 'Tính CTR (Click/View) và CVR (Đơn/Click)' },
    { 'Mục hiển thị trên Dashboard': '3. Biểu đồ động (Dynamic Bar)', 'Cột dữ liệu yêu cầu': 'Thông điệp, Chiến dịch, Nhóm mục tiêu, Loại booking', 'Giải thích & Ghi chú': 'Cho phép chọn hiển thị theo từng chiều phân tích' },
    { 'Mục hiển thị trên Dashboard': '4. Top 10 KOC Bar Chart', 'Cột dữ liệu yêu cầu': 'Tên KOC, Doanh thu chung, ROAS', 'Giải thích & Ghi chú': 'Tự động xếp hạng 10 KOC có GMV hoặc ROAS cao nhất' },
    { 'Mục hiển thị trên Dashboard': '5. Cơ cấu Chi phí (Donut Chart)', 'Cột dữ liệu yêu cầu': 'Phí chạy Ads, Phí hoa hồng Affiliate, Phí Booking', 'Giải thích & Ghi chú': 'Tính tỷ lệ % từng loại chi phí trong tổng chi phí' },
    { 'Mục hiển thị trên Dashboard': '6. Biểu đồ xu hướng (Trendline)', 'Cột dữ liệu yêu cầu': 'Ngày, Doanh thu chung (GMV), ROAS', 'Giải thích & Ghi chú': 'Vẽ đường biến động theo ngày/tuần/tháng' },
    { 'Mục hiển thị trên Dashboard': '7. Bảng ma trận KOC (Matrix Table)', 'Cột dữ liệu yêu cầu': 'Nhóm mục tiêu, PIC, Loại booking, Số video, GMV, Chi phí, ROAS', 'Giải thích & Ghi chú': 'Cung cấp nút [+] mở rộng phân cấp nhóm' },
    { 'Mục hiển thị trên Dashboard': '8. Trang Chi tiết KOC (Drilldown)', 'Cột dữ liệu yêu cầu': 'Followers, TikTok Handle, PIC, Video List, Live List', 'Giải thích & Ghi chú': 'Hiển thị hồ sơ chi tiết và 2 bảng Video & Livestream' }
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  XLSX.utils.book_append_sheet(wb, wsGuide, '0. Huong_Dan_Format');

  // Trigger download
  XLSX.writeFile(wb, 'Template_KOC_Power_Dashboard.xlsx');
}
