import { FamilyMember } from '../models/FamilyMember.js';

/**
 * @desc   Lấy danh sách người thân của bệnh nhân
 * @route  GET /api/v1/family-members
 * @access Private (Patient)
 */
export const getFamilyMembers = async (req, res) => {
  try {
    const patientId = req.user.id;
    const members = await FamilyMember.find({ patientId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy chi tiết một người thân
 * @route  GET /api/v1/family-members/:id
 * @access Private
 */
export const getFamilyMemberById = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      patientId: req.user.id,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người thân' });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Thêm mới hồ sơ người thân
 * @route  POST /api/v1/family-members
 * @access Private
 */
export const createFamilyMember = async (req, res) => {
  try {
    const { name, relationship, dateOfBirth, gender, phone, address, idCard, note } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập họ và tên người thân' });
    }
    if (!relationship) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn mối quan hệ' });
    }
    if (!dateOfBirth) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập ngày sinh' });
    }
    if (!gender) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn giới tính' });
    }

    const newMember = await FamilyMember.create({
      patientId: req.user.id,
      name: name.trim(),
      relationship,
      dateOfBirth,
      gender,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      idCard: idCard ? idCard.trim() : '',
      note: note ? note.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: `Đã thêm hồ sơ người thân "${newMember.name}" thành công!`,
      data: newMember,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Cập nhật hồ sơ người thân
 * @route  PUT /api/v1/family-members/:id
 * @access Private
 */
export const updateFamilyMember = async (req, res) => {
  try {
    const { name, relationship, dateOfBirth, gender, phone, address, idCard, note } = req.body;

    const member = await FamilyMember.findOne({
      _id: req.params.id,
      patientId: req.user.id,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Hồ sơ người thân không tồn tại' });
    }

    if (name) member.name = name.trim();
    if (relationship) member.relationship = relationship;
    if (dateOfBirth) member.dateOfBirth = dateOfBirth;
    if (gender) member.gender = gender;
    if (phone !== undefined) member.phone = phone.trim();
    if (address !== undefined) member.address = address.trim();
    if (idCard !== undefined) member.idCard = idCard.trim();
    if (note !== undefined) member.note = note.trim();

    await member.save();

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật hồ sơ người thân "${member.name}" thành công!`,
      data: member,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Xóa hồ sơ người thân
 * @route  DELETE /api/v1/family-members/:id
 * @access Private
 */
export const deleteFamilyMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user.id,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Hồ sơ người thân không tồn tại' });
    }

    return res.status(200).json({
      success: true,
      message: `Đã xóa hồ sơ người thân "${member.name}" thành công!`,
      data: { id: req.params.id },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

