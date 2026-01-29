export function Footer() {
  return (
    <footer className="w-full bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Information Column */}
          <div className="space-y-3">
            <h3 className="text-primary font-semibold mb-4">CÔNG TY</h3>
            <div className="space-y-2 text-sm">
              <p className="hover:text-accent transition-colors cursor-pointer">HealthyFood Co., Ltd</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Loại hình: TNHH</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Mã số thuế: 0123456789</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Ngày cấp: 01/01/2024</p>
              <p className="hover:text-accent transition-colors cursor-pointer">123 Đường ABC, Quận 1, TP.HCM</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Điện thoại: (028) 1234 5678</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Email: info@healthyfood.vn</p>
            </div>
          </div>

          {/* About Us Column */}
          <div className="space-y-3">
            <h3 className="text-primary font-semibold mb-4">VỀ CHÚNG TÔI</h3>
            <div className="space-y-2 text-sm">
              <p className="hover:text-accent transition-colors cursor-pointer">Câu chuyện của chúng tôi</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Hệ thống cửa hàng</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Liên hệ</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Tin tức</p>
            </div>
          </div>

          {/* Services & Policies Column */}
          <div className="space-y-3">
            <h3 className="text-primary font-semibold mb-4">DỊCH VỤ & CHÍNH SÁCH</h3>
            <div className="space-y-2 text-sm">
              <p className="hover:text-accent transition-colors cursor-pointer">Dịch vụ</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Chương trình khách hàng thân thiết</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Phương thức thanh toán</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Chính sách đổi trả</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Chính sách giao hàng</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Câu hỏi thường gặp</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Quy trình phản hồi khách hàng</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Phiếu quà tặng</p>
            </div>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h3 className="text-primary font-semibold mb-4">PHÁP LÝ</h3>
            <div className="space-y-2 text-sm">
              <p className="hover:text-accent transition-colors cursor-pointer">Điều khoản & Điều kiện</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Chính sách bảo mật</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Tự công bố sản phẩm</p>
            </div>
          </div>

          {/* Contact Us Column */}
          <div className="space-y-3">
            <h3 className="text-primary font-semibold mb-4">LIÊN HỆ</h3>
            <div className="space-y-2 text-sm">
              <p className="hover:text-accent transition-colors cursor-pointer">Hotline: 1900 xxxx</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Zalo: 0123 456 789</p>
              <p className="hover:text-accent transition-colors cursor-pointer">Email: support@healthyfood.vn</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-sidebar-border text-center text-sm">
          <p className="text-muted-foreground">
            © 2024 HealthyFood. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
