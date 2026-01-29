"use client";

import Link from "next/link";
import { Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoShopPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Store className="w-12 h-12 text-primary" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Bạn chưa có cửa hàng
      </h2>

      <p className="text-gray-600 mb-8 text-center max-w-md">
        Đăng ký cửa hàng ngay để bắt đầu bán sản phẩm trên HealthyFood và tiếp cận hàng triệu khách hàng tiềm năng.
      </p>

      <Link href="/shop/register">
        <Button size="lg" className="gap-2">
          Đăng ký cửa hàng mới
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
