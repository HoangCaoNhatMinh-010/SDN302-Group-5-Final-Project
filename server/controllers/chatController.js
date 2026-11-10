import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { Doctor } from '../models/Doctor.js';
import { Specialty } from '../models/Specialty.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { generateGeminiPetAdvice } from '../utils/geminiAi.js';

/**
 * Helper tạo câu trả lời thông minh cho AI Tư vấn Chăm sóc Thú Cưng
 */
const buildAiAdvice = ({ question, pet, services }) => {
  const q = (question || '').toLowerCase();
  const petIntro = pet
    ? `Dựa trên hồ sơ bé **${pet.name}** (${pet.petType || 'Thú cưng'} - ${pet.breed || 'Chưa rõ giống'}, nặng ${pet.weight || 3.5} kg${
        pet.note ? `, lưu ý: "${pet.note}"` : ''
      }), Trợ lý AI PawCare xin tư vấn cho bạn:\n\n`
    : 'Trợ lý AI PawCare xin tư vấn chi tiết cho bé thú cưng của bạn:\n\n';

  let advice = '';
  let matchedService = null;

  const findService = (keyword) =>
    services.find((s) => s.name.toLowerCase().includes(keyword.toLowerCase())) || services[0];

  if (q.includes('giá') || q.includes('bảng giá') || q.includes('bao nhiêu') || q.includes('phí') || q.includes('payos')) {
    const priceList = services
      .map((s) => `• **${s.name}**: ${s.price.toLocaleString('vi-VN')} đ (${s.description})`)
      .join('\n');
    advice =
      `${petIntro}📋 **Bảng giá niêm yết tại PawCare Studio:**\n${priceList}\n\n` +
      `💳 **Phí đặt lịch giữ chỗ qua PayOS:** Cố định chỉ **100 đ / lịch hẹn** (tiền dịch vụ chính bạn thanh toán trực tiếp tại cửa hàng sau khi bé làm xong).`;
    matchedService = findService('Combo');
  } else if (
    q.includes('tiêm') ||
    q.includes('vắc xin') ||
    q.includes('vaccine') ||
    q.includes('khám') ||
    q.includes('bệnh') ||
    q.includes('bỏ ăn') ||
    q.includes('nôn') ||
    q.includes('tiêu chảy') ||
    q.includes('sổ mũi') ||
    q.includes('giun')
  ) {
    matchedService = findService('Khám sức khỏe');
    const isCat = pet && (pet.petType === 'Mèo' || pet.relationship === 'Mèo');
    advice =
      `${petIntro}🩺 **Tư vấn Sức khỏe & Tiêm phòng Thú y:**\n` +
      (isCat
        ? `• **Với mèo:** Cần tiêm đủ 3 mũi vắc xin 4 bệnh (giảm bạch cầu, hô hấp...) từ 8 tuần tuổi và nhắc lại hàng năm, kèm tiêm phòng Dại & tẩy giun 3 tháng/lần.\n`
        : `• **Với chó:** Cần tiêm đủ phác đồ vắc xin 5 hoặc 7 bệnh (Care, Parvo, Viêm gan, Lepto...) và phòng Dại định kỳ mỗi năm 1 lần, tẩy giun mỗi 3 tháng.\n`) +
      `• **Lưu ý triệu chứng:** Nếu bé có dấu hiệu bỏ ăn quá 24h, nôn ói liên tục hoặc tiêu chảy, bạn nên đặt lịch khám ngay để **Bác sĩ Thú y Đức Hòa** kiểm tra lâm sàng.\n\n` +
      `👉 **Gợi ý dịch vụ phù hợp:** *${matchedService?.name || 'Khám sức khỏe & Tiêm phòng Thú y'}* (${(
        matchedService?.price || 250000
      ).toLocaleString('vi-VN')} đ).`;
  } else if (
    q.includes('cắt') ||
    q.includes('tỉa') ||
    q.includes('kiểu') ||
    q.includes('teddy') ||
    q.includes('cạo') ||
    q.includes('lông dài') ||
    q.includes('rối')
  ) {
    matchedService = findService('Cắt tỉa');
    advice =
      `${petIntro}✂️ **Tư vấn Cắt tỉa & Tạo kiểu Thời trang:**\n` +
      `• Với các dòng lông xoăn/dài (như Poodle, Phốc Sóc, Corgi hoặc Mèo lông dài), nên cắt tỉa tạo form mỗi **4 - 6 tuần/lần** để tránh bết rối sát da gây nấm.\n` +
      `• Kiểu **Gấu Teddy tròn mặt** hoặc **Búp bê Hàn Quốc** giúp bé gọn gàng, thoáng mát và cực kỳ đáng yêu.\n` +
      `• Chuyên viên **Mai Anh (Master Groomer)** sẽ kiểm tra chất lông trước khi cắt và bảo hành form dáng 48h.\n\n` +
      `👉 **Gợi ý dịch vụ phù hợp:** *${matchedService?.name || 'Cắt tỉa & Tạo kiểu Thời trang'}* (${(
        matchedService?.price || 280000
      ).toLocaleString('vi-VN')} đ).`;
  } else if (
    q.includes('tai') ||
    q.includes('móng') ||
    q.includes('răng') ||
    q.includes('hôi miệng') ||
    q.includes('vệ sinh')
  ) {
    matchedService = findService('Vệ sinh');
    advice =
      `${petIntro}🧴 **Tư vấn Vệ sinh chuyên sâu Tai - Móng - Kẽ chân:**\n` +
      `• Lông trong ống tai mọc rậm dễ giữ ẩm gây **viêm tai và mùi hôi**, đặc biệt ở chó tai cụp (Poodle, Golden). Cần nhổ lông tai định kỳ mỗi 3-4 tuần.\n` +
      `• Móng quá dài sẽ làm bé đau đệm thịt và biến dạng bước đi; cạo lông đệm bàn chân giúp bé đi không bị trơn trượt trên sàn gạch.\n\n` +
      `👉 **Gợi ý dịch vụ phù hợp:** *${matchedService?.name || 'Vệ sinh chuyên sâu & Nhổ lông tai'}* (${(
        matchedService?.price || 120000
      ).toLocaleString('vi-VN')} đ).`;
  } else if (
    q.includes('gửi') ||
    q.includes('khách sạn') ||
    q.includes('lưu trú') ||
    q.includes('du lịch') ||
    q.includes('công tác')
  ) {
    matchedService = findService('Khách sạn');
    advice =
      `${petIntro}🏠 **Tư vấn Dịch vụ Khách sạn & Lưu trú Thú Cưng:**\n` +
      `• Khu **Pet Hotel VIP** tại PawCare có phòng riêng điều hòa 24/7, khử khuẩn hằng ngày và camera gửi video cập nhật bé 2 lần/ngày.\n` +
      `• Bé được ăn 2-3 bữa chuẩn dinh dưỡng (hạt cao cấp + pate) và có nhân viên dắt đi dạo vận động.\n\n` +
      `👉 **Gợi ý dịch vụ phù hợp:** *${matchedService?.name || 'Khách sạn Thú cưng / Lưu trú'}* (${(
        matchedService?.price || 200000
      ).toLocaleString('vi-VN')} đ/ngày).`;
  } else if (
    q.includes('tắm') ||
    q.includes('spa') ||
    q.includes('rụng lông') ||
    q.includes('hôi') ||
    q.includes('sữa tắm') ||
    q.includes('dị ứng')
  ) {
    matchedService = findService('Combo Tắm');
    advice =
      `${petIntro}🛁 **Tư vấn Tắm Spa & Giảm rụng lông:**\n` +
      `• Tần suất tắm lý tưởng là **7 - 10 ngày/lần** (không nên tắm quá dày làm mất lớp dầu tự nhiên bảo vệ da, dễ gây gàu và rụng lông).\n` +
      `• Tại PawCare Studio, 100% sử dụng **sữa tắm hữu cơ dịu nhẹ**, kết hợp vắt tuyến hôi, sấy ion âm giảm xơ rối và chải xả lông chết.\n\n` +
      `👉 **Gợi ý dịch vụ phù hợp:** *${matchedService?.name || 'Combo Tắm & Spa Toàn diện'}* (${(
        matchedService?.price || 180000
      ).toLocaleString('vi-VN')} đ).`;
  } else {
    matchedService = findService('Combo Tắm');
    advice =
      `${petIntro}✨ **Lời khuyên chăm sóc toàn diện cho bé:**\n` +
      `1. **Vệ sinh & Da lông:** Nên tắm spa định kỳ 1-2 tuần/lần bằng sữa tắm chuyên dụng cho thú cưng và chải lông mỗi ngày để kích thích tuần hoàn máu.\n` +
      `2. **Dinh dưỡng:** Cung cấp đủ nước sạch, hạn chế đồ ăn mặn/nhiều gia vị của người để tránh rụng lông và sỏi thận.\n` +
      `3. **Sức khỏe:** Theo dõi lịch tẩy giun (3 tháng/lần) và tiêm phòng định kỳ hàng năm.\n\n` +
      `Bạn có thể hỏi chi tiết hơn về *tắm spa, cắt tỉa kiểu Teddy, giảm rụng lông, lịch tiêm phòng, hoặc bảng giá*, mình sẽ tư vấn ngay nhé! 🐾`;
  }

  return {
    advice,
    suggestedServiceId: matchedService?._id || null,
    suggestedServiceName: matchedService?.name || '',
  };
};

