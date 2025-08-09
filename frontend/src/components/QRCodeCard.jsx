import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRCodeCard({ url }) {
  return (
    <div className="bg-white rounded shadow p-4 flex items-center gap-4">
      <div>
        <div className="font-medium mb-1">Share via QR</div>
        <div className="text-sm text-gray-500">Scan to open your referral link</div>
      </div>
      <QRCodeCanvas value={url} size={120} includeMargin className="ml-auto" />
    </div>
  );
}


