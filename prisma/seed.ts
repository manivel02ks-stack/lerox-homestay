import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const rooms = [
  {
    name: "Suite-1 (2BHK)",
    description:
      "A spacious 2BHK suite accommodating up to 4 adults, located in the heart of Pondicherry. Features a fully equipped kitchen with RO water and cooking vessels, two well-furnished bedrooms with AC, a luxurious master bedroom with attached washroom, and a second bedroom with its own luxury washroom. Ideal for families and groups seeking a home-away-from-home experience.",
    price: 3500,
    maxGuests: 4,
    images: [
      "/images/suite-1/img_00.jpg",
      "/images/suite-1/img_01.jpg",
      "/images/suite-1/img_02.jpg",
      "/images/suite-1/img_04.jpg",
      "/images/suite-1/img_05.jpg",
      "/images/suite-1/img_12.jpg",
      "/images/suite-1/img_13.jpg",
      "/images/suite-1/img_14.jpg",
      "/images/suite-1/img_15.jpg",
      "/images/suite-1/img_16.jpg",
      "/images/suite-1/img_17.jpg",
      "/images/suite-1/img_18.jpg",
      "/images/suite-1/img_19.jpg",
      "/images/suite-1/img_20.jpg",
      "/images/suite-1/img_21.jpg",
    ],
    amenities: [
      "WiFi",
      "Air Conditioning",
      "TV",
      "Kitchen",
      "RO Drinking Water",
      "Cooking Vessels",
      "Inverter",
      "CCTV",
      "Free Parking",
      "24-Hour Service",
      "Luxury Washroom",
    ],
    isActive: true,
  },
  {
    name: "Suite-2 (2BHK + Dining Hall)",
    description:
      "A premium 2BHK suite with an exclusive Dining Hall, accommodating up to 4 adults. This suite features a beautifully decorated living room, separate dining area with dining table, two air-conditioned bedrooms, a modern kitchen, and stylish bathrooms. Perfect for families or groups wanting extra space and a premium stay experience in Pondicherry.",
    price: 4500,
    maxGuests: 4,
    images: [
      "/images/suite-2/img_00.jpg",
      "/images/suite-2/img_01.jpg",
      "/images/suite-2/img_02.jpg",
      "/images/suite-2/img_03.jpg",
      "/images/suite-2/img_04.jpg",
      "/images/suite-2/img_05.jpg",
      "/images/suite-2/img_09.jpg",
      "/images/suite-2/img_10.jpg",
      "/images/suite-2/img_11.jpg",
      "/images/suite-2/img_12.jpg",
      "/images/suite-2/img_14.jpg",
      "/images/suite-2/img_15.jpg",
      "/images/suite-2/img_16.jpg",
      "/images/suite-2/img_17.jpg",
      "/images/suite-2/img_18.jpg",
      "/images/suite-2/img_19.jpg",
      "/images/suite-2/img_22.jpg",
      "/images/suite-2/img_23.jpg",
      "/images/exterior/img_00.jpg",
      "/images/exterior/img_01.jpg",
    ],
    amenities: [
      "WiFi",
      "Air Conditioning",
      "TV",
      "Kitchen",
      "Dining Hall",
      "RO Drinking Water",
      "Refrigerator",
      "Inverter",
      "CCTV",
      "Free Parking",
      "24-Hour Service",
      "Luxury Washroom",
    ],
    isActive: true,
  },
];

async function main() {
  console.log("Seeding database...");

  // Delete existing rooms and bookings
  await prisma.booking.deleteMany({});
  await prisma.blockedDate.deleteMany({});
  await prisma.room.deleteMany({});

  console.log("Cleared existing rooms");

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@guesthouse.com" },
    update: {},
    create: {
      email: "admin@guesthouse.com",
      name: "Admin",
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log("Created admin user");

  // Create rooms
  for (const room of rooms) {
    await prisma.room.create({ data: room });
    console.log(`Created room: ${room.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
