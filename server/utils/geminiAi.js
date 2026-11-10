/**
 * PawCare AI Consultant powered by Google Gemini API
 * Huấn luyện (System Prompt + Real-time MongoDB Grounding + Multi-turn History)
 */

const MODEL_PRIORITY = [
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
];

const buildSystemInstruction = ({ pet, services, doctors }) => {
  const servicesListText = (services || [])
    .map(
      (s, i) =>
        `${i + 1}. ${s.name} | Giá: ${Number(s.price).toLocaleString('vi-VN')} đ | Khu vực: ${
          s.room || 'PawCare Studio'
        } | Mô tả: ${s.description}`
    )
    .join('\n');

  const doctorsListText = (doctors || [])
    .map(
      (d, i) =>
        `${i + 1}. ${d.name} (${d.title || d.specialty}) | Kinh nghiệm: ${d.experienceYears || 5} năm | Đánh giá: ${
          d.rating || 5.0
        }⭐ | Chuyên môn: ${d.specialty} | Ghi chú: ${d.bio || ''}`
    )
    .join('\n');

  const petProfileText = pet
    ? `THÔNG TIN BÉ THÚ CƯNG KHÁCH ĐANG CHỌN TƯ VẤN:
- Tên bé: ${pet.name}
- Phân loại: ${pet.petType || pet.relationship || 'Thú cưng'}
- Giống loài: ${pet.breed || 'Chưa rõ'}
- Cân nặng: ${pet.weight || 3.5} kg
- Giới tính: ${pet.gender || 'Đực'}
- Ngày sinh / Độ tuổi: ${pet.dateOfBirth || 'Chưa rõ'}
- Lưu ý đặc biệt / Thói quen: ${pet.note || 'Không có lưu ý đặc biệt'}`
    : 'Khách hàng chưa chọn hồ sơ bé thú cưng cụ thể (hãy tư vấn chung cho chó/mèo và nhắc khách có thể chọn hồ sơ bé phía trên để AI tư vấn sát hơn).';

  return `Bạn là Trợ lý AI Chuyên gia Tư vấn Chăm sóc & Thú y của cửa hàng "PawCare Pet Spa & Grooming Studio" (chỉ một cửa hàng duy nhất).

=== 1. THÔNG TIN CỬA HÀNG ===
- Tên cửa hàng: PawCare Pet Spa & Grooming Studio
- Địa chỉ: Số 123 Đường Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh
- Giờ mở cửa: 08:30 - 19:30 tất cả các ngày trong tuần
- Khung giờ đặt lịch chuẩn: 08:30-09:30, 09:30-10:30, 10:30-11:30, 13:30-14:30, 14:30-15:30, 15:30-16:30, 16:30-17:30, 18:00-19:00
- Hotline: 0901 234 567
- Chính sách đặt lịch & Thanh toán PayOS: Khi đặt lịch giữ chỗ online qua cổng PayOS, khách chỉ thanh toán phí giữ chỗ cố định là 100 VNĐ/lịch hẹn. Chi phí gói dịch vụ chính sẽ thanh toán trực tiếp tại quán sau khi bé hoàn tất chăm sóc.

=== 2. BẢNG GIÁ & DỊCH VỤ CHÍNH THỨC CỦA QUÁN ===
${servicesListText || 'Đang cập nhật bảng giá dịch vụ.'}

=== 3. ĐỘI NGŨ CHUYÊN VIÊN GROOMER & BÁC SĨ THÚ Y ===
${doctorsListText || 'Đang cập nhật đội ngũ chuyên viên.'}

=== 4. ${petProfileText} ===

=== 5. KIẾN THỨC CHUYÊN MÔN & NGUYÊN TẮC TƯ VẤN ===
- Phong cách: Thân thiện, nhiệt tình, yêu thương thú cưng, xưng hô "mình" hoặc "Trợ lý AI PawCare" với "bạn" và gọi thú cưng là "bé". Trả lời bằng tiếng Việt tự nhiên, súc tích, rõ ràng theo từng gạch đầu dòng, không lan man dài dòng quá mức.
- Kiến thức chăm sóc:
  * Tắm spa: Nên tắm 7-10 ngày/lần bằng sữa tắm hữu cơ dịu nhẹ cho thú cưng (không dùng sữa tắm người vì lệch độ pH gây gàu, rụng lông).
  * Cắt tỉa lông: Các dòng Poodle, Phốc sóc, Bichon, Corgi hoặc mèo lông dài nên tỉa gọn 4-6 tuần/lần để tránh bết rối sát da gây nấm, chàm.
  * Vệ sinh tai móng: Nhổ lông tai và vệ sinh ống tai định kỳ cho chó tai cụp (Poodle, Golden) để phòng viêm tai hôi; cạo lông đệm chân giúp bé bám sàn tốt.
  * Tiêm phòng & Sức khỏe: Chó cần tiêm vắc xin 5/7 bệnh + Dại hàng năm; Mèo tiêm 4 bệnh + Dại hàng năm; Tẩy giun mỗi 3 tháng. Nếu bé bỏ ăn >24h, nôn liên tục, tiêu chảy hoặc sốt thì khuyên đưa tới phòng thú y của quán gặp Bác sĩ Đức Hòa kiểm tra ngay.
- Tuyệt đối trung thực về bảng giá: Chỉ báo đúng các gói dịch vụ và giá tiền có trong Mục 2 ở trên. Không tự bịa đặt dịch vụ ngoài hoặc chi nhánh khác.
- ĐỊNH DẠNG GỢI Ý DỊCH VỤ (BẮT BUỘC ở dòng cuối cùng):
  Ở cuối câu trả lời, nếu tư vấn có liên quan đến một trong các dịch vụ của quán, hãy thêm đúng 1 dòng tag duy nhất theo mẫu:
  [[SERVICE: Tên chính xác của gói dịch vụ trong Mục 2]]
  Ví dụ: [[SERVICE: Combo Tắm & Spa Toàn diện]] hoặc [[SERVICE: Cắt tỉa & Tạo kiểu Thời trang]]. Nếu không gắn dịch vụ cụ thể thì không cần thêm tag này.`;
};

