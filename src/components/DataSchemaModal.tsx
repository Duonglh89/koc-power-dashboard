import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, CheckCircle2, Layers, HelpCircle, ArrowRight } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/templateGenerator';

interface DataSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSchemaModal: React.FC<DataSchemaModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'koc' | 'video' | 'cost' | 'live'>('overview');

  if (!isOpen) return null;

  const sections = [
    { id: 'overview', label: '1. Định dạng Mục Tổng quan' },
    { id: 'koc', label: '2. Bảng Danh mục KOC (Dim_KOC)' },
    { id: 'video', label: '3. Bảng Hiệu suất Video (Fact_Video)' },
    { id: 'cost', label: '4. Bảng Chi phí & Ads (Fact_Cost)' },
    { id: 'live', label: '5. Bảng Livestream (Fact_Live)' },
  ];

  return (
    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-navy-800 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide">QUY CHUẨN FORMAT DỮ LIỆU CẦN CÓ CHO TỪNG MỤC DASHBOARD</h2>
              <p className="text-[11px] text-slate-300">Hướng dẫn chi tiết cấu trúc cột &amp; tải file Excel mẫu chuẩn</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Top Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as any)}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  activeSection === s.id
                    ? 'bg-navy-800 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={downloadExcelTemplate}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-md shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải File Excel Mẫu (.xlsx)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* Section 1: Overview Format */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-lg text-sky-900">
                <h3 className="font-bold text-xs flex items-center gap-1.5 mb-1 text-sky-950">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Logic ánh xạ dữ liệu lên các thành phần Tab Tổng quan (Overview):
                </h3>
                <p className="text-[11px] leading-relaxed">
                  Trang tổng quan tính toán tự động từ 3 bảng nguồn (Dim_KOC, Fact_Video, Fact_Ads_Cost). Dưới đây là các trường tương ứng với từng ô hiển thị trên màn hình:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                  <div className="font-bold text-navy-800 text-xs border-b pb-1.5 flex items-center justify-between">
                    <span>1. Hàng 8 Thẻ KPI Đầu trang</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Top Cards</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li>• <strong>Số KOC</strong>: Đếm số lượng KOC độc nhất (Distinct Count ID KOC).</li>
                    <li>• <strong>Số Video</strong>: Tổng số dòng trong bảng Fact_Video.</li>
                    <li>• <strong>Số phiên live</strong>: Tổng số phiên trong Fact_Livestream.</li>
                    <li>• <strong>Tổng doanh thu (GMV)</strong>: Tổng cột <code>GMV</code> từ Video + Live.</li>
                    <li>• <strong>Doanh thu tự nhiên</strong>: Cột <code>GMV trực tiếp</code>.</li>
                    <li>• <strong>Doanh thu quảng cáo</strong>: Cột <code>GMV Ads</code> (từ Spark Ads).</li>
                    <li>• <strong>Tổng chi phí</strong>: <code>Phí Booking + Phí Ads + Phí hoa hồng</code>.</li>
                    <li>• <strong>ROAS</strong>: <code>Tổng GMV / Tổng Chi phí</code>.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                  <div className="font-bold text-navy-800 text-xs border-b pb-1.5 flex items-center justify-between">
                    <span>2. Phễu chuyển đổi (Funnel)</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">3 Tầng</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li>• <strong>Tầng 1 (Hiển thị)</strong>: Lấy tổng cột <code>Lượt xem (VV)</code>.</li>
                    <li>• <strong>Tầng 2 (Tiếp cận)</strong>: Lấy tổng cột <code>Lượt nhấp SP</code> &amp; Tỷ lệ <code>Lượt nhấp / Lượt xem</code>.</li>
                    <li>• <strong>Tầng 3 (Chuyển đổi)</strong>: Lấy tổng cột <code>Đơn hàng SKU</code> &amp; Tỷ lệ <code>Đơn hàng / Lượt nhấp</code>.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                  <div className="font-bold text-navy-800 text-xs border-b pb-1.5 flex items-center justify-between">
                    <span>3. Biểu đồ Động &amp; Top 10 KOC</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Dynamic Visuals</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li>• <strong>Biểu đồ động</strong>: Group by theo cột <code>Thông điệp</code>, <code>Chiến dịch</code> hoặc <code>Nhóm mục tiêu</code>.</li>
                    <li>• <strong>Top 10 KOC</strong>: Sắp xếp giảm dần theo <code>Tổng GMV</code> hoặc <code>ROAS</code>.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                  <div className="font-bold text-navy-800 text-xs border-b pb-1.5 flex items-center justify-between">
                    <span>4. Cơ cấu Chi phí &amp; Đường Xu hướng</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Donut &amp; Line</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li>• <strong>Cơ cấu chi phí</strong>: % Phí Ads, % Phí hoa hồng, % Phí booking.</li>
                    <li>• <strong>Biểu đồ xu hướng</strong>: Vẽ biểu đồ diện tích (Area Chart) theo cột <code>Ngày</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Dim_KOC Schema */}
          {activeSection === 'koc' && (
            <div className="space-y-3">
              <div className="font-bold text-navy-800 text-xs">Cấu trúc Bảng Danh mục KOC (Dim_KOC):</div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-navy-800 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-3">Tên Cột (Header)</th>
                      <th className="py-2.5 px-2.5">Kiểu dữ liệu</th>
                      <th className="py-2.5 px-3">Bắt buộc</th>
                      <th className="py-2.5 px-3">Mô tả &amp; Ví dụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">ID KOC</td><td>Text</td><td>Bắt buộc</td><td>Mã định danh duy nhất (VD: <code>KOC001</code>, <code>ANP_01</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Tên KOC</td><td>Text</td><td>Bắt buộc</td><td>Tên hiển thị (VD: <code>Mê trái cây 🍇</code>, <code>Hải Mây</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">TikTok Handle</td><td>Text</td><td>Tùy chọn</td><td>Username TikTok (VD: <code>@me_trai_cay</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Link TikTok</td><td>Text</td><td>Tùy chọn</td><td>URL kênh (VD: <code>https://tiktok.com/@me_trai_cay</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Followers</td><td>Number</td><td>Tùy chọn</td><td>Lượng người theo dõi (VD: <code>850000</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Nhân sự quản lý</td><td>Text</td><td>Bắt buộc</td><td>PIC phụ trách (VD: <code>Nhân sự 1</code>, <code>Nhân sự 2</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Nhóm mục tiêu</td><td>Text</td><td>Bắt buộc</td><td>Phân loại nhóm (VD: <code>Nhóm mục tiêu 1</code>, <code>Tier 1</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Loại booking</td><td>Text</td><td>Bắt buộc</td><td>Hình thức: <code>Booking</code> hoặc <code>Freecast</code></td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Trạng thái</td><td>Text</td><td>Tùy chọn</td><td><code>Hoạt động</code>, <code>Tạm dừng</code>, <code>Đã hoàn thành</code></td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Ngày booking</td><td>Date</td><td>Bắt buộc</td><td>Ngày bắt đầu hợp tác (Định dạng: <code>YYYY-MM-DD</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Phí Booking (₫)</td><td>Number</td><td>Bắt buộc</td><td>Tiền trả cứng cho KOC (VD: <code>10000000</code> hoặc <code>0</code>)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Fact_Video Schema */}
          {activeSection === 'video' && (
            <div className="space-y-3">
              <div className="font-bold text-navy-800 text-xs">Cấu trúc Bảng Hiệu suất Video (Fact_Video):</div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-navy-800 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-3">Tên Cột (Header)</th>
                      <th className="py-2.5 px-2.5">Kiểu dữ liệu</th>
                      <th className="py-2.5 px-3">Bắt buộc</th>
                      <th className="py-2.5 px-3">Mô tả &amp; Ví dụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">ID Video</td><td>Text</td><td>Bắt buộc</td><td>Mã video TikTok (VD: <code>7599005616442559764</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">ID KOC</td><td>Text</td><td>Bắt buộc</td><td>Khóa ngoại nối với Dim_KOC (VD: <code>KOC001</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Tiêu đề video</td><td>Text</td><td>Tùy chọn</td><td>Caption / Caption hashtag của video</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Thời gian đăng</td><td>DateTime</td><td>Bắt buộc</td><td>Thời điểm xuất bản (VD: <code>2026-02-10 14:20:00</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Thông điệp</td><td>Text</td><td>Tùy chọn</td><td>Phân loại thông điệp (VD: <code>Thông điệp 1</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Lượt xem (VV)</td><td>Number</td><td>Bắt buộc</td><td>Số lượt xem video (VD: <code>220000</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Lượt hiển thị SP</td><td>Number</td><td>Bắt buộc</td><td>Số lần nút giỏ hàng xuất hiện (VD: <code>21141</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Lượt nhấp SP</td><td>Number</td><td>Bắt buộc</td><td>Số lần bấm vào giỏ hàng (VD: <code>1171</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Đơn hàng SKU</td><td>Number</td><td>Bắt buộc</td><td>Số đơn hàng chuyển đổi thành công (VD: <code>180</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Tổng GMV (₫)</td><td>Number</td><td>Bắt buộc</td><td>Tổng doanh thu video mang lại (VD: <code>34500000</code>)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Fact_Cost Schema */}
          {activeSection === 'cost' && (
            <div className="space-y-3">
              <div className="font-bold text-navy-800 text-xs">Cấu trúc Bảng Chi phí &amp; Quảng cáo (Fact_Ads_Cost):</div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-navy-800 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-3">Tên Cột (Header)</th>
                      <th className="py-2.5 px-2.5">Kiểu dữ liệu</th>
                      <th className="py-2.5 px-3">Bắt buộc</th>
                      <th className="py-2.5 px-3">Mô tả &amp; Ý nghĩa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">ID Video / ID KOC</td><td>Text</td><td>Bắt buộc</td><td>Mã KOC hoặc Mã Video được chạy quảng cáo</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Ngày</td><td>Date</td><td>Bắt buộc</td><td>Ngày phát sinh chi phí (VD: <code>2026-02-10</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Tiền chạy Ads (₫)</td><td>Number</td><td>Bắt buộc</td><td>Ngân sách chạy Spark Ads / Ads TikTok (VD: <code>15000000</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">GMV từ Ads (₫)</td><td>Number</td><td>Bắt buộc</td><td>Doanh thu sinh ra từ quảng cáo (VD: <code>45000000</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Phí Hoa hồng (₫)</td><td>Number</td><td>Tùy chọn</td><td>Hoa hồng Affiliate trả cho KOC (VD: <code>8% GMV</code>)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: Fact_Live Schema */}
          {activeSection === 'live' && (
            <div className="space-y-3">
              <div className="font-bold text-navy-800 text-xs">Cấu trúc Bảng Phiên Livestream (Fact_Livestream):</div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-navy-800 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-3">Tên Cột (Header)</th>
                      <th className="py-2.5 px-2.5">Kiểu dữ liệu</th>
                      <th className="py-2.5 px-3">Bắt buộc</th>
                      <th className="py-2.5 px-3">Mô tả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">ID Phiên Live</td><td>Text</td><td>Bắt buộc</td><td>Mã phiên live</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">ID KOC</td><td>Text</td><td>Bắt buộc</td><td>Mã KOC thực hiện phiên live</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Tên phiên Live</td><td>Text</td><td>Tùy chọn</td><td>Tiêu đề phiên livestream</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Ngày Live</td><td>Date</td><td>Bắt buộc</td><td>Ngày diễn ra (VD: <code>2026-02-20</code>)</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono">Lượt xem LIVE</td><td>Number</td><td>Bắt buộc</td><td>Tổng người xem phiên live</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">Đơn hàng LIVE</td><td>Number</td><td>Bắt buộc</td><td>Số đơn hàng chốt trong live</td></tr>
                    <tr className="hover:bg-slate-50"><td className="py-2 px-3 font-mono font-bold text-navy-800">GMV Live (₫)</td><td>Number</td><td>Bắt buộc</td><td>Doanh số phiên live mang lại</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Hệ thống tự động hỗ trợ cả file Export gốc từ TikTok Shop Seller Center!</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadExcelTemplate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải File Template Chuẩn</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs px-4 py-2 rounded-md transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
