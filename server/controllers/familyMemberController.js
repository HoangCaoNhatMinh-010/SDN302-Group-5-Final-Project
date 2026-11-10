import mongoose from 'mongoose';
import { FamilyMember } from '../models/FamilyMember.js';
import { resolveOwner } from '../utils/resolveOwner.js';

const SPECIES = { 'Chó': 'dog', 'Mèo': 'cat', 'Khác': 'rabbit', dog: 'dog', cat: 'cat', rabbit: 'rabbit' };
const GENDERS = { 'Đực': 'male', 'Cái': 'female', male: 'male', female: 'female', unknown: 'unknown' };

const parseDate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const text = String(value).trim();
  const dmy = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const date = dmy
    ? new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])))
    : new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parsePetPayload = (body, existing = null) => {
  const speciesInput = body.petType || body.relationship || existing?.species || 'Chó';
  const species = SPECIES[speciesInput];
  if (!species) throw new Error('Loài thú cưng không hợp lệ.');

  const birthValue = body.dateOfBirth ?? existing?.birth_date;
  const birthDate = parseDate(birthValue);
  if (!birthDate) throw new Error('Ngày sinh hoặc tuổi của thú cưng không hợp lệ.');

  const weight = body.weight === undefined ? existing?.weight_kg : Number(body.weight);
  if (weight !== undefined && (!Number.isFinite(weight) || weight < 0 || weight > 200)) {
    throw new Error('Cân nặng phải nằm trong khoảng 0 đến 200 kg.');
  }

  return {
    ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
    species,
    ...(body.breed !== undefined ? { breed: String(body.breed).trim() || 'Unknown' } : {}),
    birth_date: birthDate,
    ...(body.gender !== undefined ? { gender: GENDERS[body.gender] || 'unknown' } : {}),
    ...(weight !== undefined ? { weight_kg: weight } : {}),
    ...(body.idCard !== undefined ? { pet_tag: String(body.idCard).trim() } : {}),
    ...(body.note !== undefined ? { special_notes: String(body.note).trim() } : {}),
    ...(body.isNeutered !== undefined ? { is_neutered: Boolean(body.isNeutered) } : {}),
  };
};

export const getFamilyMembers = async (req, res) => {
  try {
    const owner = await resolveOwner(req.user);
    const members = await FamilyMember.find({
      owner_id: owner._id,
      is_active: true,
      deleted_at: null,
    }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getFamilyMemberById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID thú cưng không hợp lệ' });
    }
    const owner = await resolveOwner(req.user);
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      owner_id: owner._id,
      is_active: true,
      deleted_at: null,
    });
    if (!member) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ thú cưng' });
    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const createFamilyMember = async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!name) return res.status(400).json({ success: false, message: 'Vui lòng nhập tên thú cưng' });
    const owner = await resolveOwner(req.user);
    const pet = await FamilyMember.create({
      owner_id: owner._id,
      name,
      ...parsePetPayload(req.body),
    });
    return res.status(201).json({
      success: true,
      message: `Đã thêm hồ sơ bé "${pet.name}" thành công! 🐾`,
      data: pet,
    });
  } catch (error) {
    return res.status(error.statusCode || (error.message.includes('không hợp lệ') ? 400 : 500)).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateFamilyMember = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID thú cưng không hợp lệ' });
    }
    const owner = await resolveOwner(req.user);
    const pet = await FamilyMember.findOne({
      _id: req.params.id,
      owner_id: owner._id,
      is_active: true,
      deleted_at: null,
    });
    if (!pet) return res.status(404).json({ success: false, message: 'Hồ sơ thú cưng không tồn tại' });

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
        return res.status(400).json({ success: false, message: 'Tên thú cưng không được để trống' });
      }
    }
    Object.assign(pet, parsePetPayload(req.body, pet));
    await pet.save();
    return res.status(200).json({ success: true, message: 'Đã cập nhật hồ sơ thú cưng.', data: pet });
  } catch (error) {
    return res.status(error.statusCode || (error.message.includes('không hợp lệ') || error.message.includes('Cân nặng') ? 400 : 500)).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteFamilyMember = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID thú cưng không hợp lệ' });
    }
    const owner = await resolveOwner(req.user);
    const pet = await FamilyMember.findOne({
      _id: req.params.id,
      owner_id: owner._id,
      is_active: true,
      deleted_at: null,
    });
    if (!pet) return res.status(404).json({ success: false, message: 'Hồ sơ thú cưng không tồn tại' });
    pet.is_active = false;
    pet.deleted_at = new Date();
    await pet.save();
    return res.status(200).json({
      success: true,
      message: `Đã lưu trữ hồ sơ bé "${pet.name}".`,
      data: { id: req.params.id },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
