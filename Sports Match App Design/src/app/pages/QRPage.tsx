import { X } from "lucide-react";
import { QRSvg } from "../components/shared";

export function QRPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8">
      <button onClick={onBack} className="absolute top-5 left-5 p-2.5 rounded-full hover:bg-gray-100"><X size={22} /></button>
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-black text-xl mx-auto mb-3">S</div>
        <h2 className="text-xl font-black text-gray-900">Check-in QR Code</h2>
        <p className="text-muted-foreground text-sm mt-1">แสดงรหัสนี้ให้ผู้จัดสแกน</p>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-5 border border-border"><QRSvg value="KUSPORTS65010001SOMCHAI" /></div>
      <div className="mt-6 text-center">
        <p className="font-black text-xl text-gray-900">สมชาย ใจดี</p>
        <p className="text-muted-foreground text-sm">รหัสนิสิต: 6501000123456</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">KU Sports Day 2568</p>
      </div>
    </div>
  );
}