/**
 * @desc   Lấy danh sách kênh chat (AI, Quán, từng Nhân viên)
 * @route  GET /api/v1/chat/contacts
 * @access Private
 */
export const getChatContacts = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const doctors = await Doctor.find();

    const lastAiMsg = await Message.findOne({ userId, channelType: 'AI' }).sort({ createdAt: -1 });
    const lastStoreMsg = await Message.findOne({ userId, channelType: 'STORE' }).sort({ createdAt: -1 });

    const staffContacts = await Promise.all(
      doctors.map(async (doc) => {
        const lastMsg = await Message.findOne({
          userId,
          channelType: 'STAFF',
          staffId: doc._id,
        }).sort({ createdAt: -1 });

        return {
          key: `STAFF_${doc._id}`,
          channelType: 'STAFF',
          staffId: doc._id.toString(),
          name: doc.name,
          roleTitle: doc.title || doc.specialty,
          avatar: doc.avatar,
          online: true,
          lastMessage: lastMsg ? lastMsg.content : `Nhắn tin trao đổi trực tiếp với ${doc.name}`,
          lastTime: lastMsg ? lastMsg.createdAt : null,
        };
      })
    );

    const contacts = [
      {
        key: 'AI',
        channelType: 'AI',
        staffId: null,
        name: 'Trợ lý AI Tư vấn Thú Cưng',
        roleTitle: 'AI Chuyên gia Spa & Thú Y 24/7',
        avatar: null,
        online: true,
        lastMessage: lastAiMsg
          ? lastAiMsg.content
          : 'Hỏi AI về cách chăm sóc, dinh dưỡng, lịch tiêm & chọn gói Spa!',
        lastTime: lastAiMsg ? lastAiMsg.createdAt : null,
      },
      {
        key: 'STORE',
        channelType: 'STORE',
        staffId: null,
        name: 'Quán PawCare Studio',
        roleTitle: 'Quầy tiếp đón & Hỗ trợ đặt lịch (0901 234 567)',
        avatar: null,
        online: true,
        lastMessage: lastStoreMsg
          ? lastStoreMsg.content
          : 'Xin chào! Quán PawCare sẵn sàng hỗ trợ bạn đặt lịch và đưa đón bé.',
        lastTime: lastStoreMsg ? lastStoreMsg.createdAt : null,
      },
      ...staffContacts,
    ];

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy lịch sử tin nhắn theo kênh
 * @route  GET /api/v1/chat/messages
 * @access Private
 */
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { channelType = 'STORE', staffId = null } = req.query;

    const query = { userId, channelType };
    if (channelType === 'STAFF' && staffId && mongoose.Types.ObjectId.isValid(staffId)) {
      query.staffId = staffId;
    }

    let messages = await Message.find(query).sort({ createdAt: 1 });

    // Nếu chưa có tin nhắn nào, tạo tin nhắn chào mừng đầu tiên
    if (messages.length === 0) {
      let welcomeSender = 'STAFF';
      let welcomeName = 'Quán PawCare Studio';
      let welcomeContent =
        'Xin chào bạn! 🐾 Quán PawCare Studio rất vui được đồng hành cùng bạn và các bé thú cưng. Bạn cần tư vấn lịch trống, dịch vụ Spa hay hỗ trợ đưa đón bé cứ nhắn cho quán nhé!';

      if (channelType === 'AI') {
        welcomeSender = 'AI';
        welcomeName = 'Trợ lý AI PawCare';
        welcomeContent =
          'Xin chào! Mình là **Trợ lý AI Tư vấn Thú Cưng** của PawCare Studio 🤖🐾.\n\nBạn có thể chọn hồ sơ bé cưng ở phía trên để mình tư vấn chính xác theo giống loài & cân nặng, hoặc hỏi mình bất kỳ điều gì về: tắm spa, cắt tỉa lông, rụng lông, tiêm phòng hay bảng giá dịch vụ nhé!';
      } else if (channelType === 'STAFF' && staffId && mongoose.Types.ObjectId.isValid(staffId)) {
        const doc = await Doctor.findById(staffId);
        if (doc) {
          welcomeName = doc.name;
          welcomeContent = `Chào bạn, mình là **${doc.name}** (${doc.title || doc.specialty}) tại PawCare Studio. Bạn muốn trao đổi về tình trạng lông, da hay kiểu cắt tỉa cho bé nhà mình cứ nhắn cho mình nhé!`;
        }
      }

      const greetingMsg = await Message.create({
        userId,
        channelType,
        staffId: channelType === 'STAFF' && staffId && mongoose.Types.ObjectId.isValid(staffId) ? staffId : null,
        sender: welcomeSender,
        senderName: welcomeName,
        content: welcomeContent,
      });
      messages = [greetingMsg];
    }

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Khách hàng gửi tin nhắn tới Quán hoặc Nhân viên
 * @route  POST /api/v1/chat/messages
 * @access Private
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { channelType = 'STORE', staffId = null, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung tin nhắn' });
    }

    const validStaffId =
      channelType === 'STAFF' && staffId && mongoose.Types.ObjectId.isValid(staffId) ? staffId : null;

    const userMsg = await Message.create({
      userId,
      channelType,
      staffId: validStaffId,
      sender: 'USER',
      senderName: req.user.name || 'Khách hàng',
      content: content.trim(),
    });

    // Tự động tạo phản hồi xác nhận từ Quán hoặc Nhân viên
    let replyName = 'Quán PawCare Studio';
    let replyText = '';

    if (channelType === 'STAFF' && validStaffId) {
      const staff = await Doctor.findById(validStaffId);
      replyName = staff ? staff.name : 'Chuyên viên PawCare';
      replyText = `Cảm ơn bạn đã nhắn tin! ${replyName} đã nhận được thông tin về bé cưng và sẽ lưu ý kỹ khi chăm sóc bé. Nếu bạn cần giữ khung giờ đẹp hôm nay, bạn có thể đặt lịch ngay trên hệ thống nhé! 🐾`;
    } else {
      const lower = content.toLowerCase();
      if (lower.includes('giá') || lower.includes('bao nhiêu')) {
        replyText =
          'Dạ chào bạn! Giá dịch vụ tại quán từ 120.000đ - 280.000đ tùy gói, phí đặt lịch giữ chỗ qua PayOS cố định chỉ 100đ ạ. Quán mở cửa từ 08:30 - 19:30 hàng ngày!';
      } else if (lower.includes('địa chỉ') || lower.includes('ở đâu')) {
        replyText =
          'Dạ địa chỉ cửa hàng PawCare Studio ở Số 123 Đường Nguyễn Thị Minh Khai, Quận 1, TP.HCM ạ. Có chỗ đậu xe thoải mái cho bạn đưa đón bé!';
      } else {
        replyText =
          'Quán PawCare Studio đã tiếp nhận tin nhắn của bạn! Nhân viên quầy lễ tân sẽ phản hồi chi tiết trong ít phút. Hoặc bạn có thể gọi hotline 0901 234 567 để được hỗ trợ ngay nhé 🐾.';
      }
    }

    const replyMsg = await Message.create({
      userId,
      channelType,
      staffId: validStaffId,
      sender: 'STAFF',
      senderName: replyName,
      content: replyText,
    });

    return res.status(201).json({
      success: true,
      data: {
        userMessage: userMsg,
        replyMessage: replyMsg,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Hỏi Trợ lý AI Tư vấn Chăm sóc Thú Cưng
 * @route  POST /api/v1/chat/ai-consult
 * @access Private
 */
export const askAiConsultant = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { question, petId = null } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập câu hỏi cần AI tư vấn' });
    }

    let pet = null;
    if (petId && mongoose.Types.ObjectId.isValid(petId)) {
      pet = await FamilyMember.findOne({ _id: petId, patientId: userId });
    }

    const [services, doctors, recentHistoryDesc] = await Promise.all([
      Specialty.find(),
      Doctor.find(),
      Message.find({ userId, channelType: 'AI' }).sort({ createdAt: -1 }).limit(6),
    ]);
    const recentHistory = recentHistoryDesc.reverse();

    const userMsg = await Message.create({
      userId,
      channelType: 'AI',
      sender: 'USER',
      senderName: req.user.name || 'Khách hàng',
      content: pet ? `[Hỏi cho bé ${pet.name}] ${question.trim()}` : question.trim(),
    });

    // Ưu tiên gọi Google Gemini AI đã được huấn luyện dữ liệu cửa hàng
    const geminiResult = await generateGeminiPetAdvice({
      question: question.trim(),
      pet,
      services,
      doctors,
      history: recentHistory,
    });

    let advice;
    let suggestedServiceId;
    let suggestedServiceName;

    if (geminiResult.success) {
      advice = geminiResult.advice;
      suggestedServiceId = geminiResult.suggestedServiceId;
      suggestedServiceName = geminiResult.suggestedServiceName;
    } else {
      const fallback = buildAiAdvice({
        question,
        pet,
        services,
      });
      advice = fallback.advice;
      suggestedServiceId = fallback.suggestedServiceId;
      suggestedServiceName = fallback.suggestedServiceName;
    }

    const aiMsg = await Message.create({
      userId,
      channelType: 'AI',
      sender: 'AI',
      senderName: geminiResult.success ? `Trợ lý AI Gemini` : 'Trợ lý AI PawCare',
      content: advice,
      suggestedServiceId,
      suggestedServiceName,
    });

    return res.status(201).json({
      success: true,
      aiSource: geminiResult.success ? geminiResult.model : 'local_fallback',
      data: {
        userMessage: userMsg,
        aiMessage: aiMsg,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

