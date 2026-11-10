import Owner from '../models/Owner.js';

const identityConflict = () => {
  const error = new Error('Email và số điện thoại thuộc các hồ sơ chủ thú cưng khác nhau. Vui lòng liên hệ cửa hàng để xác minh.');
  error.statusCode = 409;
  return error;
};

export const findOwnerForIdentity = async ({ email, phone }) => {
  const [byEmail, byPhone] = await Promise.all([
    email ? Owner.findOne({ email: email.trim().toLowerCase() }) : null,
    phone ? Owner.findOne({ phone: phone.trim().replace(/\s+/g, '') }) : null,
  ]);

  if (byEmail && byPhone && !byEmail._id.equals(byPhone._id)) {
    throw identityConflict();
  }

  const owner = byEmail || byPhone;
  if (owner && (!owner.is_active || owner.deleted_at)) {
    const error = new Error('Hồ sơ chủ thú cưng đã bị vô hiệu hóa.');
    error.statusCode = 403;
    throw error;
  }
  return owner;
};

export const resolveOwner = async (user) => {
  if (user.ownerLinkStatus === 'PENDING') {
    const error = new Error('Tài khoản đang chờ cửa hàng xác minh và liên kết hồ sơ chủ thú cưng.');
    error.statusCode = 403;
    throw error;
  }
  if (user.ownerId) {
    const linkedOwner = await Owner.findById(user.ownerId);
    if (!linkedOwner || !linkedOwner.is_active || linkedOwner.deleted_at) {
      const error = new Error('Hồ sơ chủ thú cưng đã bị vô hiệu hóa.');
      error.statusCode = 403;
      throw error;
    }
    if (user.ownerLinkStatus !== 'LINKED') {
      user.ownerLinkStatus = 'LINKED';
      await user.save();
    }
    return linkedOwner;
  }

  const matchingOwner = await findOwnerForIdentity(user);
  if (matchingOwner) {
    const error = new Error('Hồ sơ đã tồn tại và cần được cửa hàng xác minh trước khi liên kết.');
    error.statusCode = 403;
    throw error;
  }

  if (!user.phone?.trim()) {
    throw new Error('Cần có số điện thoại để tạo hồ sơ chủ thú cưng.');
  }
  const owner = await Owner.create({
    full_name: user.name,
    email: user.email,
    phone: user.phone.trim().replace(/\s+/g, ''),
    is_active: true,
  });
  user.ownerId = owner._id;
  user.ownerLinkStatus = 'LINKED';
  await user.save();
  return owner;
};
