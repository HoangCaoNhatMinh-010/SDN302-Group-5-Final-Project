import mongoose from 'mongoose';
import { FamilyMember } from '../models/FamilyMember.js';

/**
 * @desc   Lấy danh sách thú cưng của khách hàng
 * @route  GET /api/v1/family-members
 * @access Private (Patient)
 */
export const getFamilyMembers = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    const members = await FamilyMember.find({ patientId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy chi tiết một bé thú cưng
 * @route  GET /api/v1/family-members/:id
 * @access Private
 */
export const getFamilyMemberById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID thú cưng không hợp lệ' });
    }

    const member = await FamilyMember.findOne({
      _id: req.params.id,
      patientId: req.user.id || req.user._id,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin bé thú cưng' });
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
 * @desc   Thêm mới hồ sơ thú cưng
 * @route  POST /api/v1/family-members
 * @access Private
 */
export const createFamilyMember = async (req, res) => {
  try {
    const {
      name,
      relationship = 'Chó',
      petType = 'Chó',
      breed = 'Chưa rõ',
      weight = 3.5,
      dateOfBirth,
      gender = 'Đực',
      phone,
      address,
      idCard,
      note,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên bé thú cưng' });
    }
    if (!dateOfBirth) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập ngày sinh hoặc tuổi của bé' });
    }

    const newMember = await FamilyMember.create({
      patientId: req.user.id || req.user._id,
      name: name.trim(),
      relationship: petType || relationship || 'Chó',
      petType: petType || relationship || 'Chó',
      breed: breed ? breed.trim() : 'Chưa rõ',
      weight: parseFloat(weight) || 3.5,
      dateOfBirth: dateOfBirth.trim(),
      gender: gender || 'Đực',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      idCard: idCard ? idCard.trim() : '',
      note: note ? note.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: `Đã thêm hồ sơ bé "${newMember.name}" thành công! 🐾`,
      data: newMember,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Cập nhật hồ sơ thú cưng
 * @route  PUT /api/v1/family-members/:id
 * @access Private
 */
export const updateFamilyMember = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID thú cưng không hợp lệ' });
    }

    const {
      name,
      relationship,
      petType,
      breed,
      weight,
      dateOfBirth,
      gender,
      phone,
      address,
      idCard,
      note,
    } = req.body;

    const member = await FamilyMember.findOne({
      _id: req.params.id,
      patientId: req.user.id || req.user._id,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Hồ sơ thú cưng không tồn tại' });
    }

    if (name) member.name = name.trim();
    if (relationship) member.relationship = relationship;
    if (petType) member.petType = petType;
    if (breed !== undefined) member.breed = breed.trim();
    if (weight !== undefined) member.weight = parseFloat(weight) || 3.5;
    if (dateOfBirth) member.dateOfBirth = dateOfBirth.trim();
    if (gender) member.gender = gender;
    if (phone !== undefined) member.phone = phone.trim();
    if (address !== undefined) member.address = address.trim();
    if (idCard !== undefined) member.idCard = idCard.trim();
    if (note !== undefined) member.note = note.trim();

    await member.save();

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật hồ sơ bé "${member.name}" thành công!`,
      data: member,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Xóa hồ sơ thú cưng
 * @route  DELETE /api/v1/family-members/:id
 * @access Private
 */
export const deleteFamilyMember = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID thú cưng không hợp lệ' });
    }

    const member = await FamilyMember.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user.id || req.user._id,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Hồ sơ thú cưng không tồn tại' });
    }

    return res.status(200).json({
      success: true,
      message: `Đã xóa hồ sơ bé "${member.name}" thành công!`,
      data: { id: req.params.id },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