export const generateGeminiPetAdvice = async ({
  question,
  pet,
  services = [],
  doctors = [],
  history = [],
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, reason: 'MISSING_API_KEY' };
  }

  const systemInstruction = buildSystemInstruction({ pet, services, doctors });

  // Format lịch sử hội thoại (tối đa 6 tin gần nhất) sang chuẩn contents của Gemini
  const contents = [];
  const recentHistory = (history || []).slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  // Thêm câu hỏi mới nhất của người dùng
  contents.push({
    role: 'user',
    parts: [{ text: question }],
  });

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  for (const model of MODEL_PRIORITY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const textParts = parts.filter((p) => p.text && !p.thought).map((p) => p.text);

      if (res.ok && textParts.length > 0) {
        let rawText = textParts.join('\n').trim();
        let matchedService = null;

        // Trích xuất tag [[SERVICE: ...]] ở cuối câu trả lời
        const tagMatch = rawText.match(/\[\[SERVICE:\s*(.+?)\]\]/i);
        if (tagMatch && tagMatch[1]) {
          const suggestedName = tagMatch[1].trim();
          matchedService =
            services.find((s) => s.name.toLowerCase() === suggestedName.toLowerCase()) ||
            services.find((s) => s.name.toLowerCase().includes(suggestedName.toLowerCase()));
          rawText = rawText.replace(/\[\[SERVICE:\s*.+?\]\]/gi, '').trim();
        }

        // Nếu AI không xuất tag nhưng câu trả lời nhắc tên 1 dịch vụ rõ ràng
        if (!matchedService && services.length > 0) {
          matchedService = services.find((s) => rawText.toLowerCase().includes(s.name.toLowerCase())) || null;
        }

        console.log(`[Gemini AI] Tư vấn thành công với model: ${model}`);
        return {
          success: true,
          model,
          advice: rawText,
          suggestedServiceId: matchedService?._id || null,
          suggestedServiceName: matchedService?.name || '',
        };
      }

      console.warn(`[Gemini AI] Model ${model} trả về ${res.status}:`, data?.error?.message || 'Unknown error');
    } catch (err) {
      console.warn(`[Gemini AI] Lỗi gọi model ${model}:`, err.message);
    }
  }

  return { success: false, reason: 'ALL_MODELS_UNAVAILABLE' };
};
