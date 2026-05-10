import "dotenv/config";
import { ActivityType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const cities = [
  ["Paris", "France", "Western Europe", 82, 99, "FR"],
  ["Tokyo", "Japan", "East Asia", 88, 98, "JP"],
  ["New York", "United States", "North America", 91, 97, "US"],
  ["Rome", "Italy", "Southern Europe", 74, 96, "IT"],
  ["Barcelona", "Spain", "Southern Europe", 70, 95, "ES"],
  ["London", "United Kingdom", "Western Europe", 89, 94, "GB"],
  ["Bangkok", "Thailand", "Southeast Asia", 45, 93, "TH"],
  ["Singapore", "Singapore", "Southeast Asia", 86, 92, "SG"],
  ["Dubai", "United Arab Emirates", "Middle East", 84, 91, "AE"],
  ["Sydney", "Australia", "Oceania", 83, 90, "AU"],
  ["Mumbai", "India", "South Asia", 38, 89, "IN"],
  ["Delhi", "India", "South Asia", 35, 88, "IN"],
  ["Jaipur", "India", "South Asia", 32, 87, "IN"],
  ["Goa", "India", "South Asia", 42, 86, "IN"],
  ["Istanbul", "Turkey", "Middle East", 48, 85, "TR"],
  ["Amsterdam", "Netherlands", "Western Europe", 78, 84, "NL"],
  ["Berlin", "Germany", "Western Europe", 69, 83, "DE"],
  ["Prague", "Czech Republic", "Central Europe", 52, 82, "CZ"],
  ["Vienna", "Austria", "Central Europe", 71, 81, "AT"],
  ["Zurich", "Switzerland", "Western Europe", 95, 80, "CH"],
  ["Lisbon", "Portugal", "Southern Europe", 57, 79, "PT"],
  ["Athens", "Greece", "Southern Europe", 55, 78, "GR"],
  ["Cairo", "Egypt", "North Africa", 34, 77, "EG"],
  ["Cape Town", "South Africa", "Southern Africa", 49, 76, "ZA"],
  ["Marrakesh", "Morocco", "North Africa", 37, 75, "MA"],
  ["Reykjavik", "Iceland", "Nordics", 93, 74, "IS"],
  ["Copenhagen", "Denmark", "Nordics", 86, 73, "DK"],
  ["Stockholm", "Sweden", "Nordics", 80, 72, "SE"],
  ["Oslo", "Norway", "Nordics", 94, 71, "NO"],
  ["Helsinki", "Finland", "Nordics", 76, 70, "FI"],
  ["Seoul", "South Korea", "East Asia", 68, 89, "KR"],
  ["Hong Kong", "China", "East Asia", 87, 88, "HK"],
  ["Taipei", "Taiwan", "East Asia", 56, 78, "TW"],
  ["Bali", "Indonesia", "Southeast Asia", 39, 91, "ID"],
  ["Hanoi", "Vietnam", "Southeast Asia", 30, 83, "VN"],
  ["Ho Chi Minh City", "Vietnam", "Southeast Asia", 32, 82, "VN"],
  ["Kuala Lumpur", "Malaysia", "Southeast Asia", 43, 80, "MY"],
  ["Phuket", "Thailand", "Southeast Asia", 46, 79, "TH"],
  ["Queenstown", "New Zealand", "Oceania", 72, 75, "NZ"],
  ["Auckland", "New Zealand", "Oceania", 70, 73, "NZ"],
  ["Toronto", "Canada", "North America", 76, 77, "CA"],
  ["Vancouver", "Canada", "North America", 79, 78, "CA"],
  ["Mexico City", "Mexico", "North America", 44, 82, "MX"],
  ["Cancun", "Mexico", "North America", 58, 81, "MX"],
  ["Rio de Janeiro", "Brazil", "South America", 46, 84, "BR"],
  ["Buenos Aires", "Argentina", "South America", 40, 76, "AR"],
  ["Lima", "Peru", "South America", 39, 72, "PE"],
  ["Cusco", "Peru", "South America", 36, 79, "PE"],
  ["Santiago", "Chile", "South America", 52, 70, "CL"],
  ["Cartagena", "Colombia", "South America", 38, 74, "CO"],
] as const;

const activityTemplates = [
  { type: ActivityType.SIGHTSEEING, name: "Old Town Walking Route", cost: 18, duration: 150 },
  { type: ActivityType.FOOD, name: "Local Market Tasting", cost: 36, duration: 120 },
  { type: ActivityType.CULTURE, name: "Museum and Heritage Pass", cost: 28, duration: 180 },
  { type: ActivityType.ADVENTURE, name: "Guided Outdoor Experience", cost: 64, duration: 240 },
  { type: ActivityType.SHOPPING, name: "Artisan District Browse", cost: 12, duration: 90 },
  { type: ActivityType.TRANSPORT, name: "Scenic Transit Day Pass", cost: 16, duration: 60 },
  { type: ActivityType.ACCOMMODATION, name: "Boutique Stay Preview", cost: 95, duration: 45 },
  { type: ActivityType.OTHER, name: "Sunset Photo Stop", cost: 8, duration: 75 },
];

function imageForCity(city: string) {
  return `https://source.unsplash.com/1200x800/?${encodeURIComponent(city)},travel`;
}

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@traveloop.dev" },
    update: {},
    create: {
      email: "admin@traveloop.dev",
      password: await bcrypt.hash("Admin12345", 12),
      firstName: "Traveloop",
      lastName: "Admin",
      role: "ADMIN",
      city: "Bengaluru",
      country: "India",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@traveloop.dev" },
    update: {},
    create: {
      email: "demo@traveloop.dev",
      password: await bcrypt.hash("Demo12345", 12),
      firstName: "Demo",
      lastName: "Traveler",
      city: "Mumbai",
      country: "India",
      bio: "Seeded demo account for local walkthroughs.",
    },
  });

  const cityRecords = [];

  for (const [name, country, region, costIndex, popularity, flag] of cities) {
    cityRecords.push(
      await prisma.city.upsert({
        where: { name_country: { name, country } },
        update: { region, costIndex, popularity, flag, imageUrl: imageForCity(name) },
        create: { name, country, region, costIndex, popularity, flag, imageUrl: imageForCity(name) },
      }),
    );
  }

  await prisma.catalogActivity.deleteMany();

  await prisma.catalogActivity.createMany({
    data: cityRecords.flatMap((city, cityIndex) =>
      activityTemplates.slice(0, 2 + (cityIndex % 3)).map((template, templateIndex) => ({
        cityId: city.id,
        type: template.type,
        name: `${city.name} ${template.name}`,
        cost: Math.max(0, template.cost + (city.costIndex - 50) * 0.4 + templateIndex * 3),
        duration: template.duration,
        description: `A curated ${template.type.toLowerCase()} option in ${city.name}, tuned for itinerary planning and budget previews.`,
        imageUrl: imageForCity(`${city.name} ${template.name}`),
        popularity: Math.max(1, city.popularity - templateIndex * 4),
      })),
    ),
  });

  const activityCount = await prisma.catalogActivity.count();
  console.log(`Seeded ${cityRecords.length} cities and ${activityCount} catalog activities.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
