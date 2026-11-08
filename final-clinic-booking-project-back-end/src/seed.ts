import mongoose from "mongoose";
import { env } from "./config/env";
import { Service } from "./models/Service";
import { Specialty } from "./models/Specialty";
import { User } from "./models/User";

async function seed(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  const specialtyNames = [
    { name: "Nội tổng quát", description: "Khám và tư vấn sức khỏe tổng quát." },
    { name: "Nhi khoa", description: "Chăm sóc sức khỏe trẻ em." },
    { name: "Tim mạch", description: "Khám và điều trị bệnh lý tim mạch." },
    { name: "Da liễu", description: "Khám và điều trị bệnh lý da." },
  ];
  for (const specialty of specialtyNames) {
    await Specialty.updateOne({ name: specialty.name }, { $setOnInsert: specialty }, { upsert: true });
  }

  const services = [
    { name: "Khám tổng quát", description: "Khám lâm sàng tổng quát.", price: 250000, durationMinutes: 30 },
    { name: "Tư vấn chuyên khoa", description: "Tư vấn với bác sĩ chuyên khoa.", price: 350000, durationMinutes: 30 },
  ];
  for (const service of services) {
    await Service.updateOne({ name: service.name }, { $setOnInsert: service }, { upsert: true });
  }

  if (env.adminPhone && env.adminPassword) {
    const existing = await User.findOne({ phone: env.adminPhone });
    if (!existing) {
      await User.register(new User({ name: "Clinic Administrator", phone: env.adminPhone, role: "ADMIN" }), env.adminPassword);
    } else if (existing.role !== "ADMIN") {
      throw new Error("ADMIN_PHONE is already used by a non-admin account");
    }
  } else {
    console.warn("ADMIN_PHONE/ADMIN_PASSWORD are not set; no admin account was created.");
  }

  console.info("Clinic reference data seeded.");
  await mongoose.disconnect();
}

seed().catch(async (error: unknown) => {
  console.error("Unable to seed clinic database:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
